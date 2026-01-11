
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { InternalEvent } from '../../types/internalEvent';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { getCurrentDate } from '../../services/helpers';

const DocumentInternalEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [event, setEvent] = useState<InternalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    actual_participants: 0,
    classes_participated: 0,
    achievements: '',
    challenges_faced: '',
    recommendations: ''
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'internal_events', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const eventData = { id: docSnap.id, ...docSnap.data() } as InternalEvent;
            setEvent(eventData);
            setFormData(prev => ({
            ...prev,
            actual_participants: eventData.expected_participants || 0
            }));
        }
      } catch (err) {
          console.error("Error fetching event", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Explicitly cast to File[] to ensure correct typing in the state
      const newFiles = Array.from(e.target.files) as File[];
      setPhotos(prev => [...prev, ...newFiles]);
      
      newFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotosPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotosPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !event || !user || !userProfile) return;

    if (formData.actual_participants <= 0) {
      setError('يرجى إدخال عدد المشاركين الفعلي');
      return;
    }
    if (!formData.achievements.trim()) {
      setError('يرجى إدخال ما تم إنجازه');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const photoUrls: string[] = [];
      // Fix: Explicitly check for storage initialization and cast photo to any to satisfy environment-specific type requirements for uploadBytes.
      if (!storage) throw new Error("Storage is not configured.");

      const filesToUpload: File[] = photos;
      for (const photo of filesToUpload) {
        const photoRef = ref(storage, `schools/${userProfile.school_id}/internal_events/${id}/${Date.now()}_${photo.name}`);
        // Fix: Use any to bypass potential shadowing or unknown inference issues with Blob/File in this environment.
        await uploadBytes(photoRef, photo as any);
        const url = await getDownloadURL(photoRef);
        photoUrls.push(url);
      }

      // FIX: Use null instead of undefined for optional fields to avoid Firestore error
      const documentation = {
        actual_participants: formData.actual_participants,
        classes_participated: formData.classes_participated,
        photos: photoUrls,
        achievements: formData.achievements,
        challenges_faced: formData.challenges_faced || null,
        recommendations: formData.recommendations || null,
        documented_at: getCurrentDate(),
        documented_by_uid: user.uid
      };

      await updateDoc(doc(db, 'internal_events', id), {
        status: 'documented',
        documentation: documentation,
        updated_date: getCurrentDate()
      });

      // Create next recurring event if applicable
      if (event.recurrence !== 'none' && event.recurrence_end_date) {
        const currentDate = new Date(event.date);
        let nextDate: Date;
        
        if (event.recurrence === 'weekly') {
          nextDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
        } else {
          nextDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        }

        const nextDateStr = nextDate.toISOString().split('T')[0];
        
        if (nextDateStr <= event.recurrence_end_date) {
            // Remove properties that shouldn't be copied
            const { id: _, documentation: __, status: ___, created_date: ____, updated_date: _____, ...eventBase } = event as any;
            
            await addDoc(collection(db, 'internal_events'), {
                ...eventBase,
                date: nextDateStr,
                status: 'scheduled',
                parent_event_id: event.parent_event_id || id,
                created_date: getCurrentDate(),
                updated_date: getCurrentDate()
            });
        }
      }

      navigate(`/school/internal-events/${id}`);
    } catch (err) {
      console.error('Error documenting event:', err);
      setError('حدث خطأ أثناء حفظ التوثيق');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SchoolLayout title="توثيق الفعالية">
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </SchoolLayout>
    );
  }

  if (!event) {
    return (
      <SchoolLayout title="خطأ">
        <Card className="p-8 text-center">
          <p className="text-gray-500">الفعالية غير موجودة</p>
        </Card>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="توثيق الفعالية">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">توثيق الفعالية</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{event.title} - {event.date}</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="العدد الفعلي للمشاركين"
                type="number"
                value={formData.actual_participants}
                onChange={(e) => setFormData({...formData, actual_participants: parseInt(e.target.value) || 0})}
                required
              />
              <Input
                label="عدد الفصول المشاركة"
                type="number"
                value={formData.classes_participated}
                onChange={(e) => setFormData({...formData, classes_participated: parseInt(e.target.value) || 0})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">
                صور التوثيق
              </label>
              <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-3 text-sm">
                ⚠️ تنبيه: يرجى عدم تصوير وجوه الطلاب - صور الأنشطة والنتائج فقط
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {photosPreviews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {photosPreviews.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <img src={preview} alt={`صورة ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Textarea
              label="ماذا تم إنجازه"
              value={formData.achievements}
              onChange={(e) => setFormData({...formData, achievements: e.target.value})}
              rows={4}
              required
              placeholder="اكتب وصفاً لما تم تحقيقه في هذه الفعالية..."
            />

            <Textarea
              label="التحديات والعوائق (اختياري)"
              value={formData.challenges_faced}
              onChange={(e) => setFormData({...formData, challenges_faced: e.target.value})}
              rows={2}
              placeholder="هل واجهتم أي صعوبات؟"
            />

            <Textarea
              label="توصيات للمستقبل (اختياري)"
              value={formData.recommendations}
              onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
              rows={2}
              placeholder="ما الذي يمكن تحسينه في المرات القادمة؟"
            />

            {event.points_enabled && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <span className="text-purple-700 font-medium">
                  🏆 عند حفظ التوثيق، ستحصل المدرسة على {event.points_value} نقطة
                </span>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t dark:border-gray-700">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                إلغاء
              </Button>
              <Button type="submit" isLoading={submitting}>
                {submitting ? 'جاري الحفظ...' : 'حفظ التوثيق'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </SchoolLayout>
  );
};

export default DocumentInternalEvent;
