
import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';
import Spinner from './components/ui/Spinner';
import { isFirebaseConfigured } from './firebase';

// --- استيراد الصفحات بشكل كسول (Lazy Loading) ---
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const PendingPage = lazy(() => import('./pages/auth/PendingPage'));
const NotificationsPage = lazy(() => import('./pages/shared/NotificationsPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard'));
const ManageSchools = lazy(() => import('./pages/admin/ManageSchools'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const AgenciesManager = lazy(() => import('./pages/admin/AgenciesManager'));
const ChallengesManager = lazy(() => import('./pages/admin/ChallengesManager'));
const SchoolEvents = lazy(() => import('./pages/admin/SchoolEvents'));
const RequestsList = lazy(() => import('./pages/admin/RequestsList'));
const ApproveOfferings = lazy(() => import('./pages/admin/ApproveOfferings'));
const SchoolDashboard = lazy(() => import('./pages/school/SchoolDashboard'));
const ChallengesList = lazy(() => import('./pages/school/ChallengesList'));
const ChallengeDetails = lazy(() => import('./pages/school/ChallengeDetails'));
const NewSubmission = lazy(() => import('./pages/school/NewSubmission'));
const EventDetails = lazy(() => import('./pages/school/EventDetails'));
const AgencyRequest = lazy(() => import('./pages/school/AgencyRequest'));
const NewEvent = lazy(() => import('./pages/school/NewEvent'));
const Reports = lazy(() => import('./pages/school/Reports'));
const Settings = lazy(() => import('./pages/school/Settings')); 
const InternalEventsList = lazy(() => import('./pages/school/InternalEventsList'));
const NewInternalEvent = lazy(() => import('./pages/school/NewInternalEvent'));
const InternalEventDetails = lazy(() => import('./pages/school/InternalEventDetails'));
const DocumentInternalEvent = lazy(() => import('./pages/school/DocumentInternalEvent'));
const EntityDashboard = lazy(() => import('./pages/entity/Dashboard'));
const MyInitiatives = lazy(() => import('./pages/entity/MyInitiatives'));
const ServiceCatalog = lazy(() => import('./pages/entity/ServiceCatalog'));
const EntitySettings = lazy(() => import('./pages/entity/EntitySettings'));
const ReportView = lazy(() => import('./pages/shared/ReportView'));

const AppRoutes: React.FC = () => {
  const { user, loading, userProfile } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;

  if (!user || !userProfile) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><Spinner /></div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    );
  }

  const getHomeRoute = () => {
      switch(userProfile.role) {
          case UserRole.SUPER_ADMIN: return "/admin";
          case UserRole.SCHOOL_COORDINATOR: return "/school";
          case UserRole.ENTITY_MANAGER: return "/entity";
          default: return "/pending";
      }
  };

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900"><Spinner /></div>}>
      <Routes>
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/signup" element={<Navigate to="/" />} />
        <Route path="/" element={<Navigate to={getHomeRoute()} />} />
        <Route path="/pending" element={<PendingPage />} />

        {/* Shared Protected Routes */}
        <Route path="/notifications" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.SCHOOL_COORDINATOR, UserRole.ENTITY_MANAGER]}><NotificationsPage /></ProtectedRoute>} />
        <Route path="/reports/view/:type" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.SCHOOL_COORDINATOR]}><ReportView /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><RequestsList /></ProtectedRoute>} />
        <Route path="/admin/challenges" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><ChallengesManager /></ProtectedRoute>} />
        <Route path="/admin/schools" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><ManageSchools /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/agencies" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><AgenciesManager /></ProtectedRoute>} />
        <Route path="/admin/internal-events" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><SchoolEvents /></ProtectedRoute>} />
        <Route path="/admin/approve-offerings" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><ApproveOfferings /></ProtectedRoute>} />

        {/* School Coordinator Routes */}
        <Route path="/school" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><SchoolDashboard /></ProtectedRoute>} />
        <Route path="/school/internal-events" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><InternalEventsList /></ProtectedRoute>} />
        <Route path="/school/internal-events/new" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><NewInternalEvent /></ProtectedRoute>} />
        <Route path="/school/internal-events/:id" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><InternalEventDetails /></ProtectedRoute>} />
        <Route path="/school/internal-events/:id/document" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><DocumentInternalEvent /></ProtectedRoute>} />
        <Route path="/school/challenges" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><ChallengesList /></ProtectedRoute>} />
        <Route path="/school/challenges/:id" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><ChallengeDetails /></ProtectedRoute>} />
        <Route path="/school/challenges/:id/new-submission" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><NewSubmission /></ProtectedRoute>} />
        <Route path="/school/agency-requests" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><AgencyRequest /></ProtectedRoute>} />
        <Route path="/school/events/new" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><NewEvent /></ProtectedRoute>} />
        <Route path="/school/events/:id" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><EventDetails /></ProtectedRoute>} />
        <Route path="/school/reports" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><Reports /></ProtectedRoute>} />
        <Route path="/school/settings" element={<ProtectedRoute roles={[UserRole.SCHOOL_COORDINATOR]}><Settings /></ProtectedRoute>} />

        {/* Entity Manager Routes */}
        <Route path="/entity" element={<ProtectedRoute roles={[UserRole.ENTITY_MANAGER, UserRole.SUPER_ADMIN]}><EntityDashboard /></ProtectedRoute>} />
        <Route path="/entity/initiatives" element={<ProtectedRoute roles={[UserRole.ENTITY_MANAGER, UserRole.SUPER_ADMIN]}><MyInitiatives /></ProtectedRoute>} />
        <Route path="/entity/services" element={<ProtectedRoute roles={[UserRole.ENTITY_MANAGER, UserRole.SUPER_ADMIN]}><ServiceCatalog /></ProtectedRoute>} />
        <Route path="/entity/settings" element={<ProtectedRoute roles={[UserRole.ENTITY_MANAGER, UserRole.SUPER_ADMIN]}><EntitySettings /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};


const App: React.FC = () => {
  if (!isFirebaseConfigured) {
    return (
      <div dir="rtl" className="flex items-center justify-center h-screen bg-gray-100 p-8 font-sans">
        <div className="max-w-3xl w-full">
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">خطوة أخيرة لإعداد التطبيق!</h1>
          <div className="text-right bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm mb-6">
              <h2 className="font-bold mb-3 text-xl text-blue-800">إعداد Firebase</h2>
              <p className="text-blue-700">يرجى إضافة مفاتيح API الخاصة بك في ملف firebaseConfig.ts.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;