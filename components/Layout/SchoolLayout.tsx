
import React, { ReactNode, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { School } from '../../types';
import LayoutShell, { NavItem } from './LayoutShell';
import { 
  FaTachometerAlt, FaTasks, FaCalendarDay, 
  FaHandshake, FaCog 
} from 'react-icons/fa';

interface SchoolLayoutProps {
  children: ReactNode;
  title: string;
}

const SchoolLayout: React.FC<SchoolLayoutProps> = ({ children, title }) => {
  const { userProfile } = useAuth();
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    const fetchSchoolName = async () => {
      if (userProfile?.school_id && db) {
        const schoolDocRef = doc(db, 'schools', userProfile.school_id);
        const schoolDoc = await getDoc(schoolDocRef);
        if (schoolDoc.exists()) {
          const schoolData = schoolDoc.data() as School;
          setSchoolName(schoolData.name_ar);
        }
      }
    };
    fetchSchoolName();
  }, [userProfile]);

  const navItems: NavItem[] = [
    { name: 'لوحة التحكم', path: '/school', icon: FaTachometerAlt },
    { name: 'الفعاليات الداخلية', path: '/school/internal-events', icon: FaCalendarDay },
    { name: 'التحديات الأسبوعية', path: '/school/challenges', icon: FaTasks },
    { name: 'التنسيق الخارجي', path: '/school/agency-requests', icon: FaHandshake },
    { name: 'التقارير التحليلية', path: '/school/reports', icon: FaCog }, 
    { name: 'إعدادات الهوية', path: '/school/settings', icon: FaCog },
  ];

  return (
    <LayoutShell
      title={title}
      roleLabel="بوابة المدرسة"
      sidebarSubtitle={schoolName || 'بوابة المنسق'}
      navItems={navItems}
    >
      {children}
    </LayoutShell>
  );
};

export default SchoolLayout;
