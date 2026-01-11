
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { InternalEvent, EVENT_STATUS_LABELS, EVENT_STATUS_COLORS, EVENT_TYPE_LABELS, EVENT_CATEGORY_LABELS } from '../../types/internalEvent';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { getCurrentDate } from '../../services/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { FaCheckCircle, FaCamera, FaClock, FaMapMarkerAlt, FaUsers, FaTrophy } from 'react-icons/fa';

const InternalEventDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { userProfile } = useAuth();
    const [event, setEvent] = useState<InternalEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

    useEffect(() => {
        if (!id || !userProfile?.school_id) return;
        const fetchEvent = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'internal_events', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as InternalEvent;
                    setEvent(data);
                    
                    if (data.documentation?.photos && storage) {
                        const urls = await Promise.all(
                            data.documentation.photos.map(path => getDownloadURL(ref(storage, path)))
                        );
                        setExistingPhotos(urls);
                    }
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, userProfile]);

    const handleStatusUpdate = async (newStatus: InternalEvent['status']) => {
        if (!event) return;
        setActionLoading(true);
        try {
            await updateDoc(doc(db, 'internal_events', event.id), {
                status: newStatus,
                updated_date: getCurrentDate()
            });
            setEvent({...event, status: newStatus});
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <SchoolLayout title="تفاصيل الفعالية"><Spinner /></SchoolLayout>;
    if (!event) return <SchoolLayout title="خطأ"><p>الفعالية غير موجودة</p></SchoolLayout>;

    const isDocumented = event.status === 'documented';

    return (
        <SchoolLayout title={event.title}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h1>
                                <div className="flex gap-2">
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-2 py-1 rounded">
                                        {EVENT_TYPE_LABELS[event.type]}
                                    </span>
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-2 py-1 rounded">
                                        {EVENT_CATEGORY_LABELS[event.category]}
                                    </span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold bg-${EVENT_STATUS_COLORS[event.status]}-100 text-${EVENT_STATUS_COLORS[event.status]}-800`}>
                                {EVENT_STATUS_LABELS[event.status]}
                            </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line leading-relaxed">
                            {event.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 border-t dark:border-gray-700 pt-4 text-sm">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FaClock className="ml-2 text-teal-500" />
                                {event.date} | {event.start_time} - {event.end_time}
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FaMapMarkerAlt className="ml-2 text-teal-500" />
                                {event.location}
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FaUsers className="ml-2 text-teal-500" />
                                {event.target_audience === 'all' ? 'جميع الطلاب' : `صفوف: ${event.target_grades?.join(', ')}`}
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FaTrophy className="ml-2 text-teal-500" />
                                {event.points_enabled ? `${event.points_value} نقطة` : 'لا يوجد نقاط'}
                            </div>
                        </div>
                    </Card>

                    {isDocumented && (
                        <Card className="border-t-4 border-green-500">
                            <h2 className="text-xl font-bold mb-4 flex items-center text-green-700 dark:text-green-400">
                                <FaCheckCircle className="ml-2" /> تقرير التوثيق
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">أبرز الإنجازات:</p>
                                    <p className="font-medium">{event.documentation?.achievements}</p>
                                </div>
                                <div className="flex justify-between dark:text-gray-200">
                                    <p><strong>عدد المشاركين الفعلي:</strong> {event.documentation?.actual_participants}</p>
                                    <p><strong>عدد الفصول:</strong> {event.documentation?.classes_participated}</p>
                                </div>
                                
                                {existingPhotos.length > 0 && (
                                    <div>
                                        <p className="font-bold mb-2 dark:text-gray-200">صور التوثيق:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {existingPhotos.map((url, idx) => (
                                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block">
                                                    <img 
                                                      src={url} 
                                                      loading="lazy"
                                                      width={96}
                                                      height={96}
                                                      className="w-24 h-24 object-cover rounded border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:opacity-75" 
                                                      alt={`توثيق الفعالية ${idx + 1}`} 
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {event.status === 'completed' && !isDocumented && (
                        <Card className="border-t-4 border-orange-500 text-center py-8">
                            <FaCamera className="mx-auto text-4xl text-orange-400 mb-4" />
                            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">الفعالية مكتملة وجاهزة للتوثيق</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                لتوثيق الإنجازات واحتساب النقاط للمدرسة، يرجى تعبئة نموذج التوثيق وإرفاق الصور.
                            </p>
                            <Link to={`/school/internal-events/${event.id}/document`}>
                                <Button className="px-8">البدء بالتوثيق</Button>
                            </Link>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <Card>
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">تحديث الحالة</h3>
                        <div className="flex flex-col gap-2">
                            {event.status === 'scheduled' && <Button onClick={() => handleStatusUpdate('in_progress')} isLoading={actionLoading}>بدء التنفيذ</Button>}
                            {event.status === 'in_progress' && <Button onClick={() => handleStatusUpdate('completed')} isLoading={actionLoading}>إكمال الفعالية</Button>}
                            {isDocumented && <p className="text-center text-green-600 font-bold bg-green-50 dark:bg-green-900/20 p-2 rounded">تم التوثيق واحتساب النقاط</p>}
                        </div>
                    </Card>
                </div>
            </div>
        </SchoolLayout>
    );
};

export default InternalEventDetails;
