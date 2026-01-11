
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { EventRequest, Agency, School, EventStatus } from '../../types';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { getEventStatusText, getStatusColor, EVENT_STATUSES } from '../../constants';
import { generateEventRequestPDF } from '../../services/pdfGenerator';
import { FaCopy, FaFilePdf, FaArrowRight, FaClock, FaMapMarkerAlt, FaUsers, FaBuilding, FaClipboardList, FaFileSignature } from 'react-icons/fa';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [event, setEvent] = useState<EventRequest | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const fetchData = async () => {
      setLoading(true);
      try {
        const eventDoc = await getDoc(doc(db, 'event_requests', id));
        if (eventDoc.exists()) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() } as EventRequest;
          if (userProfile?.school_id && eventData.school_id !== userProfile.school_id) { setLoading(false); return; }
          setEvent(eventData);
          const [agencySnap, schoolSnap] = await Promise.all([
              getDoc(doc(db, 'agencies', eventData.agency_id)),
              eventData.school_id ? getDoc(doc(db, 'schools', eventData.school_id)) : Promise.resolve(null)
          ]);
          if (agencySnap?.exists()) setAgency({ id: agencySnap.id, ...agencySnap.data() } as Agency);
          if (schoolSnap?.exists()) setSchool({ id: schoolSnap.id, ...schoolSnap.data() } as School);
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    if (userProfile) fetchData();
  }, [id, userProfile]);
  
  const handleStatusChange = async (newStatus: EventStatus) => {
      if(!id) return;
      setIsUpdating(true);
      try {
          await updateDoc(doc(db, 'event_requests', id), { status: newStatus });
          setEvent(prev => prev ? {...prev, status: newStatus} : null);
      } catch (error) { alert('خطأ في التحديث'); }
      finally { setIsUpdating(false); }
  };

  const generateWhatsappMessage = () => {
    if (!event || !agency || !school) return '';
    const slots = event.preferred_slots?.map((s, i) => `  ${i+1}. يوم ${new Date(s.date).toLocaleDateString('ar-SA', {weekday: 'long'})} الموافق ${s.date}، من الساعة ${s.start_time} إلى ${s.end_time}`) || [];
    const slotsText = slots.length > 0 ? slots.join('\n') : (event.suggested_dates?.join(' ، ') || 'تواصل معنا');
    return `السلام عليكم السادة/${agency.name_ar}\nالموضوع: طلب إقامة فعالية "${event.topic || event.event_type}"\nمدرسة ${school.name_ar}\nالمواعيد: ${slotsText}`.trim();
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(generateWhatsappMessage()).then(() => alert('تم النسخ')).catch(() => alert('فشل النسخ'));
  };

  if (loading) return <SchoolLayout title="تفاصيل التنسيق"><div className="py-20 flex justify-center"><Spinner /></div></SchoolLayout>;
  if (!event) return <SchoolLayout title="خطأ"><div className="py-20 text-center"><h2 className="font-black text-slate-400">الطلب غير موجود</h2><Button onClick={() => navigate('/school/agency-requests')} className="mt-4">العودة</Button></div></SchoolLayout>;

  const MetaItem = ({ label, value, icon: Icon }: any) => (
    <div className="py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <dt className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
          {Icon && <Icon className="text-indigo-500" size={10} />}
          {label}
      </dt>
      <dd className="text-sm font-black text-slate-800 dark:text-white">{value}</dd>
    </div>
  );

  return (
    <SchoolLayout title={`طلب: ${event.topic || event.event_type}`}>
        {/* Header Actions Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div className="text-right">
                <div className="flex items-center gap-3 mb-3">
                    <Badge variant="indigo">طلب تنفيذ خدمة</Badge>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${getStatusColor(event.status as any)}`}>{getEventStatusText(event.status as any)}</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{event.topic || event.event_type}</h1>
            </div>
            <div className="flex gap-3">
                <button onClick={() => navigate(-1)} className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><FaArrowRight /></button>
                <Button className="rounded-2xl px-8 py-4 font-black bg-white text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-50 shadow-sm flex items-center gap-3 transition-all active:scale-95" onClick={() => (event && agency && school) && generateEventRequestPDF(event, agency, school, userProfile?.email || '')}>
                    <span>الخطاب الرسمي (PDF)</span>
                    <FaFilePdf size={18} />
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Information Column */}
            <div className="lg:col-span-2 space-y-8">
                <Card className="rounded-[2.5rem] border-none shadow-sm p-10 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FaClipboardList /></div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">تفاصيل المحتوى والتنسيق</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><FaClock className="text-indigo-500" /> الوقت المفضل</p>
                            <p className="font-black text-slate-800 dark:text-slate-100">{event.suggested_dates?.[0] || 'يتم التنسيق'}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">المدة التقديرية: {event.duration_minutes} دقيقة</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-500" /> الموقع المعتمد</p>
                            <p className="font-black text-slate-800 dark:text-slate-100">{event.location || 'مقر المدرسة'}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">الجمهور: {event.estimated_students_count} طالب</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaFileSignature /> ملاحظات المنسق</p>
                        <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border-r-4 border-indigo-500">
                            <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-bold italic">"{event.notes || 'لا توجد ملاحظات إضافية'}"</p>
                        </div>
                    </div>
                </Card>

                {(event.status === 'entity_approved' && event.assigned_team) && (
                    <Card className="rounded-[2.5rem] border-none shadow-xl p-10 bg-emerald-600 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><FaUsers size={24} /></div>
                                <h2 className="text-2xl font-black">اعتماد فريق التنفيذ</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">المكلف بالتنفيذ:</p>
                                    <p className="text-xl font-black">{event.assigned_team}</p>
                                </div>
                                {event.entity_response_notes && (
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">ملاحظات الجهة:</p>
                                        <p className="text-sm font-bold leading-relaxed">{event.entity_response_notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Sidebar Metadata Column */}
            <div className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white dark:bg-slate-800">
                    <h3 className="text-xs font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <FaBuilding /> بيانات الجهة
                    </h3>
                    <dl className="text-right">
                        <MetaItem label="الجهة الشريكة" value={agency?.name_ar || 'غير محدد'} />
                        <MetaItem label="تاريخ تقديم الطلب" value={event.created_date} />
                        <MetaItem label="حالة التنسيق" value={getEventStatusText(event.status as any)} />
                    </dl>
                    <div className="mt-8">
                        <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">تحديث الحالة يدوياً</dt>
                        <Select label="" value={event.status} onChange={e => handleStatusChange(e.target.value as EventStatus)} disabled={isUpdating} className="rounded-xl border-slate-100 shadow-sm font-black text-xs">
                            {EVENT_STATUSES.map(s => <option key={s} value={s}>{getEventStatusText(s)}</option>)}
                        </Select>
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-xl p-10 bg-slate-900 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-black mb-6">سرعة التواصل</h2>
                        <Button className="w-full flex items-center justify-center gap-3 font-black py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl border-none shadow-lg transition-all active:scale-95" onClick={copyToClipboard}>
                           <span>نسخ رسالة الواتساب</span>
                           <FaCopy size={16} />
                        </Button>
                        <p className="text-[10px] text-slate-500 font-bold mt-4 leading-relaxed text-center italic">استخدم هذه الرسالة عند مراسلة منسق الجهة لتسهيل عملية ربط المواعيد.</p>
                    </div>
                </Card>
            </div>
        </div>
    </SchoolLayout>
  );
};

export default EventDetails;