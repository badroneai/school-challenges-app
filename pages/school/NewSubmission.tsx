
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { Challenge, GradeLevel } from '../../types';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import { getCurrentDate } from '../../services/helpers';
import { GRADE_LEVELS } from '../../constants';
import { FaFileUpload, FaTrash, FaExclamationCircle } from 'react-icons/fa';
import { submissionSchema } from '../../utils/validation';
import { z } from 'zod';

const NewSubmission: React.FC = () => {
  const { id: challengeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    grade_level: GradeLevel.PRIMARY,
    class_count: 0,
    student_count: 0,
    notes: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) return;
      const docSnap = await getDoc(doc(db, 'challenges', challengeId));
      if (docSnap.exists()) {
        setChallenge({ id: docSnap.id, ...docSnap.data() } as Challenge);
      }
      setLoading(false);
    };
    fetchChallenge();
  }, [challengeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      const previewsArray = filesArray.map((file: File) => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...previewsArray]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // استخدام Zod للتحقق من البيانات
    try {
      submissionSchema.parse({
        grade_level: formData.grade_level,
        class_count_participated: formData.class_count,
        student_count_participated: formData.student_count,
        evidence_notes: formData.notes
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0].toString()] = e.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    if (!user || !userProfile?.school_id || !challenge) return;

    setSubmitting(true);
    try {
      const submissionId = `${userProfile.school_id}_${challengeId}_${Date.now()}`;
      const imageUrls: string[] = [];

      for (const file of images) {
        const imageRef = ref(storage, `schools/${userProfile.school_id}/submissions/${submissionId}/${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      await setDoc(doc(db, 'submissions', submissionId), {
        id: submissionId,
        challenge_id: challengeId,
        school_id: userProfile.school_id,
        grade_level: formData.grade_level,
        class_count_participated: Number(formData.class_count),
        student_count_participated: Number(formData.student_count),
        evidence_notes: formData.notes,
        evidence_image_paths: imageUrls,
        date: getCurrentDate(),
        created_by_uid: user.uid
      });

      alert("تم تسجيل مشاركتكم بنجاح!");
      navigate('/school/challenges');
    } catch (error) {
      console.error("Submission error:", error);
      alert("حدث خطأ أثناء رفع البيانات.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SchoolLayout title="تحميل..."><Spinner /></SchoolLayout>;

  return (
    <SchoolLayout title={`المشاركة في تحدي: ${challenge?.title}`}>
      <div className="max-w-3xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select label="المرحلة الدراسية" value={formData.grade_level} onChange={e => setFormData({...formData, grade_level: e.target.value as GradeLevel})}>
                  {GRADE_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                </Select>
                {errors.grade_level && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle /> {errors.grade_level}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input label="عدد الفصول" type="number" value={formData.class_count} onChange={e => setFormData({...formData, class_count: parseInt(e.target.value)})} />
                  {errors.class_count_participated && <p className="text-red-500 text-xs mt-1">{errors.class_count_participated}</p>}
                </div>
                <div>
                  <Input label="عدد الطلاب" type="number" value={formData.student_count} onChange={e => setFormData({...formData, student_count: parseInt(e.target.value)})} />
                  {errors.student_count_participated && <p className="text-red-500 text-xs mt-1">{errors.student_count_participated}</p>}
                </div>
              </div>
            </div>

            <div>
              <Textarea label="وصف التنفيذ والأدلة" placeholder="اشرح باختصار كيف تم تنفيذ التحدي..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              {errors.evidence_notes && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle /> {errors.evidence_notes}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">صور التوثيق (أدلة)</label>
              <div className="flex flex-wrap gap-4 mb-4">
                {previews.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 group">
                    <img src={url} className="w-full h-full object-cover rounded-lg border shadow-sm" alt="Preview" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><FaTrash size={12} /></button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <FaFileUpload className="text-gray-400 text-xl" />
                  <span className="text-[10px] text-gray-500 mt-1">اضغط للرفع</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
              <Button variant="secondary" type="button" onClick={() => navigate(-1)}>إلغاء</Button>
              <Button type="submit" isLoading={submitting}>إرسال المشاركة</Button>
            </div>
          </form>
        </Card>
      </div>
    </SchoolLayout>
  );
};

export default NewSubmission;
