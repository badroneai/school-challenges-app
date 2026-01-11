
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from '../../components/Layout/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import BottomSheet from '../../components/ui/BottomSheet';
import { AgencyService, Initiative, ApprovalStatus, InitiativeStatus, Agency, School } from '../../types';
import { FaCheck, FaTimes, FaList, FaBullhorn, FaInfoCircle, FaSchool, FaClipboardList, FaChevronLeft, FaClock, FaUsers } from 'react-icons/fa';

const ApproveOfferings: React.FC = () => {
  const [services, setServices] = useState<(AgencyService & { agency_name?: string })[]>([]);
  const [initiatives, setInitiatives] = useState<(Initiative & { agency_name?: string })[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'initiatives'>('services');
  
  // Modal & Sheet State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string, type: 'service' | 'initiative', title: string, description?: string, agency_name?: string, duration?: number, capacity?: number } | null>(null);
  
  const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const agencySnap = await getDocs(collection(db, 'agencies'));
      const agencyMap: Record<string, string> = {};
      agencySnap.forEach(doc => { agencyMap[doc.id] = (doc.data() as Agency).name_ar; });

      const schoolsSnap = await getDocs(collection(db, 'schools'));
      setSchools(schoolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as School)));

      const servicesQuery = query(collection(db, 'agency_services'), where('approval_status', '==', ApprovalStatus.PENDING));
      const servicesSnap = await getDocs(servicesQuery);
      setServices(servicesSnap.docs.map(doc => {
        const data = doc.data() as AgencyService;
        return { id: doc.id, ...data, agency_name: agencyMap[data.agency_id] };
      }));

      const initiativesQuery = query(collection(db, 'initiatives'), where('status', '==', InitiativeStatus.PENDING_APPROVAL));
      const initiativesSnap = await getDocs(initiativesQuery);
      setInitiatives(initiativesSnap.docs.map(doc => {
        const data = doc.data() as Initiative;
        return { id: doc.id, ...data, agency_name: agencyMap[data.agency_id] };
      }));
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleRowClick = (item: any, type: 'service' | 'initiative') => {
      setSelectedItem({ 
          id: item.id, 
          type, 
          title: item.title, 
          description: item.description, 
          agency_name: item.agency_name,
          duration: item.duration_minutes,
          capacity: item.max_capacity || item.capacity
      });
      setIsSheetOpen(true);
  };

  const handleOpenApprove = () => {
    setTargetType('ALL');
    setSelectedSchoolIds([]);
    setIsSheetOpen(false);
    setIsModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedItem) return;
    setProcessing(true);
    try {
      const collectionName = selectedItem.type === 'service' ? 'agency_services' : 'initiatives';
      const docRef = doc(db, collectionName, selectedItem.id);
      const targetData = targetType === 'ALL' ? ['ALL'] : selectedSchoolIds;
      const updateData: any = { target_schools: targetData };

      if (selectedItem.type === 'service') updateData.approval_status = ApprovalStatus.APPROVED;
      else updateData.status = InitiativeStatus.APPROVED;

      await updateDoc(docRef, updateData);
      setIsModalOpen(false);
      fetchData();
    } catch (error) { console.error(error); } 
    finally { setProcessing(false); }
  };

  const handleReject = async () => {
    if (!selectedItem || !window.confirm("هل أنت متأكد من رفض هذا العنصر؟")) return;
    try {
      const collectionName = selectedItem.type === 'service' ? 'agency_services' : 'initiatives';
      const docRef = doc(db, collectionName, selectedItem.id);
      const updateData: any = {};
      if (selectedItem.type === 'service') updateData.approval_status = ApprovalStatus.REJECTED;
      else updateData.status = InitiativeStatus.REJECTED;
      await updateDoc(docRef, updateData);
      setIsSheetOpen(false);
      fetchData();
    } catch (error) { console.error(error); }
  };

  const toggleSchoolSelection = (schoolId: string) => {
    setSelectedSchoolIds(prev => prev.includes(schoolId) ? prev.filter(id => id !== schoolId) : [...prev, schoolId]);
  };

  return (
    <AdminLayout title="اعتماد الخدمات والفرص">
      <div className="flex gap-2 mb-8 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <button onClick={() => setActiveTab('services')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${activeTab === 'services' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <span>الخدمات ({services.length})</span>
          <FaList />
        </button>
        <button onClick={() => setActiveTab('initiatives')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${activeTab === 'initiatives' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <span>المبادرات ({initiatives.length})</span>
          <FaBullhorn />
        </button>
      </div>

      {loading ? <div className="py-20 flex justify-center"><Spinner /></div> : (
        <div className="space-y-2.5">
          {(activeTab === 'services' ? services : initiatives).length === 0 ? (
            <EmptyState icon={activeTab === 'services' ? <FaClipboardList /> : <FaBullhorn />} title="لا توجد طلبات معلقة" />
          ) : (
            (activeTab === 'services' ? services : initiatives).map(item => (
                <div key={item.id} onClick={() => handleRowClick(item, activeTab === 'services' ? 'service' : 'initiative')} className="flex items-center gap-4 p-4 md:p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-slate-700 active:scale-[0.98] transition-all cursor-pointer group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${activeTab === 'services' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                        {activeTab === 'services' ? <FaList size={22}/> : <FaBullhorn size={22}/>}
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.agency_name}</span>
                        <h4 className="font-black text-slate-900 dark:text-white text-lg truncate mt-0.5">{item.title}</h4>
                        <div className="hidden md:block text-sm text-slate-500 mt-2 line-clamp-1 font-bold">{item.description}</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">قيد المراجعة</span>
                        </div>
                        <FaChevronLeft className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={14} />
                    </div>
                </div>
            ))
          )}
        </div>
      )}

      {/* Mobile Bottom Sheet Actions */}
      <BottomSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        title="مراجعة العرض"
        footer={
            <div className="grid grid-cols-2 gap-3 w-full">
                <Button onClick={handleOpenApprove} className="flex-1 rounded-2xl bg-emerald-600 py-4 font-black flex items-center justify-center gap-2">
                    <FaCheck /> اعتماد وتوجيه
                </Button>
                <Button onClick={handleReject} variant="danger" className="flex-1 rounded-2xl py-4 font-black flex items-center justify-center gap-2">
                    <FaTimes /> رفض
                </Button>
            </div>
        }
      >
        {selectedItem && (
            <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">{selectedItem.agency_name}</p>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-tight">{selectedItem.title}</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed italic">"{selectedItem.description}"</p>
                </div>
                <div className="grid grid-cols-2 gap-4 px-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">السعة الطلابية</span>
                        <span className="text-sm font-black text-slate-800 flex items-center gap-2">{selectedItem.capacity} طالب <FaUsers className="text-indigo-400"/></span>
                    </div>
                    {selectedItem.duration && (
                        <div className="flex flex-col gap-1 text-left">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المدة التقديرية</span>
                            <span className="text-sm font-black text-slate-800 flex items-center gap-2 justify-end">{selectedItem.duration} دقيقة <FaClock className="text-indigo-400"/></span>
                        </div>
                    )}
                </div>
            </div>
        )}
      </BottomSheet>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="نطاق التوجيه والاعتماد">
        <div className="space-y-6 text-right">
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <FaInfoCircle className="text-indigo-500 mt-1 shrink-0" />
            <p className="text-xs text-indigo-900 font-bold leading-relaxed">حدد المدارس التي سيظهر لها هذا العرض في لوحة التحكم الخاصة بها.</p>
          </div>
          <div className="flex gap-4">
              <button onClick={() => setTargetType('ALL')} className={`flex-1 p-4 border-2 rounded-2xl cursor-pointer text-center transition-all ${targetType === 'ALL' ? 'bg-indigo-600 border-indigo-600 text-white font-black' : 'bg-slate-50 border-slate-100 text-slate-400 font-bold'}`}>كافة المدارس</button>
              <button onClick={() => setTargetType('SPECIFIC')} className={`flex-1 p-4 border-2 rounded-2xl cursor-pointer text-center transition-all ${targetType === 'SPECIFIC' ? 'bg-indigo-600 border-indigo-600 text-white font-black' : 'bg-slate-50 border-slate-100 text-slate-400 font-bold'}`}>مدارس محددة</button>
          </div>
          {targetType === 'SPECIFIC' && (
              <div className="max-h-60 overflow-y-auto border-2 border-slate-50 rounded-[1.5rem] p-4 bg-slate-50/50">
                {schools.map(school => (
                  <label key={school.id} className="flex items-center p-3 hover:bg-white rounded-xl cursor-pointer transition-colors mb-1">
                    <input type="checkbox" className="ml-3 h-5 w-5 text-indigo-600 rounded-lg border-slate-300 shadow-sm" checked={selectedSchoolIds.includes(school.id)} onChange={() => toggleSchoolSelection(school.id)} />
                    <span className="text-sm font-black text-slate-700">{school.name_ar}</span>
                  </label>
                ))}
              </div>
          )}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="rounded-xl px-8 font-bold">إلغاء</Button>
            <Button onClick={handleConfirmApprove} isLoading={processing} className="rounded-xl px-12 font-black shadow-xl shadow-indigo-500/20 bg-indigo-600">تأكيد ونشر</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default ApproveOfferings;