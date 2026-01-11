
import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from '../../components/Layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import BottomSheet from '../../components/ui/BottomSheet';
import Button from '../../components/ui/Button';
import { FaCheck, FaTimes, FaSyncAlt, FaPrint, FaSchool, FaUserTie, FaInbox, FaFilter, FaChevronLeft, FaClock } from 'react-icons/fa';
import OfficialLetterModal from '../../components/ui/OfficialLetterModal';
import ApprovalDecisionModal from '../../components/ui/ApprovalDecisionModal';

interface RequestItem {
  id: string;
  school_id: string;
  agency_name: string;
  topic: string;
  suggested_dates: string[];
  status: string;
  created_date: string;
  school_name?: string;
}

const RequestsList: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [schoolNames, setSchoolNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Sheet & Modals State
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolsSnap = await getDocs(collection(db, 'schools'));
        const schoolsMap: Record<string, string> = {};
        schoolsSnap.forEach(doc => { schoolsMap[doc.id] = doc.data().name_ar; });
        setSchoolNames(schoolsMap);

        const reqSnap = await getDocs(collection(db, 'event_requests'));
        const reqList = reqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RequestItem));
        reqList.sort((a, b) => b.created_date.localeCompare(a.created_date));
        setRequests(reqList);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
        await updateDoc(doc(db, 'event_requests', id), { status: newStatus });
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
        setIsSheetOpen(false);
    } catch (error) { console.error(error); } 
    finally { setActionLoading(null); }
  };

  const handleRowClick = (req: RequestItem) => {
    setSelectedRequest(req);
    setIsSheetOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'pending': return <Badge variant="warning">قيد الانتظار</Badge>;
        case 'approved': return <Badge variant="indigo" className="gap-1"><span>معتمد</span> <FaUserTie size={8} /></Badge>;
        case 'delegated_to_school': return <Badge variant="teal" className="gap-1"><span>مفوض</span> <FaSchool size={8} /></Badge>;
        case 'sent': return <Badge variant="indigo">مرسل للجهة</Badge>;
        case 'rejected': return <Badge variant="error">مرفوض</Badge>;
        case 'entity_approved': return <Badge variant="success">وافقت الجهة</Badge>;
        default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="طلبات الجهات الخارجية">
       <div className="flex justify-between items-center mb-6 px-1">
         <p className="text-slate-500 font-medium text-xs md:text-sm">إدارة مراسلات المدارس مع الشركاء</p>
         <button className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600 active:scale-90 transition-transform border border-slate-100 dark:border-slate-700">
           <FaFilter size={14} />
         </button>
       </div>

       {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
       ) : requests.length === 0 ? (
          <EmptyState icon={<FaInbox />} title="لا توجد طلبات" />
       ) : (
          <div className="space-y-3">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-800 shadow-sm rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-700">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <th className="px-6 py-4 font-black text-slate-800 dark:text-slate-200 text-xs">المدرسة</th>
                            <th className="px-6 py-4 font-black text-slate-800 dark:text-slate-200 text-xs">الموضوع</th>
                            <th className="px-6 py-4 font-black text-slate-800 dark:text-slate-200 text-xs">الحالة</th>
                            <th className="px-6 py-4 font-black text-slate-800 dark:text-slate-200 text-xs text-center">إجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                        {requests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => handleRowClick(req)}>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 dark:text-white text-sm">{schoolNames[req.school_id] || req.school_id}</div>
                                    <div className="text-[10px] text-slate-400 font-black">{req.created_date}</div>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-600 max-w-[200px] truncate">{req.topic}</td>
                                <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                                <td className="px-6 py-4 text-center"><FaChevronLeft className="mx-auto text-slate-200" size={10}/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Native-Style List View */}
            <div className="md:hidden space-y-2">
                {requests.map(req => (
                    <div 
                        key={req.id} 
                        onClick={() => handleRowClick(req)}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700 active:scale-[0.98] transition-all"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                            <FaSchool size={20} />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                            <h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{schoolNames[req.school_id] || 'مدرسة'}</h4>
                            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                                <FaClock size={8} /> {req.created_date}
                            </p>
                            <p className="text-[11px] text-indigo-600 font-black truncate mt-1">{req.topic}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(req.status)}
                            <FaChevronLeft className="text-slate-300" size={10} />
                        </div>
                    </div>
                ))}
            </div>
          </div>
       )}

       {/* Native Mobile Bottom Sheet */}
       <BottomSheet 
            isOpen={isSheetOpen} 
            onClose={() => setIsSheetOpen(false)} 
            title="تفاصيل وإجراءات الطلب"
            footer={selectedRequest?.status === 'pending' ? (
                <div className="grid grid-cols-2 gap-3 w-full">
                    <Button onClick={() => { setIsSheetOpen(false); setIsDecisionModalOpen(true); }} className="flex-1 rounded-2xl bg-emerald-600 py-4 font-black">اعتماد الطلب</Button>
                    <Button onClick={() => handleStatusUpdate(selectedRequest!.id, 'rejected')} variant="secondary" className="flex-1 rounded-2xl text-rose-600 border-rose-100 py-4 font-black">رفض الطلب</Button>
                </div>
            ) : (
                <div className="space-y-3">
                    <Button onClick={() => { setIsSheetOpen(false); setIsDecisionModalOpen(true); }} className="w-full rounded-2xl bg-indigo-600 py-4 font-black flex items-center justify-center gap-2">
                        <span>تغيير حالة الاعتماد</span>
                        <FaSyncAlt size={12} />
                    </Button>
                    {['approved', 'sent', 'entity_approved'].includes(selectedRequest?.status || '') && (
                        <Button onClick={() => { setIsSheetOpen(false); setIsLetterModalOpen(true); }} variant="secondary" className="w-full rounded-2xl border-2 py-4 font-black flex items-center justify-center gap-2 text-indigo-600">
                            <span>معاينة الخطاب الرسمي</span>
                            <FaPrint size={14} />
                        </Button>
                    )}
                </div>
            )}
       >
           {selectedRequest && (
               <div className="space-y-6">
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-2">موضوع الطلب</p>
                       <p className="text-lg font-black text-slate-800 dark:text-white leading-relaxed">{selectedRequest.topic}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الجهة المطلوبة</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-300">{selectedRequest.agency_name}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">تاريخ الطلب</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-300">{selectedRequest.created_date}</p>
                        </div>
                   </div>
               </div>
           )}
       </BottomSheet>

       {isLetterModalOpen && selectedRequest && (
           <OfficialLetterModal 
               isOpen={isLetterModalOpen} 
               onClose={() => setIsLetterModalOpen(false)} 
               data={{...selectedRequest, schoolName: schoolNames[selectedRequest.school_id]}} 
           />
       )}
       <ApprovalDecisionModal 
           isOpen={isDecisionModalOpen} 
           onClose={() => setIsDecisionModalOpen(false)} 
           onConfirm={(mode) => handleStatusUpdate(selectedRequest!.id, mode === 'central' ? 'approved' : 'delegated_to_school')} 
       />
    </AdminLayout>
  );
};

export default RequestsList;