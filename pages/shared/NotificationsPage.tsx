
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationType, UserRole } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import EntityLayout from '../../components/Layout/EntityLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { 
  FaBell, FaCheckDouble, FaFilter, FaStar, FaBullseye, 
  FaClipboardList, FaCheckCircle, FaInfoCircle, FaCalendarAlt 
} from 'react-icons/fa';

const NotificationsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchStatus = statusFilter === 'all' || !n.read;
      const matchType = typeFilter === 'all' || n.type === typeFilter;
      return matchStatus && matchType;
    });
  }, [notifications, statusFilter, typeFilter]);

  const displayedNotifications = filteredNotifications.slice(0, visibleCount);

  const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case NotificationType.POINTS_EARNED: return { icon: <FaStar />, color: 'text-yellow-500 bg-yellow-50' };
      case NotificationType.NEW_CHALLENGE: return { icon: <FaBullseye />, color: 'text-teal-500 bg-teal-50' };
      case NotificationType.REQUEST_STATUS: return { icon: <FaInfoCircle />, color: 'text-blue-500 bg-blue-50' };
      case NotificationType.NEW_REQUEST: return { icon: <FaClipboardList />, color: 'text-purple-500 bg-purple-50' };
      case NotificationType.EVENT_APPROVED: return { icon: <FaCheckCircle />, color: 'text-green-500 bg-green-50' };
      default: return { icon: <FaBell />, color: 'text-gray-400 bg-gray-50' };
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.read) await markAsRead(n.id);
    if (n.type === NotificationType.NEW_CHALLENGE) navigate('/school/challenges');
    else if (n.type === NotificationType.REQUEST_STATUS) navigate('/school/agency-requests');
    else if (n.data?.eventId) navigate(`/school/internal-events/${n.data.eventId}`);
    else if (n.data?.requestId) navigate(`/school/events/${n.data.requestId}`);
  };

  const renderWithLayout = (content: React.ReactNode) => {
    const title = "مركز الإشعارات";
    switch (userProfile?.role) {
      case UserRole.SUPER_ADMIN: return <AdminLayout title={title}>{content}</AdminLayout>;
      case UserRole.SCHOOL_COORDINATOR: return <SchoolLayout title={title}>{content}</SchoolLayout>;
      case UserRole.ENTITY_MANAGER: return <EntityLayout title={title}>{content}</EntityLayout>;
      default: return <div className="p-8">{content}</div>;
    }
  };

  const content = (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <FaBell className="text-teal-600" /> مركز التنبيهات
            {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-black animate-pulse">{unreadCount} جديد</span>}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-bold">تابع آخر التحديثات والنشاطات المتعلقة بحسابك</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="secondary" className="flex items-center gap-2 text-xs bg-white dark:bg-gray-800 border rounded-xl">
              <FaCheckDouble className="text-teal-600" /> تحديد الكل كمقروء
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4 border-none shadow-sm flex flex-wrap gap-4 items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-[1.5rem]">
        <div className="flex items-center gap-2 text-xs font-black text-gray-600 dark:text-gray-400">
          <FaFilter size={12} /> تصفية:
        </div>
        <div className="flex bg-white dark:bg-gray-700 p-1 rounded-xl border dark:border-gray-600">
          <button 
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${statusFilter === 'all' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-500'}`}
          >الكل</button>
          <button 
            onClick={() => setStatusFilter('unread')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${statusFilter === 'unread' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-500'}`}
          >غير المقروء</button>
        </div>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center"><Spinner /></div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState 
            icon={<FaBell />}
            title="صندوق الوارد فارغ"
            description="لا توجد تنبيهات جديدة حالياً. سنقوم بإبلاغك فور حدوث أي تحديث على طلباتك أو عند نشر تحديات جديدة."
          />
        ) : (
          <>
            {displayedNotifications.map((n) => {
              const style = getNotificationStyle(n.type);
              return (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-5 rounded-[1.5rem] border transition-all cursor-pointer group relative overflow-hidden ${
                    !n.read 
                    ? 'bg-white dark:bg-gray-800 border-teal-200 dark:border-teal-900 shadow-sm ring-1 ring-teal-50' 
                    : 'bg-gray-50/40 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  {!n.read && <div className="absolute top-0 right-0 w-1 h-full bg-teal-500"></div>}
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-xl h-fit ${style.color} dark:bg-opacity-10 text-xl group-hover:scale-110 transition-transform`}>
                      {style.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-base ${!n.read ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-700 dark:text-gray-300'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                          <FaCalendarAlt size={8} />
                          {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString('ar-SA') : 'الآن'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed font-medium">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredNotifications.length > visibleCount && (
              <div className="text-center pt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="px-8 border shadow-sm bg-white dark:bg-gray-800 rounded-xl font-black"
                >
                  تحميل المزيد من الإشعارات
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return renderWithLayout(content);
};

export default NotificationsPage;
