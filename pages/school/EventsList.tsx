
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { EventRequest, Agency } from '../../types';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { getEventStatusText, getStatusColor } from '../../constants';

const EventsList: React.FC = () => {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<EventRequest[]>([]);
  const [agencies, setAgencies] = useState<{ [id: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventsAndAgencies = async () => {
      if (!userProfile?.school_id) return;
      setIsLoading(true);
      try {
        // Fetch Agencies first to map IDs to names
        const agencySnapshot = await getDocs(collection(db, 'agencies'));
        const agencyMap: { [id: string]: string } = {};
        agencySnapshot.forEach(doc => {
          agencyMap[doc.id] = (doc.data() as Agency).name_ar;
        });
        setAgencies(agencyMap);

        // Fetch Events
        const q = query(
          collection(db, 'event_requests'),
          where('school_id', '==', userProfile.school_id),
          orderBy('created_date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventRequest));
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events list:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventsAndAgencies();
  }, [userProfile]);

  return (
    <SchoolLayout title="طلبات الفعاليات">
      <div className="flex justify-end mb-4">
        <Link to="/school/events/new">
          <Button>إنشاء طلب فعالية جديد</Button>
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">نوع الفعالية</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الجهة المطلوبة</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">تاريخ الإنشاء</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الحالة</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">عرض</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-4"><Spinner /></td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4">لم يتم إنشاء أي طلبات فعاليات بعد.</td></tr>
            ) : (
              events.map(event => (
                <tr key={event.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-semibold">{event.event_type}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{agencies[event.agency_id] || 'غير معروف'}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{event.created_date}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)}`}>
                      {getEventStatusText(event.status)}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link to={`/school/events/${event.id}`} className="text-teal-600 hover:text-teal-900">
                      التفاصيل
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SchoolLayout>
  );
};

export default EventsList;
