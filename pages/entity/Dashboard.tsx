
import React, { useState, useEffect } from 'react';
import EntityLayout from '../../components/Layout/EntityLayout';
import Card from '../../components/ui/Card';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { EventRequest, NotificationType } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { FaInbox, FaCheck, FaFileSignature, FaSchool, FaMapMarkerAlt, FaCalendarCheck, FaClock, FaUserFriends, FaEllipsisH } from 'react-icons/fa';
import { getCurrentDate } from '../../services/helpers';

const EntityDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [responseType, setResponseType] = useState<'approve' | 'reject'>('approve');
  const [responseData, setResponseData] = useState({ assigned_team: '', notes: '', rejection_reason: '' });

  useEffect(() => {
    if (!userProfile?.agency_id || !db) { setLoading(false); return; }
    const q = query(collection(db, 'event_requests'), where('agency_id', '==', userProfile.agency_id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventRequest));
      list.sort((a, b) => (b.created_date || '').localeCompare(a.created_date || ''));
      setRequests(list);
      setLoading(false);
    }, (err) => { setLoading(false); });
    return () => unsubscribe();
  }, [userProfile?.agency_id]);

  const handleOpenResponse = (req: EventRequest, type: 'approve' | 'reject') => {
      setSelectedRequest(req);
      setResponseType(type);
      setResponseData({ assigned_team: '', notes: '', rejection_reason: '' });
      setIsResponseModalOpen(true);
  };

  const handleConfirmResponse = async () => {
    if (!selectedRequest || !db) return;
    if (responseType === 'approve' && !responseData.assigned_team) { alert("يرجى إدخال اسم المندوب المكلف"); return; }
    if (responseType === 'reject' && !responseData.rejection_reason) { alert("يرجى توضيح سبب الاعتذار"); return; }

    setActionLoading(true);
    try {
      const status = responseType === 'approve' ? 'entity_approved' : 'entity_rejected';
      const ref = doc(db, 'event_requests', selectedRequest.id);
      await updateDoc(ref, {
        status: status,
        assigned_team: responseData.assigned_team,
        entity_response_notes: responseType === 'approve' ? responseData.notes : responseData.rejection_reason,
        entity_response_date: getCurrentDate(),
        updated_date: getCurrentDate()
      });

      if (selectedRequest.created_by_uid) {
          await addDoc(collection(db, 'notifications'), {
              userId: selectedRequest.created_by_uid,
              type: NotificationType.REQUEST_STATUS,
              title: responseType === 'approve' ? '✅ تمت الموافقة على طلبكم' : '⚠️ نعتذر عن قبول الطلب',
              message: `قامت جهة ${userProfile?.display_name || 'الشريك'} بالرد على طلبكم بخصوص ${selectedRequest.topic}`,
              createdAt: serverTimestamp(),
              read: false,
              data: { requestId: selectedRequest.id }
          });
      }
      setIsResponseModalOpen(false);
      alert("تمت العملية بنجاح");
    } catch (error) { alert("حدث خطأ ما"); }
    finally { setActionLoading(false); }
  };

  const InsightCard = ({ title, value, icon: Icon, colorClass, bgClass }: any) => (
    <Card className="flex items-center justify-between p-8 border-none shadow-sm rounded-[2.5rem] group hover:shadow-md transition-all">
      <div className="text-right">
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
      </div>
      <div className={`p-5 rounded-3xl ${bgClass} ${colorClass} transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
        <Icon className="h-8 w-8" />
      </div>
    </Card>
  );

  return (
    <EntityLayout title="لوحة القيادة">
      {/* Hero Header */}
      <div className="mb-10 text-right">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">أهلاً بك، فريق {userProfile?.display_name?.split(' - ')[0] || 'الشريك'} 👋</h2>
        <p className="text-slate-500 font-medium mt-1">نسعى معاً لبناء وعي بيئي مستدام. إليكم ملخص الطلبات، {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <InsightCard 
          title="طلبات بانتظار المراجعة" 
          value={requests.filter(r => r.status === 'sent').length} 
          icon={FaInbox} 
          colorClass="text-indigo-600" 
          bgClass="bg-indigo-50 dark:bg-indigo-900/20" 
        />
        <InsightCard 
          title="مبادرات تم اعتمادها" 
          value={requests.filter(r => r.status === 'entity_approved').length} 
          icon={FaCalendarCheck} 
          colorClass="text-emerald-600" 
          bgClass="bg-emerald-50 dark:bg-emerald-900/20" 
        />
      </div>

      <div className="flex items-center justify-between gap-3 mb-8 text-right px-2">
        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
          <FaEllipsisH />
        </button>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <span>الطلبات الواردة من المدارس</span>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FaFileSignature /></div>
        </h2>
      </div>

      {loading ? <Spinner /> : requests.length === 0 ? (
        <Card className="text-center py-24 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
            <FaInbox size={60} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-black text-slate-400 font-bold leading-relaxed">لا توجد طلبات واردة بانتظار الإجراء حالياً</h3>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 text-right">
          {requests.map(req => (
            <Card key={req.id} className={`p-0 overflow-hidden border-none shadow-sm rounded-[2.5rem] transition-all hover:shadow-xl ${req.status === 'sent' ? 'ring-2 ring-indigo-500 ring-offset-4' : ''}`}>
              <div className="flex flex-col lg:flex-row-reverse min-h-[220px]">
                <div className="lg:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-8 border-r border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                    <div className="flex items-center justify-end gap-4 mb-6">
                        <div className="min-w-0">
                            <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight truncate">{req.school_name || 'المدرسة'}</h4>
                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter">تاريخ الطلب: {req.created_date}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl shadow-sm text-indigo-600 shrink-0"><FaSchool size={24} /></div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-end gap-2 text-xs font-black text-slate-600 dark:text-slate-400">
                            <span className="truncate">{req.location || 'مقر المدرسة'}</span>
                            <FaMapMarkerAlt className="text-indigo-400" />
                        </div>
                        <div className="flex items-center justify-end gap-2 text-xs font-black text-slate-600 dark:text-slate-400">
                            <span>{req.estimated_students_count} طالب مستهدف</span>
                            <FaUserFriends className="text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8 flex flex-col justify-between bg-white dark:bg-slate-800">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black shadow-sm ${req.status === 'sent' ? 'bg-amber-50 text-amber-700 animate-pulse border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                {req.status === 'sent' ? 'بانتظار الرد' : 'تمت الموافقة'}
                            </span>
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-[9px] font-black uppercase border border-indigo-100 dark:border-indigo-800">طلب تنفيذ خدمة</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-relaxed">{req.topic}</h3>
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl inline-flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">الموعد: {req.suggested_dates?.[0] || 'يتم التنسيق'}</span>
                            <FaClock className="text-indigo-500" />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8 pt-6 border-t border-slate-50 dark:border-slate-700">
                        {req.status === 'sent' ? (
                            <>
                                <Button onClick={() => handleOpenResponse(req, 'approve')} className="flex-1 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20 font-black flex items-center justify-center gap-3 transition-all active:scale-95">
                                    <span>قبول الطلب وتكليف فريق</span>
                                    <FaCheck />
                                </Button>
                                <Button variant="secondary" onClick={() => handleOpenResponse(req, 'reject')} className="px-8 rounded-2xl text-red-600 border-red-100 font-black text-xs">اعتذار</Button>
                            </>
                        ) : (
                            <div className="w-full p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-between border border-emerald-100 dark:border-emerald-800">
                                <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full shadow-sm">حالة الاعتماد: مؤكد</div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">فريق التنفيذ المعتمد:</p>
                                        <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">{req.assigned_team || 'الفريق المختص'}</p>
                                    </div>
                                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm"><FaCheck size={12} /></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isResponseModalOpen} onClose={() => !actionLoading && setIsResponseModalOpen(false)} title={responseType === 'approve' ? "تفويض فريق التنفيذ" : "الاعتذار عن الطلب"}>
          <div className="space-y-6 text-right">
              {responseType === 'approve' ? (
                  <>
                    <Input label="اسم الفريق المكلف أو المندوب" placeholder="مثال: فريق التوعية - أ. محمد الخالد" value={responseData.assigned_team} onChange={e => setResponseData({...responseData, assigned_team: e.target.value})} required className="font-black" />
                    <Textarea label="ملاحظات توجيهية للمدرسة" placeholder="نرجو تجهيز القاعة ببروجكتر..." value={responseData.notes} onChange={e => setResponseData({...responseData, notes: e.target.value})} className="font-bold" />
                  </>
              ) : <Textarea label="سبب الاعتذار للمدرسة" value={responseData.rejection_reason} onChange={e => setResponseData({...responseData, rejection_reason: e.target.value})} required className="font-bold border-red-100" />}
              
              <div className="flex justify-end gap-3 pt-6 border-t dark:border-slate-700">
                  <Button variant="secondary" onClick={() => setIsResponseModalOpen(false)} className="rounded-xl px-8 font-bold">إلغاء</Button>
                  <Button onClick={handleConfirmResponse} isLoading={actionLoading} className={`rounded-xl px-12 font-black shadow-xl ${responseType === 'approve' ? 'bg-teal-600' : 'bg-red-600'}`}>
                    <span>تأكيد الإرسال</span>
                  </Button>
              </div>
          </div>
      </Modal>
    </EntityLayout>
  );
};

export default EntityDashboard;