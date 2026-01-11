
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Agency } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import BottomSheet from '../../components/ui/BottomSheet';
import { useToast } from '../../contexts/ToastContext';
import { FaEdit, FaTrash, FaPlus, FaBuilding, FaChevronLeft, FaTag, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const AgenciesManager: React.FC = () => {
  const { showToast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Custom Delete Confirmation State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mobile Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  const defaultAgencyState: Partial<Agency> = {
    name_ar: '',
    category: 'Government',
    description: '',
    is_active: true,
  };
  const [currentAgency, setCurrentAgency] = useState<Partial<Agency>>(defaultAgencyState);

  const categories = [
    { value: 'Government', label: 'حكومي' },
    { value: 'Non-Profit', label: 'غير ربحي / خيري' },
    { value: 'Private', label: 'قطاع خاص' },
  ];

  const fetchAgencies = async () => {
    setIsLoading(true);
    try {
      const agenciesCollection = collection(db, 'agencies');
      const agencySnapshot = await getDocs(agenciesCollection);
      const agencyList = agencySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agency));
      setAgencies(agencyList);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAgencies(); }, []);

  const handleOpenModal = (agency: Partial<Agency> | null = null) => {
    setCurrentAgency(agency || defaultAgencyState);
    setIsModalOpen(true);
    setIsSheetOpen(false);
  };

  const handleRowClick = (agency: Agency) => {
    if (window.innerWidth < 768) {
      setSelectedAgency(agency);
      setIsSheetOpen(true);
    }
  };

  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgency.name_ar) return;
    setSaving(true);
    try {
      if (currentAgency.id) {
        const agencyDoc = doc(db, 'agencies', currentAgency.id);
        const { id, ...dataToUpdate } = currentAgency;
        await updateDoc(agencyDoc, dataToUpdate);
        showToast('تم تحديث بيانات الجهة', 'success');
      } else {
        await addDoc(collection(db, 'agencies'), currentAgency);
        showToast('تمت إضافة الجهة بنجاح', 'success');
      }
      fetchAgencies();
      setIsModalOpen(false);
    } catch (error) { showToast('فشل الحفظ', 'error'); } 
    finally { setSaving(false); }
  };

  const confirmDeleteAgency = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAgencyToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteAgency = async () => {
    if (!agencyToDelete || !db) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'agencies', agencyToDelete));
      showToast('تم حذف الجهة بنجاح', 'info');
      fetchAgencies();
      setIsDeleteConfirmOpen(false);
      setIsSheetOpen(false);
    } catch (error) { showToast('فشل في الحذف', 'error'); }
    finally { setIsDeleting(false); setAgencyToDelete(null); }
  };

  return (
    <AdminLayout title="إدارة الجهات الخارجية">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-1 text-right">
        <p className="text-slate-500 font-bold text-xs md:text-sm">قاعدة بيانات الجهات الشريكة ({agencies.length}).</p>
        <Button onClick={() => handleOpenModal()} className="rounded-xl px-6 py-2.5 bg-indigo-600 font-black shadow-lg shadow-indigo-500/20 text-xs">
            <span>إضافة جهة جديدة</span>
            <FaPlus size={10} className="mr-2" />
        </Button>
      </div>

      <div className="space-y-3">
          <Card className="hidden md:block rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs">اسم الجهة</th>
                    <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs">التصنيف</th>
                    <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs">الحالة</th>
                    <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs text-center">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {isLoading ? (
                    <tr><td colSpan={4} className="text-center py-10"><Spinner /></td></tr>
                    ) : agencies.map(agency => (
                        <tr key={agency.id} className="hover:bg-slate-50/50 group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3"><div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><FaBuilding size={14} /></div><span className="font-black text-sm text-slate-900 dark:text-white">{agency.name_ar}</span></div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-bold">{categories.find(c => c.value === agency.category)?.label}</td>
                        <td className="px-6 py-4"><span className={`px-3 py-1 text-[10px] font-black rounded-lg ${agency.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{agency.is_active ? 'نشط' : 'غير نشط'}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleOpenModal(agency)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all" title="تعديل"><FaEdit size={16}/></button>
                            <button onClick={(e) => confirmDeleteAgency(e, agency.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all" title="حذف"><FaTrash size={16}/></button>
                          </div>
                        </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </Card>

          <div className="md:hidden space-y-2">
                {agencies.map(agency => (
                    <div key={agency.id} onClick={() => handleRowClick(agency)} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700 active:scale-[0.98] transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm"><FaBuilding size={20} /></div>
                        <div className="flex-1 min-w-0 text-right"><h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{agency.name_ar}</h4><p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5"><FaTag size={8} /> {categories.find(c => c.value === agency.category)?.label}</p></div>
                        <div className="flex flex-col items-end gap-2">{agency.is_active ? <div className="w-2 h-2 rounded-full bg-emerald-500"></div> : <div className="w-2 h-2 rounded-full bg-rose-500"></div>}<FaChevronLeft className="text-slate-300" size={10} /></div>
                    </div>
                ))}
            </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="تأكيد حذف الجهة الشريكة">
          <div className="text-center p-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><FaExclamationTriangle /></div>
              <h3 className="text-lg font-black text-slate-900 mb-2">هل تود إزالة هذه الجهة؟</h3>
              <p className="text-sm text-slate-500 mb-8 font-bold leading-relaxed">سيؤدي هذا لحذف كافة الخدمات والمبادرات المرتبطة بهذه الجهة من سجلات النظام. هل تود الاستمرار؟</p>
              <div className="grid grid-cols-2 gap-3">
                  <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)} className="rounded-xl py-3 font-bold">تراجع</Button>
                  <Button onClick={handleDeleteAgency} isLoading={isDeleting} className="bg-red-600 text-white rounded-xl py-3 font-black shadow-lg shadow-red-500/20">تأكيد الحذف</Button>
              </div>
          </div>
      </Modal>

      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="إجراءات الجهة الشريكة" footer={
            <div className="grid grid-cols-2 gap-3 w-full">
                <Button onClick={() => handleOpenModal(selectedAgency!)} className="flex-1 rounded-2xl bg-indigo-600 py-4 font-black flex items-center justify-center gap-2"><FaEdit /> تعديل</Button>
                <button onClick={(e) => confirmDeleteAgency(e as any, selectedAgency!.id)} className="flex-1 rounded-2xl py-4 font-black flex items-center justify-center gap-2 bg-red-50 text-red-600"><FaTrash /> حذف</button>
            </div>
        }>
        {selectedAgency && (
            <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 text-right"><h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">{selectedAgency.name_ar}</h3><div className="bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-lg text-[10px] font-black inline-block">{categories.find(c => c.value === selectedAgency.category)?.label}</div></div>
                <div className="space-y-4 px-2 text-right"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2 justify-end"><FaInfoCircle /> نبذة عن الجهة</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">"{selectedAgency.description || 'لا يوجد وصف متاح'}"</p></div></div>
            </div>
        )}
      </BottomSheet>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentAgency?.id ? 'تعديل بيانات الجهة' : 'إضافة جهة جديدة'}>
        <form onSubmit={handleSaveAgency} className="space-y-4 text-right">
          <Input label="اسم الجهة الرسمي" placeholder="مثال: الدفاع المدني" value={currentAgency.name_ar || ''} onChange={e => setCurrentAgency({ ...currentAgency, name_ar: e.target.value })} required className="font-black" />
          <Select label="التصنيف" value={currentAgency.category || 'Government'} onChange={e => setCurrentAgency({ ...currentAgency, category: e.target.value })}>
            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </Select>
          <Textarea label="وصف الخدمات" value={currentAgency.description || ''} onChange={e => setCurrentAgency({ ...currentAgency, description: e.target.value })} className="font-bold" />
          <div className="flex justify-end gap-3 pt-6 border-t"><Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-8 font-bold">إلغاء</Button><Button type="submit" isLoading={saving} className="rounded-xl px-12 font-black shadow-xl shadow-indigo-500/20 bg-indigo-600">حفظ البيانات</Button></div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AgenciesManager;
