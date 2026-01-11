
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Agency, AgencyService, Initiative } from '../../types';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import RequestStepper from '../../components/ui/RequestStepper';
import OfficialLetterModal from '../../components/ui/OfficialLetterModal';
import { getCurrentDate } from '../../services/helpers';
import { FaFileAlt, FaHistory, FaExternalLinkAlt, FaBullhorn, FaListAlt, FaArrowRight, FaClock, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';

interface DetailedRequest {
  id: string;
  school_id: string;
  school_name?: string;
  agency_id: string;
  agency_name: string;
  topic: string;
  suggested_dates: string[];
  audience: string[];
  notes: string;
  status: string;
  created_date: string;
}

const AgencyRequest: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'initiatives' | 'services' | 'requests'>('initiatives');
  const [loading, setLoading] = useState(true);
  
  const [initiatives, setInitiatives] = useState<(Initiative & { agency_name?: string })[]>([]);
  const [services, setServices] = useState<(AgencyService & { agency_name?: string })[]>([]);
  const [requests, setRequests] = useState<DetailedRequest[]>([]);
  const [agenciesMap, setAgenciesMap] = useState<Record<string, string>>({});

  const [joiningInitiative, setJoiningInitiative] = useState<Initiative | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [selectedLetterRequest, setSelectedLetterRequest] = useState<any>(null);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

  useEffect(() => {
    if (!userProfile?.school_id || !db) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const agenciesSnap = await getDocs(collection(db, 'agencies'));
        const aMap: Record<string, string> = {};
        agenciesSnap.forEach(doc => { aMap[doc.id] = (doc.data() as Agency).name_ar; });
        setAgenciesMap(aMap);

        const initSnap = await getDocs(query(collection(db, 'initiatives'), where('status', '==', 'approved')));
        setInitiatives(initSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), agency_name: aMap[doc.data().agency_id] } as any)));

        const servSnap = await getDocs(query(collection(db, 'agency_services'), where('approval_status', '==', 'approved'), where('is_active', '==', true)));
        setServices(servSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), agency_name: aMap[doc.data().agency_id] } as any)));

        const unsubscribe = onSnapshot(query(collection(db, 'event_requests'), where('school_id', '==', userProfile.school_id)), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DetailedRequest));
            setRequests(list.sort((a, b) => b.created_date.localeCompare(a.created_date)));
        });
        setLoading(false);
        return () => unsubscribe();
      } catch (error) { setLoading(false); }
    };
    fetchData();
  }, [userProfile?.school_id]);

  const handleInitiativeClick = (init: Initiative) => { setJoiningInitiative(init); setIsJoinModalOpen(true); };
  const handleServiceClick = (service: AgencyService) => { navigate(`/school/events/new?serviceId=${service.id}&agencyId=${service.agency_id}`); };

  const confirmJoin = async () => {
    if (!joiningInitiative || !userProfile?.school_id || !user) return;
    setIsSubmittingJoin(true);
    try {
      await addDoc(collection(db, 'event_requests'), {
        school_id: userProfile.school_id,
        school_name: userProfile.display_name.split(' - ')[0],
        agency_id: joiningInitiative.agency_id,
        agency_name: agenciesMap[joiningInitiative.agency_id] || 'الجهة المختصة',
        topic: `انضمام لمبادرة: ${joiningInitiative.title}`,
        event_type: 'مشاركة مجتمعية',
        suggested_dates: [joiningInitiative.date],
        audience: joiningInitiative.target_audience,
        location: joiningInitiative.location || 'محدد من الشريك',
        estimated_students_count: joiningInitiative.capacity || 0,
        duration_minutes: 60,
        notes: 'انضمام فوري لمبادرة مجدولة مسبقاً.',
        status: 'sent',
        created_date: getCurrentDate(),
        created_by_uid: user.uid
      });
      showToast("تم تأكيد الانضمام بنجاح!", "success");
      setIsJoinModalOpen(false);
      setActiveTab('requests');
    } catch (error) { showToast("عذراً، فشل الانضمام.", "error"); }
    finally { setIsSubmittingJoin(false); }
  };

  return (
    <SchoolLayout title="مركز التنسيق والشراكات">
        <div className="flex flex-wrap gap-2 mb-10 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700">
            <button onClick={() => setActiveTab('initiatives')} className={`flex-1 py-4 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-3 transition-all ${activeTab === 'initiatives' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <span>المبادرات (موعد ثابت)</span>
                <FaBullhorn />
            </button>
            <button onClick={() => setActiveTab('services')} className={`flex-1 py-4 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-3 transition-all ${activeTab === 'services' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <span>الخدمات (حسب الطلب)</span>
                <FaListAlt />
            </button>
            <button onClick={() => setActiveTab('requests')} className={`flex-1 py-4 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-3 transition-all ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <span>سجل الطلبات</span>
                <FaHistory />
            </button>
        </div>

        {loading ? <div className="py-20 flex justify-center"><Spinner /></div> : (
            <div className="animate-in fade-in duration-500">
                {activeTab === 'initiatives' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
                        {initiatives.length === 0 ? <div className="md:col-span-full"><EmptyState icon={<FaBullhorn />} title="لا توجد مبادرات حالياً" /></div> : initiatives.map(init => (
                            <Card key={init.id} className="flex flex-col h-full border-none shadow-sm rounded-3xl ring-1 ring-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black bg-teal-50 text-teal-700 px-3 py-1 rounded-lg">{(init as any).agency_name}</span>
                                    <span className="text-[10px] font-bold text-slate-400">{init.date}</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{init.title}</h3>
                                <p className="text-slate-500 text-xs mb-6 line-clamp-3 font-bold flex-grow leading-relaxed">{init.description}</p>
                                <div className="bg-slate-50 p-4 rounded-2xl mb-4 space-y-2 border border-slate-100">
                                    <div className="text-[11px] font-black text-slate-700 flex items-center justify-between"><span>وقت البدء:</span> <span className="flex items-center gap-1.5">{init.start_time} <FaClock className="text-indigo-400" /></span></div>
                                    <div className="text-[11px] font-black text-slate-700 flex items-center justify-between"><span>الموقع:</span> <span className="flex items-center gap-1.5">{init.location || 'مقر الشريك'} <FaMapMarkerAlt className="text-indigo-400" /></span></div>
                                </div>
                                <Button onClick={() => handleInitiativeClick(init)} className="w-full justify-center rounded-2xl font-black py-4 bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20 border-none">
                                  <span>انضمام فوري للمبادرة</span>
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
                        {services.length === 0 ? <div className="md:col-span-full"><EmptyState icon={<FaListAlt />} title="لا توجد خدمات متاحة للطلب" /></div> : services.map(service => (
                            <Card key={service.id} className="border-none shadow-sm rounded-3xl ring-1 ring-slate-100 hover:ring-indigo-200 transition-all flex flex-col h-full">
                                <div className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full w-fit mb-4">{(service as any).agency_name}</div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">{service.title}</h3>
                                <p className="text-slate-500 text-xs mb-6 line-clamp-2 font-bold h-10 leading-relaxed">{service.description}</p>
                                <div className="mt-auto">
                                  <Button onClick={() => handleServiceClick(service)} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/10 border-none transition-all active:scale-95">
                                    <span>طلب تنفيذ هذه الخدمة</span>
                                    <FaArrowRight size={10} />
                                  </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="space-y-4">
                        {requests.length === 0 ? <EmptyState icon={<FaHistory />} title="السجل فارغ حالياً" /> : requests.map(req => (
                            <Card key={req.id} className="p-8 border-none shadow-sm rounded-[2.5rem] hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-black text-slate-900 text-xl">{req.agency_name}</span>
                                            <span className="text-[10px] text-slate-400 font-black bg-slate-50 px-3 py-1 rounded-xl">{req.created_date}</span>
                                        </div>
                                        <p className="text-sm font-black text-indigo-600 mb-8 border-r-4 border-indigo-500 pr-3">{req.topic}</p>
                                        <RequestStepper status={req.status} />
                                    </div>
                                    <div className="flex md:flex-col gap-3 shrink-0">
                                        {(['approved', 'delegated_to_school', 'sent', 'entity_approved'].includes(req.status)) && (
                                            <Button variant="secondary" onClick={() => { setSelectedLetterRequest(req); setIsLetterModalOpen(true); }} className="rounded-xl px-6 py-3 text-[10px] font-black bg-indigo-50 text-indigo-700 border-none flex items-center gap-2">
                                              <span>عرض الخطاب</span>
                                              <FaFileAlt />
                                            </Button>
                                        )}
                                        <Link to={`/school/events/${req.id}`} className="text-[10px] font-black text-teal-600 flex items-center justify-center gap-1.5 hover:underline px-6 py-2">
                                          <span>التفاصيل الكاملة</span>
                                          <FaExternalLinkAlt size={8} />
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        )}

        <Modal isOpen={isJoinModalOpen} onClose={() => !isSubmittingJoin && setIsJoinModalOpen(false)} title="تأكيد الانضمام للمبادرة">
            <div className="text-center p-4">
                <div className="bg-indigo-50 text-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"><FaCheckCircle /></div>
                <h3 className="font-black text-xl mb-3">هل ترغب مدرستكم بالمشاركة في:</h3>
                <p className="text-indigo-600 font-black text-2xl mb-8 leading-snug">"{joiningInitiative?.title}"</p>
                <div className="bg-slate-50 p-6 rounded-[2rem] mb-10 border-2 border-slate-100 text-right space-y-3">
                    <p className="text-sm font-black text-slate-800 flex items-center justify-between"><span>تاريخ التنفيذ:</span> <span className="flex items-center gap-2">{joiningInitiative?.date} <FaClock className="text-indigo-400" /></span></p>
                    <p className="text-sm font-black text-slate-800 flex items-center justify-between"><span>الموقع المعتمد:</span> <span className="flex items-center gap-2">{joiningInitiative?.location || 'مقر الشريك'} <FaMapMarkerAlt className="text-indigo-400" /></span></p>
                </div>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setIsJoinModalOpen(false)} disabled={isSubmittingJoin} className="flex-1 rounded-2xl py-4 font-black">إلغاء</Button>
                    <Button onClick={confirmJoin} isLoading={isSubmittingJoin} className="flex-1 rounded-2xl py-4 font-black bg-indigo-600 shadow-xl shadow-indigo-500/20 border-none">تأكيد الانضمام</Button>
                </div>
            </div>
        </Modal>

        {isLetterModalOpen && <OfficialLetterModal isOpen={isLetterModalOpen} onClose={() => setIsLetterModalOpen(false)} data={selectedLetterRequest} />}
    </SchoolLayout>
  );
};

export default AgencyRequest;
