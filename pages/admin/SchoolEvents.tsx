
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { InternalEvent, EVENT_STATUS_LABELS, EVENT_STATUS_COLORS, EVENT_TYPE_LABELS } from '../../types/internalEvent';
import { School } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import Select from '../../components/ui/Select';
import EventCalendar from '../../components/Calendar/EventCalendar';
import { FaList, FaCalendarAlt, FaSchool } from 'react-icons/fa';

const SchoolEvents: React.FC = () => {
  const [events, setEvents] = useState<InternalEvent[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const schoolsSnapshot = await getDocs(collection(db, 'schools'));
        const schoolsList = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
        setSchools(schoolsList);

        let q;
        if (selectedSchoolId !== 'all') {
            q = query(
                collection(db, 'internal_events'),
                where('school_id', '==', selectedSchoolId)
            );
        } else {
             q = query(collection(db, 'internal_events'), orderBy('date', 'desc'));
        }

        const querySnapshot = await getDocs(q);
        const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as InternalEvent));
        eventsList.sort((a, b) => b.date.localeCompare(a.date));
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedSchoolId]);

  const getSchoolName = (schoolId: string) => {
      return schools.find(s => s.id === schoolId)?.name_ar || 'مدرسة غير معروفة';
  };

  return (
    <AdminLayout title="متابعة فعاليات المدارس">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm">
        <div className="w-full md:w-1/3">
             <Select 
                label="تصفية حسب المدرسة" 
                value={selectedSchoolId} 
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="rounded-2xl border-slate-100 font-bold"
             >
                 <option value="all">كافة المدارس</option>
                 {schools.map(school => (
                     <option key={school.id} value={school.id}>{school.name_ar}</option>
                 ))}
             </Select>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-2xl p-1 shadow-inner">
            <button 
                onClick={() => setViewMode('list')}
                className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
                <span>قائمة</span>
                <FaList />
            </button>
            <button 
                onClick={() => setViewMode('calendar')}
                className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
                <span>تقويم</span>
                <FaCalendarAlt />
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
             <FaCalendarAlt size={50} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-400 text-lg font-bold">لا توجد فعاليات مسجلة حالياً.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
            <table className="min-w-full text-right border-collapse">
            <thead>
                <tr className="bg-slate-50/50 dark:bg-gray-900/50">
                    <th className="px-6 py-5 font-black text-slate-800 dark:text-gray-200 text-xs border-b">عنوان الفعالية</th>
                    <th className="px-6 py-5 font-black text-slate-800 dark:text-gray-200 text-xs border-b text-center">المدرسة</th>
                    <th className="px-6 py-5 font-black text-slate-800 dark:text-gray-200 text-xs border-b">النوع</th>
                    <th className="px-6 py-5 font-black text-slate-800 dark:text-gray-200 text-xs border-b">التاريخ</th>
                    <th className="px-6 py-5 font-black text-slate-800 dark:text-gray-200 text-xs border-b">الحالة</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                {events.map(event => (
                    <tr key={event.id} className="hover:bg-slate-50/30 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white">
                        {event.title}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300 font-bold">
                        <div className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-gray-900/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-gray-700">
                            <span>{getSchoolName(event.school_id)}</span>
                            <FaSchool className="text-indigo-400" />
                        </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500">
                        {EVENT_TYPE_LABELS[event.type]}
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-400 font-black">
                        {event.date}
                    </td>
                    <td className="px-6 py-5">
                        <span className={`px-4 py-1 inline-flex text-[10px] font-black rounded-xl shadow-sm bg-${EVENT_STATUS_COLORS[event.status]}-50 text-${EVENT_STATUS_COLORS[event.status]}-700 border border-${EVENT_STATUS_COLORS[event.status]}-100`}>
                        {EVENT_STATUS_LABELS[event.status]}
                        </span>
                    </td>
                    </tr>
                ))}
            </tbody>
            </table>
            </div>
        </div>
      ) : (
        <EventCalendar events={events} />
      )}
    </AdminLayout>
  );
};

export default SchoolEvents;
