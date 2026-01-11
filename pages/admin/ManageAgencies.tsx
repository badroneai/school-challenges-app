
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
import { AGENCY_CATEGORIES } from '../../constants';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ManageAgencies: React.FC = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAgency, setCurrentAgency] = useState<Partial<Agency> | null>(null);

  const fetchAgencies = async () => {
    setIsLoading(true);
    const agenciesCollection = collection(db, 'agencies');
    const agencySnapshot = await getDocs(agenciesCollection);
    const agencyList = agencySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agency));
    setAgencies(agencyList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleOpenModal = (agency: Partial<Agency> | null = null) => {
    setCurrentAgency(agency || { name_ar: '', category: 'أخرى', contact_notes: '', is_active: true });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAgency(null);
  };

  const handleSaveAgency = async () => {
    if (!currentAgency || !currentAgency.name_ar) return;

    if (currentAgency.id) {
      // Update
      const agencyDoc = doc(db, 'agencies', currentAgency.id);
      const { id, ...dataToUpdate } = currentAgency;
      await updateDoc(agencyDoc, dataToUpdate);
    } else {
      // Create
      await addDoc(collection(db, 'agencies'), currentAgency);
    }
    fetchAgencies();
    handleCloseModal();
  };

  const handleDeleteAgency = async (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الجهة؟')) {
      await deleteDoc(doc(db, 'agencies', id));
      fetchAgencies();
    }
  };

  return (
    <AdminLayout title="إدارة الجهات">
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenModal()}>إضافة جهة جديدة</Button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">اسم الجهة</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الفئة</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الحالة</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-4">جار التحميل...</td></tr>
            ) : (
              agencies.map(agency => (
                <tr key={agency.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{agency.name_ar}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{agency.category}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${agency.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {agency.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button onClick={() => handleOpenModal(agency)} className="text-teal-600 hover:text-teal-900 mr-3"><FaEdit /></button>
                    <button onClick={() => handleDeleteAgency(agency.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentAgency?.id ? 'تعديل جهة' : 'إضافة جهة جديدة'}>
        <div className="space-y-4">
          <Input label="اسم الجهة" value={currentAgency?.name_ar || ''} onChange={e => setCurrentAgency({ ...currentAgency, name_ar: e.target.value })} required />
          <Select label="الفئة" value={currentAgency?.category || ''} onChange={e => setCurrentAgency({ ...currentAgency, category: e.target.value as any })}>
            {AGENCY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </Select>
          <Textarea label="ملاحظات التواصل (اختياري)" value={currentAgency?.contact_notes || ''} onChange={e => setCurrentAgency({ ...currentAgency, contact_notes: e.target.value })} />
          <div className="flex items-center">
            <input type="checkbox" id="is_active_agency" checked={currentAgency?.is_active || false} onChange={e => setCurrentAgency({ ...currentAgency, is_active: e.target.checked })} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <label htmlFor="is_active_agency" className="mr-2 block text-sm text-gray-900">نشط</label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={handleCloseModal}>إلغاء</Button>
            <Button onClick={handleSaveAgency}>حفظ</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default ManageAgencies;
