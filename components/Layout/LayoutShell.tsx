
import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaSignOutAlt, FaMoon, FaSun, FaBars, FaTimes, FaUserCircle 
} from 'react-icons/fa';
import NotificationBell from '../ui/NotificationBell';
import Breadcrumbs from '../ui/Breadcrumbs';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface LayoutShellProps {
  children: ReactNode;
  title: string;
  sidebarTitle?: string;
  sidebarSubtitle?: string;
  roleLabel?: string;
  navItems: NavItem[];
  userDisplayName?: string;
}

const LayoutShell: React.FC<LayoutShellProps> = ({ 
  children, 
  title, 
  sidebarTitle = 'تحدي المدارس', 
  sidebarSubtitle, 
  roleLabel, 
  navItems,
  userDisplayName
}) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = userDisplayName || userProfile?.display_name?.split(' - ')[0] || 'المستخدم';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
        navigate('/login');
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="h-24 flex flex-col items-center justify-center border-b border-slate-800 bg-slate-950/50 px-6 text-center">
        <span className="text-xl font-black text-white tracking-tight">{sidebarTitle}</span>
        <span className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mt-1 truncate w-full">
          {sidebarSubtitle || roleLabel}
        </span>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === navItems[0].path} // Assume first item is dashboard root
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-ui-component text-sm font-bold transition-all duration-300 ${
                isActive 
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`
            }
          >
            <span>{item.name}</span>
            <item.icon className="h-4 w-4 opacity-80" />
          </NavLink>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-800 bg-slate-950 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3 rounded-ui-component text-functional-danger hover:bg-functional-danger/10 transition-colors font-bold text-sm active:scale-95 group">
              <span>تسجيل الخروج</span>
              <FaSignOutAlt className="group-hover:translate-x-[-4px] transition-transform" />
          </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-slate-950 text-white flex-col border-l border-slate-800 shadow-2xl z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-80 bg-slate-950 text-white flex flex-col transition-transform duration-500 ease-out transform lg:hidden ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-end p-6 border-b border-slate-800">
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors"><FaTimes size={20}/></button>
        </div>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center px-6 md:px-10 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4 md:gap-8 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-ui-component lg:hidden active:scale-90 transition-all border border-slate-200 dark:border-slate-700"
            >
              <FaBars size={18} />
            </button>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-brand-primary dark:text-brand-primary uppercase tracking-[0.2em] mb-0.5 sm:block hidden">{roleLabel}</span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white line-clamp-1">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
             <NotificationBell />
             <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-500 hover:rotate-90"
            >
              {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
            </button>

            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 pr-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
              >
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{displayName}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">{roleLabel}</span>
                </div>
                <div className="bg-brand-primary/10 text-brand-primary p-2.5 rounded-ui-component">
                  <FaUserCircle size={22} />
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute left-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-ui-component shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-[60] animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-functional-danger hover:bg-functional-danger/5 transition-colors"
                  >
                    <span>تسجيل الخروج</span>
                    <FaSignOutAlt />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 md:p-10 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs />
            <div className="animate-page-entry">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutShell;
