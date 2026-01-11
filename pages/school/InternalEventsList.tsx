
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { InternalEvent, EVENT_STATUS_LABELS, EVENT_TYPE_LABELS } from '../../types/internalEvent';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import BottomSheet from '../../components/ui/BottomSheet';
import EventCalendar from '../../components/Calendar/EventCalendar';
import EmptyState from '../../components/ui/EmptyState';
import { FaList, FaCalendarAlt, FaCalendarPlus, FaChevronLeft, FaMapMarkerAlt, FaFileSignature } from 'react-icons/fa';

const InternalEventsList: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<InternalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Mobile Sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<InternalEvent | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!userProfile?.school_id) return;
      setIsLoading(true);
      try {
        const q = query(collection(db, 'internal_events'), where('school_id', '==', userProfile.school_id));
        const snap = await getDocs(q);
        setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternalEvent)).sort((a, b) => b.date.localeCompare(a.date)));
      } catch (error) { console.error(error); } 
      finally { setIsLoading(false); }
    };
    fetchEvents();
  }, [userProfile]);

  const handleRowClick = (event: InternalEvent) => {
    setSelectedEvent(event);
    setIsSheetOpen(true);
  };

  return (
    <SchoolLayout title="الفعاليات الداخلية">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-1">
        <p className="text-slate-500 font-bold text-xs md:text-sm">إدارة أنشطة المدرسة والتوثيق</p>
        <div className="flex items-center gap-3">
            <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-sm p-1 border border-slate-100">
                <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400'}`}><FaList size={14}/></button>
                <button onClick={() => setViewMode('calendar')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400'}`}><FaCalendarAlt size={14}/></button>
            </div>
            <Link to="/school/internal-events/new">
              <Button className="rounded-xl px-5 py-2.5 bg-teal-600 font-black shadow-lg shadow-teal-500/10 text-xs">إضافة</Button>
            </Link>
        </div>
      </div>

      {isLoading ? <Spinner /> : events.length === 0 ? <EmptyState icon={<FaCalendarAlt />} title="لا توجد فعاليات" /> : viewMode === 'list' ? (
        <div className="space-y-2.5">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-gray-800 shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 font-black text-xs">العنوان</th>
                            <th className="px-8 py-5 font-black text-xs">التاريخ</th>
                            <th className="px-8 py-5 font-black text-xs">الحالة</th>
                            <th className="px-8 py-5 text-center font-black text-xs">عرض</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {events.map(e => (
                            <tr key={e.id} className="hover:bg-slate-50/20 cursor-pointer" onClick={() => navigate(`/school/internal-events/${e.id}`)}>
                                <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white">{e.title}</td>
                                <td className="px-8 py-6 text-xs text-slate-400 font-black">{e.date}</td>
                                <td className="px-8 py-6"><span className="px-3 py-1 bg-slate-100 text-[10px] font-black rounded-lg">{EVENT_STATUS_LABELS[e.status]}</span></td>
                                <td className="px-8 py-6 text-center"><FaChevronLeft size={10} className="mx-auto text-slate-200" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Rows */}
            <div className="md:hidden space-y-2">
                {events.map(e => (
                    <div key={e.id} onClick={() => handleRowClick(e)} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700 active:scale-[0.98] transition-all">
                        <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><FaCalendarPlus size={18}/></div>
                        <div className="flex-1 min-w-0 text-right">
                            <h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{e.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{e.date} | {e.start_time}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[9px] font-black bg-slate-50 text-slate-500 px-2 py-0.5 rounded border">{EVENT_STATUS_LABELS[e.status]}</span>
                            <FaChevronLeft className="text-slate-300" size={10} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      ) : <EventCalendar events={events} />}

      {/* Mobile Bottom Sheet Actions */}
      <BottomSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        title="خيارات الفعالية"
        footer={
            <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => navigate(`/school/internal-events/${selectedEvent!.id}`)} className="flex-1 rounded-2xl bg-indigo-600 py-4 font-black">فتح التفاصيل</Button>
                {selectedEvent?.status === 'completed' && (
                    <Button onClick={() => navigate(`/school/internal-events/${selectedEvent!.id}/document`)} className="flex-1 rounded-2xl bg-emerald-600 py-4 font-black">توثيق الآن</Button>
                )}
                {selectedEvent?.status !== 'completed' && (
                    <Button onClick={() => setIsSheetOpen(false)} variant="secondary" className="flex-1 rounded-2xl py-4 font-black text-slate-400 border-slate-100">إغلاق</Button>
                )}
            </div>
        }
      >
          {selectedEvent && (
              <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100">
                    <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-2">{selectedEvent.title}</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">{selectedEvent.description}</p>
                  </div>
                  <div className="space-y-3 px-2">
                    <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-400 uppercase tracking-tighter">الموقع</span>
                        <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">{selectedEvent.location} <FaMapMarkerAlt className="text-indigo-400"/></span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-400 uppercase tracking-tighter">التوقيت</span>
                        <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">{selectedEvent.start_time} - {selectedEvent.end_time} <FaList className="text-indigo-400"/></span>
                    </div>
                  </div>
              </div>
          )}
      </BottomSheet>
    </SchoolLayout>
  );
};

export default InternalEventsList;