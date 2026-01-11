
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Initiative, InitiativeStatus, GradeLevel } from '../../types';
import EntityLayout from '../../components/Layout/EntityLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import { getCurrentDate } from '../../services/helpers';
import { 
    FaPlus, FaBullhorn, FaCalendarAlt, FaUsers, FaClock, 
    FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaArrowRight,
    FaFirstAid, FaFireExtinguisher, FaTree, FaMicrophone, FaMagic
} from 'react-icons/fa';

const TEMPLATES = [
    { id: 'first_aid', icon: FaFirstAid, title: 'دورة إسعافات أولية', desc: 'تدريبات عملية للطلاب على التعامل مع الطوارئ.', color: 'text-red-600 bg-red-50' },
    { id: 'evacuation', icon: FaFireExtinguisher, title: 'فرضية إخلاء آمن', desc: 'تدريب ميداني على مخارج الطوارئ بالمدرسة.', color: 'text-orange-600 bg-orange-50' },
    { id: 'greening', icon: FaTree, title: 'مبادرة التشجير', desc: 'زراعة شتلات محلية في محيط المدرسة.', color: 'text-green-600 bg-green-50' },
    { id: 'lecture', icon: FaMicrophone, title: 'محاضرة توعوية', desc: 'لقاء مفتوح مع الطلاب حول مواضيع تخصصية.', color: 'text-blue-600 bg-blue-50' },
    { id: 'custom', icon: FaMagic, title: 'مبادرة مخصصة', desc: 'تصميم مبادرة جديدة حسب حاجة المدرسة.', color: 'text-purple-600 bg-purple-50' }
];

const MyInitiatives: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<Partial<Initiative>>({ title: '', description: '', target_audience: [GradeLevel.HIGH], capacity: 30, date: '', start_time: '09:00', location: '' });

  useEffect(() => {
    const fetchInitiatives = async () => {
      if (!userProfile?.agency_id) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'initiatives'), where('agency_id', '==', userProfile.agency_id));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Initiative));
        list.sort((a, b) => b.created_date.localeCompare(a.created_date));
        setInitiatives(list);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchInitiatives();
  }, [userProfile]);

  const handleTemplateSelect = (template: any) => {
      setFormData(prev => ({ ...prev, title: template.id === 'custom' ? '' : template.title, description: template.id === 'custom' ? '' : template.desc }));
      setStep(2);
  };

  const getStatusBadge = (status: InitiativeStatus) => {
      const base = "px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 border";
      switch (status) {
          case InitiativeStatus.PENDING_APPROVAL: return <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-100`}><span>قيد المراجعة</span> <FaHourglassHalf size={8}/></span>;
          case InitiativeStatus.APPROVED: return <span className={`${base} bg-green-50 text-green-700 border-green-100`}><span>منشورة</span> <FaCheckCircle size={8}/></span>;
          case InitiativeStatus.REJECTED: return <span className={`${base} bg-red-50 text-red-700 border-red-100`}><span>مرفوضة</span> <FaTimesCircle size={8}/></span>;
          default: return <span className="text-[9px] font-medium">{status}</span>;
      }
  };

  return (
    <EntityLayout title="إدارة المبادرات">
      <div className="flex justify-between items-center mb-6 text-right">
          <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 justify-end">
                  <span>المبادرات والفرص المجتمعية</span>
                  <FaBullhorn size={18} className="text-indigo-600" />
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-0.5">قم بإدارة الفرص التطوعية والبرامج المجدولة.</p>
          </div>
          <Button onClick={() => { setStep(1); setModalOpen(true); }} className="flex items-center gap-2 bg-indigo-600 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/10 transition-all active:scale-95 text-sm">
              <span>إطلاق مبادرة جديدة</span>
              <FaPlus size={10} />
          </Button>
      </div>

      {loading ? <Spinner /> : initiatives.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.map(template => (
                  <Card key={template.id} onClick={() => handleTemplateSelect(template)} className={`border border-slate-100 shadow-sm rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 group bg-white dark:bg-slate-800`}>
                      <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl shadow-sm text-xl ${template.color}`}><template.icon /></div>
                          <FaArrowRight className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-[-4px] transition-all" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 text-right">{template.title}</h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed text-right">{template.desc}</p>
                  </Card>
              ))}
          </div>
      ) : (
          <Card className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm p-0 bg-white dark:bg-slate-800">
              <div className="overflow-x-auto">
              <table className="min-w-full text-right border-collapse">
                  <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                          <th className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">عنوان المبادرة</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">الجدولة</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">السعة</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">الحالة</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                      {initiatives.map(initiative => (
                          <tr key={initiative.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                              <td className="px-6 py-3.5">
                                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{initiative.title}</div>
                                  <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{initiative.description}</div>
                              </td>
                              <td className="px-6 py-3.5">
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                                      <FaCalendarAlt size={10} className="text-indigo-400"/> <span>{initiative.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-0.5">
                                      <FaClock size={10}/> <span>{initiative.start_time}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {initiative.capacity} طالب
                              </td>
                              <td className="px-6 py-3.5">
                                  <div className="flex justify-center">{getStatusBadge(initiative.status)}</div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              </div>
          </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={step === 1 ? "اختر نوع المبادرة" : "تفاصيل المبادرة"}>
          {step === 1 ? (
              <div className="grid grid-cols-1 gap-2 text-right">
                  {TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => handleTemplateSelect(t)} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                          <div className={`p-2 rounded-lg text-lg ${t.color}`}><t.icon /></div>
                          <div className="flex-1 px-4"><h4 className="font-bold text-slate-900 text-sm">{t.title}</h4></div>
                          <FaArrowRight size={12} className="text-slate-300 group-hover:text-indigo-600" />
                      </button>
                  ))}
              </div>
          ) : (
            <form onSubmit={e => e.preventDefault()} className="space-y-4 text-right">
                <Input label="عنوان المبادرة" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="التاريخ" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                    <Input label="الوقت" type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} required />
                </div>
                <Textarea label="وصف المبادرة" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
                    <Button variant="secondary" type="button" onClick={() => setModalOpen(false)} className="rounded-xl px-6">إلغاء</Button>
                    <Button onClick={() => setModalOpen(false)} className="bg-indigo-600 px-8 rounded-xl font-bold shadow-md">حفظ المبادرة</Button>
                </div>
            </form>
          )}
      </Modal>
    </EntityLayout>
  );
};

export default MyInitiatives;