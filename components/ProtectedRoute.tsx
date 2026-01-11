
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  roles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // 1. إذا لم يكن مسجلاً، اذهب لصفحة الدخول
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. إذا لم يكتمل تحميل الملف الشخصي، اذهب للدخول
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  // 3. التحقق من حالة التفعيل
  // استثناء: المشرف العام (SUPER_ADMIN) مفعل دائماً منطقياً، وصفحة الانتظار لا تعيد التوجيه لنفسها
  const isApproved = userProfile.is_approved === true || userProfile.role === UserRole.SUPER_ADMIN;

  if (!isApproved && location.pathname !== '/pending') {
    return <Navigate to="/pending" replace />;
  }

  // 4. التحقق من الصلاحيات (Roles)
  if (roles.includes(userProfile.role)) {
    return <>{children}</>;
  }

  // 5. إذا كان مفعل ولكن ليس لديه الصلاحية لهذا المسار الموحد، اذهب للرئيسية المناسبة لدوره
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
