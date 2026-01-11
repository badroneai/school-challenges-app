
import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { School } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import BottomSheet from '../../components/ui/BottomSheet';
import TableSkeleton from '../../components/skeletons/TableSkeleton';
import { useToast } from '../../contexts/ToastContext';
import { FaEdit, FaTrash, FaPlus, FaSchool, FaChevronLeft, FaMapMarkerAlt, FaUserTie, FaExclamationTriangle } from 'react-icons/fa';
import { getCurrentDate } from '../../services/helpers';

const ManageSchools: React.FC = () => {
  const { showToast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  
  // Custom Delete Confirmation State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mobile Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const [formData, setFormData] = useState({
    name_ar: '', city: '', region: '', manager_name: '', is_active: true
  });

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'schools'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
      setSchools(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (school?: School) => {
    if (school) {
      setEditingSchool(school);
      setFormData({ name_ar: school.name_ar, city: school.city, region: school.region, manager_name: school.manager_name || '', is_active: school.is_active });
    } else {
      setEditingSchool(null);
      setFormData({ name_ar: '', city: 'بريدة', region: 'القصيم', manager_name: '', is_active: true });
    }
    setIsModalOpen(true);
    setIsSheetOpen(false);
  };

  const handleRowClick = (school: School) => {
    if (window.innerWidth < 768) {
      setSelectedSchool(school);
      setIsSheetOpen(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchool) await updateDoc(doc(db, 'schools', editingSchool.id), formData);
      else await addDoc(collection(db, 'schools'), { ...formData, created_date: getCurrentDate() });
      showToast('تم الحفظ بنجاح', 'success');
      setIsModalOpen(false);
    } catch (error) { showToast('خطأ في الحفظ', 'error'); }
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete || !db) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'schools', itemToDelete));
      showToast('تم حذف المدرسة بنجاح', 'info');
      setIsDeleteConfirmOpen(false);
      setIsSheetOpen(false);
    } catch (error) { showToast('خطأ في الحذف', 'error'); }
    finally { setIsDeleting(false); setItemToDelete(null); }
  };

  return (
    <AdminLayout title="إدارة المدارس">
      <div className="flex justify-between items-center mb-6 px-1 text-right">
        <p className="text-slate-500 font-bold text-xs md:text-sm">المدارس المسجلة ({schools.length})</p>
        <Button onClick={() => handleOpenModal()} className="rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/10 text-xs px-6 py-2.5">
          <span>إضافة مدرسة</span>
          <FaPlus size={10} className="mr-2" />
        </Button>
      </div>

      {loading ? <TableSkeleton cols={4} rows={6} /> : (
          <div className="space-y-3">
            <div className="hidden md:block bg-white dark:bg-slate-800 shadow-sm rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                      <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs uppercase">المدرسة</th>
                      <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs uppercase">المنطقة</th>
                      <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs uppercase">المدير</th>
                      <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs uppercase text-center">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {schools.map((school) => (
                    <tr key={school.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4"><span className="font-black text-slate-900 dark:text-white text-sm">{school.name_ar}</span></td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-bold">{school.city}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">{school.manager_name}</td>
                        <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                                <button onClick={() => handleOpenModal(school)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors" title="تعديل"><FaEdit size={14} /></button>
                                <button onClick={(e) => confirmDelete(e, school.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="حذف"><FaTrash size={14} /></button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-2">
                {schools.map(school => (
                    <div key={school.id} onClick={() => handleRowClick(school)} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700 active:scale-[0.98] transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0"><FaSchool size={20} /></div>
                        <div className="flex-1 min-w-0 text-right"><h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{school.name_ar}</h4><p className="text-[10px] text-slate-400 font-bold mt-0.5">{school.city}</p></div>
                        <FaChevronLeft className="text-slate-300" size={10} />
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* Confirmation Modal to Bypass Sandbox window.confirm Block */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="تأكيد حذف المدرسة">
          <div className="text-center p-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><FaExclamationTriangle /></div>
              <h3 className="text-lg font-black text-slate-900 mb-2">هل أنت متأكد تماماً؟</h3>
              <p className="text-sm text-slate-500 mb-8 font-bold leading-relaxed">سيتم حذف كافة بيانات هذه المدرسة وسجلاتها نهائياً من النظام. لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="grid grid-cols-2 gap-3">
                  <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)} className="rounded-xl py-3 font-bold">إلغاء</Button>
                  <Button onClick={handleDelete} isLoading={isDeleting} className="bg-red-600 text-white rounded-xl py-3 font-black shadow-lg shadow-red-500/20">نعم، احذف نهائياً</Button>
              </div>
          </div>
      </Modal>

      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="إجراءات المدرسة" footer={<div className="grid grid-cols-2 gap-3 w-full"><Button onClick={() => handleOpenModal(selectedSchool!)} className="flex-1 rounded-2xl bg-indigo-600 py-4 font-black flex items-center justify-center gap-2"><FaEdit /> تعديل</Button><Button onClick={(e) => confirmDelete(e as any, selectedSchool!.id)} variant="danger" className="flex-1 rounded-2xl py-4 font-black flex items-center justify-center gap-2"><FaTrash /> حذف</Button></div>}>
        {selectedSchool && (
            <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700"><h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">{selectedSchool.name_ar}</h3><div className="flex items-center gap-2 text-indigo-600 font-bold text-xs"><FaMapMarkerAlt size={10} /><span>{selectedSchool.region} - {selectedSchool.city}</span></div></div>
                <div className="space-y-3 px-2"><div className="flex items-center justify-between text-xs font-black"><span className="text-slate-400 uppercase tracking-widest">مدير المدرسة</span><span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">{selectedSchool.manager_name} <FaUserTie className="text-indigo-400" /></span></div><div className="flex items-center justify-between text-xs font-black"><span className="text-slate-400 uppercase tracking-widest">تاريخ التسجيل</span><span className="text-slate-800 dark:text-slate-200">{selectedSchool.created_date}</span></div></div>
            </div>
        )}
      </BottomSheet>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSchool ? 'تعديل بيانات المدرسة' : 'إضافة مدرسة جديدة'}>
        <form onSubmit={handleSave} className="space-y-4 text-right">
          <Input label="اسم المدرسة" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} required className="font-black" />
          <div className="grid grid-cols-2 gap-4"><Input label="المدينة" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required /><Input label="المنطقة" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} required /></div>
          <Input label="اسم مدير المدرسة" value={formData.manager_name} onChange={e => setFormData({...formData, manager_name: e.target.value})} className="font-black" />
          <div className="flex justify-end gap-3 pt-6 border-t dark:border-slate-700"><Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-8 font-bold">إلغاء</Button><Button type="submit" className="rounded-xl px-12 font-black shadow-xl shadow-indigo-500/20 bg-indigo-600">حفظ البيانات</Button></div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default ManageSchools;
