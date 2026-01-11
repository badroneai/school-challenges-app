
import React, { ReactNode, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Agency } from '../../types';
import LayoutShell, { NavItem } from './LayoutShell';
import { 
  FaTachometerAlt, FaBullhorn, FaListAlt, FaCog 
} from 'react-icons/fa';

interface EntityLayoutProps {
  children: ReactNode;
  title: string;
}

const EntityLayout: React.FC<EntityLayoutProps> = ({ children, title }) => {
  const { userProfile } = useAuth();
  const [agencyName, setAgencyName] = useState('');

  useEffect(() => {
    const fetchAgencyName = async () => {
      if (userProfile?.agency_id && db) {
        const agencyDocRef = doc(db, 'agencies', userProfile.agency_id);
        const agencyDoc = await getDoc(agencyDocRef);
        if (agencyDoc.exists()) {
          const agencyData = agencyDoc.data() as Agency;
          setAgencyName(agencyData.name_ar);
        }
      }
    };
    fetchAgencyName();
  }, [userProfile]);

  const navItems: NavItem[] = [
    { name: 'الرئيسية', path: '/entity', icon: FaTachometerAlt },
    { name: 'كتالوج الخدمات', path: '/entity/services', icon: FaListAlt },
    { name: 'مبادراتي المجدولة', path: '/entity/initiatives', icon: FaBullhorn },
    { name: 'الملف التعريفي', path: '/entity/settings', icon: FaCog },
  ];

  return (
    <LayoutShell
      title={title}
      roleLabel="بوابة الشريك"
      sidebarTitle="بوابة الشركاء"
      sidebarSubtitle={agencyName || 'جهة معتمدة'}
      navItems={navItems}
    >
      {children}
    </LayoutShell>
  );
};

export default EntityLayout;
