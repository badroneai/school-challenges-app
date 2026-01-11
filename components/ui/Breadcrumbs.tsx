
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronLeft, FaHome } from 'react-icons/fa';

/**
 * قاموس ترجمة المسارات إلى مسميات عربية مفهومة للمستخدم
 */
const ROUTE_LABELS: Record<string, string> = {
  admin: 'الرئيسية',
  analytics: 'التحليلات والإحصاء',
  requests: 'طلبات الجهات',
  challenges: 'إدارة التحديات',
  schools: 'إدارة المدارس',
  users: 'إدارة المستخدمين',
  agencies: 'إدارة الجهات',
  'internal-events': 'فعاليات المدارس',
  school: 'الرئيسية',
  entity: 'الرئيسية',
  initiatives: 'مبادراتي',
  'new-submission': 'مشاركة جديدة',
  'agency-requests': 'طلب من الجهات',
  events: 'أرشيف الطلبات',
  reports: 'التقارير',
  settings: 'الإعدادات',
  new: 'جديد',
  document: 'توثيق الفعالية',
  notifications: 'الإشعارات'
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // إذا كان المستخدم في الصفحة الرئيسية للدور (admin, school, entity) لا نعرض المسار
  if (pathnames.length <= 1) return null;

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb" dir="rtl">
      <ol className="inline-flex items-center space-x-reverse space-x-2 md:space-x-reverse md:space-x-3">
        {/* أيقونة الصفحة الرئيسية */}
        <li className="inline-flex items-center">
          <Link
            to={`/${pathnames[0]}`}
            className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <FaHome className="ml-2 w-3 h-3" />
            {ROUTE_LABELS[pathnames[0]] || 'الرئيسية'}
          </Link>
        </li>

        {pathnames.slice(1).map((value, index) => {
          const last = index === pathnames.length - 2;
          const to = `/${pathnames.slice(0, index + 2).join('/')}`;
          
          // محاولة الحصول على اسم المسار من القاموس، أو تنظيف النص إذا كان ID
          const label = ROUTE_LABELS[value] || (value.length > 15 ? 'تفاصيل' : value);

          return (
            <li key={to}>
              <div className="flex items-center">
                <FaChevronLeft className="w-2 h-2 text-gray-400 mx-1" />
                {last ? (
                  <span className="mr-1 text-xs font-black text-indigo-700 dark:text-indigo-400 cursor-default">
                    {label}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="mr-1 text-xs font-bold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
