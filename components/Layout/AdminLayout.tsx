
import React, { ReactNode } from 'react';
import LayoutShell, { NavItem } from './LayoutShell';
import { 
  FaTachometerAlt, FaSchool, FaUsers, FaBuilding, 
  FaBullseye, FaInbox, FaChartPie, FaCheckDouble, FaCalendarAlt 
} from 'react-icons/fa';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const navItems: NavItem[] = [
    { name: 'لوحة التحكم', path: '/admin', icon: FaTachometerAlt },
    { name: 'اعتماد الخدمات', path: '/admin/approve-offerings', icon: FaCheckDouble },
    { name: 'التحليلات والإحصاء', path: '/admin/analytics', icon: FaChartPie },
    { name: 'طلبات الجهات', path: '/admin/requests', icon: FaInbox }, 
    { name: 'إدارة التحديات', path: '/admin/challenges', icon: FaBullseye },
    { name: 'إدارة المدارس', path: '/admin/schools', icon: FaSchool },
    { name: 'إدارة المستخدمين', path: '/admin/users', icon: FaUsers },
    { name: 'إدارة الجهات', path: '/admin/agencies', icon: FaBuilding },
    { name: 'فعاليات المدارس', path: '/admin/internal-events', icon: FaCalendarAlt },
  ];

  return (
    <LayoutShell
      title={title}
      roleLabel="الإدارة العليا"
      sidebarSubtitle="نظام الإدارة المركزية"
      navItems={navItems}
    >
      {children}
    </LayoutShell>
  );
};

export default AdminLayout;
