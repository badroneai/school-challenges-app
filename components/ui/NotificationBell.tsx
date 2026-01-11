
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckDouble, FaCircle, FaInfoCircle, FaStar, FaBullseye, FaClipboardList, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationType } from '../../types';
import Spinner from './Spinner';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const lastFiveNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-full transition-all active:scale-95" aria-label="الإشعارات">
        <FaBell className={`w-5 h-5 ${unreadCount > 0 ? 'text-indigo-600' : ''}`} />
        {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce shadow-sm">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50">
            {unreadCount > 0 && (
              <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-black flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg shadow-sm">
                <span>تحديد الكل</span>
                <FaCheckDouble />
              </button>
            )}
            <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>التنبيهات</span>
              <FaBell className="text-indigo-600" />
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? <div className="p-8 flex justify-center"><Spinner /></div> : notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <FaBell className="mx-auto mb-3 opacity-20" size={48} />
                <p className="text-sm font-bold">لا توجد تنبيهات حالياً</p>
              </div>
            ) : (
              lastFiveNotifications.map(n => {
                const style = getNotificationStyle(n.type);
                return (
                  <div key={n.id} onClick={() => !n.read && markAsRead(n.id)} className={`p-4 border-b border-gray-50 flex gap-4 cursor-pointer transition-colors relative ${!n.read ? 'bg-indigo-50/20 border-r-4 border-r-indigo-500' : 'hover:bg-gray-50'}`}>
                    <div className="flex-1 text-right min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? 'font-black text-gray-900' : 'font-bold text-gray-500'}`}>{n.title}</p>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 font-medium">{n.message}</p>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-gray-400 mt-2 font-black">
                        <span>{n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}</span>
                        <FaCalendarAlt size={8} />
                      </div>
                    </div>
                    <div className={`mt-1 p-2.5 rounded-xl h-fit ${style.color} shadow-sm`}>{style.icon}</div>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-3 text-center border-t border-gray-100 bg-slate-50/30">
             <button onClick={() => { setIsOpen(false); navigate('/notifications'); }} className="text-[11px] font-black text-indigo-600 hover:underline">عرض كافة الإشعارات</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
