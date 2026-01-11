
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Challenge, ChallengeStatus } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import BottomSheet from '../../components/ui/BottomSheet';
import CardGridSkeleton from '../../components/skeletons/CardGridSkeleton';
import { FaPlus, FaTrash, FaEdit, FaBullseye, FaChevronLeft, FaStar } from 'react-icons/fa';
import { getCurrentDate } from '../../services/helpers';

const ChallengesManager: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const [formData, setFormData] = useState({
    title: '', description: '', category: 'توعية', start_date: getCurrentDate(),
    end_date: '', measurement_method: 'عدد الطلاب المشاركين', points_multiplier: 10, status: ChallengeStatus.PUBLISHED
  });

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'challenges'), orderBy('created_date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChallenges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (challenge?: Challenge) => {
    if (challenge) {
      setEditingId(challenge.id);
      setFormData({...challenge});
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', category: 'توعية', start_date: getCurrentDate(), end_date: '', measurement_method: 'عدد الطلاب المشاركين', points_multiplier: 10, status: ChallengeStatus.PUBLISHED });
    }
    setIsModalOpen(true);
    setIsSheetOpen(false);
  };

  const handleRowClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsSheetOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await updateDoc(doc(db, 'challenges', editingId), formData);
      else await addDoc(collection(db, 'challenges'), { ...formData, school_id: 'GLOBAL', created_date: getCurrentDate(), created_by_uid: 'admin' });
      setIsModalOpen(false);
    } catch (err) { alert("خطأ في الحفظ"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('حذف التحدي؟')) {
        await deleteDoc(doc(db, 'challenges', id));
        setIsSheetOpen(false);
    }
  };

  return (
    <AdminLayout title="إدارة التحديات الموحدة">
      <div className="flex justify-between items-center mb-8 px-1">
          <p className="text-slate-500 font-bold text-xs md:text-sm">إطلاق التحديات البيئية لكافة المدارس</p>
          <Button onClick={() => handleOpenModal()} className="rounded-xl px-6 py-2.5 bg-indigo-600 font-black text-xs">
              <span>تحدي جديد</span>
              <FaPlus size={10} className="mr-2"/>
          </Button>
      </div>

      {loading ? <CardGridSkeleton count={3} /> : (
        <div className="space-y-4">
            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map(c => (
                    <Card key={c.id} className="p-6 rounded-[2rem] relative group border-none shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FaBullseye /></div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(c)} className="p-2 text-indigo-400 hover:text-indigo-600"><FaEdit size={14}/></button>
                                <button onClick={() => handleDelete(c.id)} className="p-2 text-red-300 hover:text-red-500"><FaTrash size={14}/></button>
                            </div>
                        </div>
                        <h3 className="font-black text-slate-900 mb-2">{c.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-bold">{c.description}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50 text-[10px] font-black text-slate-400">
                            <span>{c.points_multiplier} نقطة</span>
                            <span>{c.end_date}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Mobile Rows */}
            <div className="md:hidden space-y-2.5">
                {challenges.map(c => (
                    <div key={c.id} onClick={() => handleRowClick(c)} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700 active:scale-[0.98] transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><FaBullseye size={20}/></div>
                        <div className="flex-1 min-w-0 text-right"><h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{c.title}</h4><p className="text-[10px] text-slate-400 font-bold mt-0.5">ينتهي: {c.end_date}</p></div>
                        <FaChevronLeft className="text-slate-300" size={10} />
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Mobile Actions Sheet */}
      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="إدارة التحدي" footer={<div className="grid grid-cols-2 gap-3"><Button onClick={() => handleOpenModal(selectedChallenge!)} className="flex-1 rounded-2xl bg-indigo-600 py-4 font-black flex items-center justify-center gap-2"><FaEdit /> تعديل</Button><Button onClick={() => handleDelete(selectedChallenge!.id)} variant="danger" className="flex-1 rounded-2xl py-4 font-black flex items-center justify-center gap-2"><FaTrash /> حذف</Button></div>}>
        {selectedChallenge && (
            <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100"><h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{selectedChallenge.title}</h3><p className="text-xs text-slate-500 font-bold leading-relaxed">{selectedChallenge.description}</p></div>
                <div className="flex items-center gap-6 pr-2"><div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">معامل النقاط</span><span className="text-lg font-black text-indigo-600 flex items-center gap-1.5">{selectedChallenge.points_multiplier} <FaStar size={12}/></span></div><div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">الموعد النهائي</span><span className="text-sm font-black text-slate-800">{selectedChallenge.end_date}</span></div></div>
            </div>
        )}
      </BottomSheet>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'تعديل التحدي' : 'إضافة تحدي جديد'}>
        <form onSubmit={handleSave} className="space-y-4 text-right">
          <Input label="العنوان" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          <Textarea label="التعليمات" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows={4} />
          <div className="grid grid-cols-2 gap-4"><Input label="تاريخ الانتهاء" type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required /><Input label="النقاط" type="number" value={formData.points_multiplier} onChange={e => setFormData({...formData, points_multiplier: parseInt(e.target.value)})} /></div>
          <div className="flex justify-end gap-3 pt-4"><Button variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button><Button type="submit">حفظ التحدي</Button></div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default ChallengesManager;