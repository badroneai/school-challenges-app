
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { collection, getDocs, addDoc, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Agency, AgencyService, EventRequest, EventStatus, EventType, GradeLevel, ApprovalStatus } from '../../types';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { getCurrentDate } from '../../services/helpers';
import { EVENT_TYPES, GRADE_LEVELS } from '../../constants';
import Spinner from '../../components/ui/Spinner';
import { FaInfoCircle, FaCalendarAlt, FaLock, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

const NewEvent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const { showToast } = useToast(); // Corrected hook usage
  
  const urlServiceId = searchParams.get('serviceId');
  const urlAgencyId = searchParams.get('agencyId');

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyServices, setAgencyServices] = useState<AgencyService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [eventData, setEventData] = useState<Partial<EventRequest>>({
    event_type: EventType.OTHER,
    audience: [],
    estimated_students_count: 50,
    duration_minutes: 45,
    status: EventStatus.DRAFT,
    notes: '',
    preferred_slots: [
      { date: '', start_time: '09:00', end_time: '10:00' },
      { date: '', start_time: '10:00', end_time: '11:00' },
      { date: '', start_time: '11:00', end_time: '12:00' },
    ]
  });

  const [selectedServiceId, setSelectedServiceId] = useState<string>(urlServiceId || '');
  const isTemplateMode = !!selectedServiceId;

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      if (!userProfile?.school_id || !db) {
        setPageLoading(false);
        return;
      }
      try {
        const agencySnapshot = await getDocs(query(collection(db, 'agencies'), where('is_active', '==', true)));
        setAgencies(agencySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agency)));

        const schoolDoc = await getDoc(doc(db, 'schools', userProfile.school_id));
        if (schoolDoc.exists()) {
            setEventData(prev => ({...prev, location: schoolDoc.data().name_ar}));
        }

        if (urlAgencyId) setEventData(prev => ({ ...prev, agency_id: urlAgencyId }));
      } catch (error) {
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [userProfile, urlAgencyId]);

  useEffect(() => {
    const fetchServices = async () => {
      if (!eventData.agency_id || !db) return;
      setLoadingServices(true);
      try {
        const snap = await getDocs(query(collection(db, 'agency_services'), where('agency_id', '==', eventData.agency_id), where('approval_status', '==', ApprovalStatus.APPROVED)));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgencyService));
        setAgencyServices(list);

        if (urlServiceId) {
            const service = list.find(s => s.id === urlServiceId);
            if (service) fillState(service);
        }
      } catch (e) { console.error(e); }
      finally { setLoadingServices(false); }
    };
    fetchServices();
  }, [eventData.agency_id, urlServiceId]);

  const fillState = (service: AgencyService) => {
    setEventData(prev => ({
        ...prev,
        topic: service.title,
        duration_minutes: service.duration_minutes,
        estimated_students_count: service.max_capacity,
        audience: service.target_audience,
        service_id: service.id,
        event_type: EventType.OTHER 
    }));
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = agencyServices.find(s => s.id === serviceId);
    if (service) fillState(service);
    else setEventData(prev => ({ ...prev, service_id: undefined, topic: '', audience: [], estimated_students_count: 50, duration_minutes: 45 }));
  };
  
  const handleSlotChange = (index: number, field: string, value: string) => {
    const newSlots = [...(eventData.preferred_slots || [])];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setEventData({ ...eventData, preferred_slots: newSlots });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData.agency_id || !eventData.location || !eventData.preferred_slots?.[0].date) {
        showToast('يرجى تحديد الموعد وموقع التنفيذ.', 'warning');
        return;
    }
    setLoading(true);
    try {
        const agencyName = agencies.find(a => a.id === eventData.agency_id)?.name_ar || '';
        const docRef = await addDoc(collection(db, 'event_requests'), {
            ...eventData,
            agency_name: agencyName, 
            school_id: userProfile?.school_id,
            school_name: userProfile?.display_name.split(' - ')[0] || 'المدرسة',
            created_by_uid: userProfile?.uid,
            created_date: getCurrentDate(),
            status: EventStatus.SENT,
        });
        showToast("تم إرسال الطلب بنجاح!", "success");
        navigate(`/school/events/${docRef.id}`);
    } catch (error) {
        showToast('فشل في إرسال الطلب.', 'error');
    } finally {
        setLoading(false);
    }
  };
  
  if (pageLoading) return <SchoolLayout title="طلب فعالية"><Spinner /></SchoolLayout>;

  return (
    <SchoolLayout title="تأكيد تفاصيل طلب الخدمة">
      {isTemplateMode && (
          <div className="p-5 mb-8 bg-teal-50 border-r-4 border-teal-500 text-teal-800 rounded-xl shadow-sm flex items-center gap-4 animate-in fade-in">
            <FaShieldAlt size={24} className="text-teal-600" />
            <div>
                <h4 className="font-black text-sm">قالب خدمة معتمدة (محمي)</h4>
                <p className="text-xs font-bold opacity-80">بيانات المحتوى والجمهور ثابتة. يرجى تزويدنا بالمواعيد المتاحة بمدرستكم فقط.</p>
            </div>
          </div>
      )}

      <Card className="rounded-[2.5rem] border-none shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-10 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border">
            <Select label="1. الجهة الشريكة" value={eventData.agency_id || ''} onChange={e => setEventData({ ...eventData, agency_id: e.target.value })} required disabled={isTemplateMode}>
              <option value="">-- اختر الجهة --</option>
              {agencies.map(agency => <option key={agency.id} value={agency.id}>{agency.name_ar}</option>)}
            </Select>
            <Select label="2. الخدمة المطلوبة" value={selectedServiceId} onChange={e => handleServiceChange(e.target.value)} disabled={isTemplateMode}>
                <option value="">-- طلب مخصص --</option>
                {agencyServices.map(service => <option key={service.id} value={service.id}>{service.title}</option>)}
            </Select>
          </div>

          <div className="space-y-6 px-2">
              <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-black text-slate-800">محتوى الفعالية</h3>
                  {isTemplateMode && <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100"><FaLock size={8} /> القالب مقفل</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input label="موضوع الفعالية" value={eventData.topic || ''} required disabled={isTemplateMode} className={isTemplateMode ? "bg-slate-100 opacity-70" : ""} />
                 <Select label="تصنيف الفعالية" value={eventData.event_type} required disabled={isTemplateMode} className={isTemplateMode ? "bg-slate-100 opacity-70" : ""}>
                    {EVENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                 </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input label="العدد المقترح" type="number" value={eventData.estimated_students_count} required disabled={isTemplateMode} className={isTemplateMode ? "bg-slate-100 opacity-70" : ""} />
                 <Input label="المدة (دقيقة)" type="number" value={eventData.duration_minutes} required disabled={isTemplateMode} className={isTemplateMode ? "bg-slate-100 opacity-70" : ""} />
              </div>
          </div>
          
          <div className="space-y-8 pt-8 border-t-2 border-dashed border-slate-100 px-2">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><FaExclamationTriangle className="text-indigo-500" /> التنسيق اللوجستي (مطلوب)</h3>
              <Input label="مكان التنفيذ داخل المدرسة" value={eventData.location || ''} onChange={e => setEventData({ ...eventData, location: e.target.value })} placeholder="مثال: القاعة، الساحة" required className="font-bold border-indigo-100" />
              <div>
                <label className="block text-sm font-black mb-4 flex items-center gap-2 text-slate-900"><FaCalendarAlt className="text-indigo-500" /> المواعيد المقترحة</label>
                <div className="space-y-4">
                  {(eventData.preferred_slots || []).map((slot, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 bg-indigo-50/20 border border-indigo-50 rounded-[2rem] items-end">
                        <Input label={index === 0 ? "التاريخ المفضل" : ""} type="date" value={slot.date} onChange={e => handleSlotChange(index, 'date', e.target.value)} required={index === 0} />
                        <Input label={index === 0 ? "من الساعة" : ""} type="time" value={slot.start_time} onChange={e => handleSlotChange(index, 'start_time', e.target.value)} required={index === 0} />
                        <Input label={index === 0 ? "إلى الساعة" : ""} type="time" value={slot.end_time} onChange={e => handleSlotChange(index, 'end_time', e.target.value)} required={index === 0} />
                    </div>
                  ))}
                </div>
              </div>
              <Textarea label="ملاحظات إضافية" value={eventData.notes} onChange={e => setEventData({ ...eventData, notes: e.target.value })} className="font-bold" />
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)} className="rounded-2xl px-10 py-3.5">إلغاء</Button>
            <Button type="submit" isLoading={loading} className="px-16 py-4 font-black rounded-2xl bg-teal-600 hover:bg-teal-700 border-none shadow-xl shadow-teal-500/20">تأكيد وإرسال الطلب</Button>
          </div>
        </form>
      </Card>
    </SchoolLayout>
  );
};

export default NewEvent;
