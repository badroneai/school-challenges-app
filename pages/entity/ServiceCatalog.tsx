
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AgencyService, ApprovalStatus, GradeLevel, InitiativeStatus } from '../../types';
import EntityLayout from '../../components/Layout/EntityLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import { getCurrentDate } from '../../services/helpers';
import { FaPlus, FaTrash, FaList, FaClock, FaUsers, FaBullhorn, FaInfoCircle } from 'react-icons/fa';

const ServiceCatalog: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [services, setServices] = useState<AgencyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [offeringType, setOfferingType] = useState<'service' | 'initiative'>('service');

  const initialFormState = { title: '', description: '', duration_minutes: 45, target_audience: [GradeLevel.PRIMARY, GradeLevel.MIDDLE, GradeLevel.HIGH], max_capacity: 30, requirements: '', is_active: true, date: '', start_time: '09:00', end_time: '10:00', location: '' };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => { fetchServices(); }, [userProfile]);

  const fetchServices = async () => {
    if (!userProfile?.agency_id) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'agency_services'), where('agency_id', '==', userProfile.agency_id));
      const snapshot = await getDocs(q);
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgencyService)));
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleOpenModal = () => { setOfferingType('service'); setFormData(initialFormState); setIsModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.agency_id || !user) return;
    setSubmitting(true);
    try {
      if (offeringType === 'service') {
        await addDoc(collection(db, 'agency_services'), { agency_id: userProfile.agency_id, title: formData.title, description: formData.description, duration_minutes: formData.duration_minutes, target_audience: formData.target_audience, max_capacity: formData.max_capacity, requirements: formData.requirements, is_active: formData.is_active, approval_status: ApprovalStatus.PENDING, created_date: getCurrentDate() });
      } else {
        await addDoc(collection(db, 'initiatives'), { agency_id: userProfile.agency_id, agency_name: userProfile.display_name, title: formData.title, description: formData.description, target_audience: formData.target_audience, capacity: formData.max_capacity, date: formData.date, start_time: formData.start_time, end_time: formData.end_time, location: formData.location, status: InitiativeStatus.PENDING_APPROVAL, created_by_uid: user.uid, created_date: getCurrentDate() });
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (error) { alert("خطأ في الحفظ"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد؟')) return;
    await deleteDoc(doc(db, 'agency_services', id));
    fetchServices();
  };

  return (
    <EntityLayout title="إدارة الخدمات والمبادرات">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 text-right">
        <Button onClick={handleOpenModal} className="flex items-center gap-3 px-10 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 font-black text-lg">
          <span>إضافة عرض جديد</span>
          <FaPlus />
        </Button>
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 justify-end">
            <span>عرض الخدمات المتاحة</span>
            <FaList className="text-indigo-600" />
          </h2>
          <p className="text-slate-500 text-sm font-bold mt-1">يمكنك إضافة خدمات لكتالوجك أو الإعلان عن مبادرات مجدولة.</p>
        </div>
      </div>

      {loading ? <Spinner /> : services.length === 0 ? (
        <Card className="text-center py-24 border-2 border-dashed border-slate-200 rounded-[3rem]">
          <FaList className="mx-auto text-4xl text-slate-300 mb-4" />
          <h3 className="text-lg font-black text-slate-600 mb-6">كتالوج الخدمات فارغ</h3>
          <Button onClick={handleOpenModal} variant="secondary" className="px-10 rounded-2xl font-black">إضافة أول خدمة الآن</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-right">
          {services.map(service => (
            <Card key={service.id} className="relative group border-none shadow-sm rounded-[2.5rem] hover:shadow-xl transition-all p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2"><button onClick={() => handleDelete(service.id)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-xl transition-all"><FaTrash size={14}/></button></div>
                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase ${service.approval_status === ApprovalStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {service.approval_status === ApprovalStatus.APPROVED ? 'معتمد' : 'قيد المراجعة'}
                </span>
              </div>
              <h3 className="font-black text-xl text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-500 text-sm mb-8 line-clamp-3 font-bold leading-relaxed">{service.description}</p>
              <div className="flex flex-wrap justify-end gap-3 text-[10px] font-black text-slate-400 border-t pt-5">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"><span>{service.max_capacity} طالب</span> <FaUsers size={12}/></span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"><span>{service.duration_minutes} دقيقة</span> <FaClock size={12}/></span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => !submitting && setIsModalOpen(false)} title="إعداد عرض جديد">
        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          <div className="bg-slate-50 p-2 rounded-[1.5rem] flex gap-2 border border-slate-100">
            <button type="button" onClick={() => setOfferingType('service')} className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${offeringType === 'service' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
                <span>خدمة (عند الطلب)</span>
                <FaList />
            </button>
            <button type="button" onClick={() => setOfferingType('initiative')} className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${offeringType === 'initiative' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
                <span>مبادرة (موعد ثابت)</span>
                <FaBullhorn />
            </button>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex justify-end gap-3">
              <p className="text-[11px] text-indigo-800 font-black leading-relaxed">يرجى تعبئة كافة التفاصيل المطلوبة ليتم عرضها في لوحة تحكم منسقي المدارس فور اعتمادها.</p>
              <FaInfoCircle className="text-indigo-500 mt-1 shrink-0" />
          </div>

          <Input label="عنوان العرض" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="font-black" />
          <Textarea label="الوصف والتفاصيل" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="font-bold" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="المدة (دقيقة)" type="number" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} required />
            <Input label="السعة (عدد الطلاب)" type="number" value={formData.max_capacity} onChange={e => setFormData({...formData, max_capacity: parseInt(e.target.value)})} required />
          </div>

          {offeringType === 'initiative' && (
              <div className="space-y-4 p-6 bg-teal-50/30 rounded-[2.5rem] border border-teal-100 animate-in fade-in">
                  <h4 className="font-black text-teal-800 text-sm border-r-4 border-teal-500 pr-3 mb-4">بيانات الجدولة والموقع</h4>
                  <Input label="تاريخ المبادرة" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="bg-white" />
                  <div className="grid grid-cols-2 gap-4">
                      <Input label="وقت البداية" type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} required className="bg-white" />
                      <Input label="وقت النهاية" type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} required className="bg-white" />
                  </div>
                  <Input label="موقع المبادرة المعتمد" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required placeholder="مثال: مسرح الجامعة، قاعة التدريب" className="bg-white font-bold" />
              </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-8 font-bold">إلغاء</Button>
            <Button type="submit" isLoading={submitting} className={`px-12 py-3.5 font-black rounded-2xl border-none shadow-xl ${offeringType === 'service' ? 'bg-indigo-600' : 'bg-teal-600'}`}>
                <span>{offeringType === 'service' ? 'حفظ بكتالوج الخدمات' : 'نشر المبادرة المجدولة'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </EntityLayout>
  );
};

export default ServiceCatalog;
