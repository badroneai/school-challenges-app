import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { FaUserClock, FaSignOutAlt } from 'react-icons/fa';

const PendingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        if (auth) {
            await auth.signOut();
            navigate('/login');
        }
    } catch (error) {
        console.error("Logout error", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
        <Card className="max-w-md w-full text-center p-8">
            <div className="flex justify-center mb-6">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full text-yellow-600 dark:text-yellow-400">
                    <FaUserClock size={48} />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">تم إنشاء الحساب بنجاح!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                يرجى الانتظار حتى يقوم المشرف بتفعيل حسابك وتعيين الصلاحيات المناسبة لاستخدام المنصة.
            </p>
            <Button variant="danger" onClick={handleLogout} className="w-full flex justify-center items-center gap-2">
                <FaSignOutAlt /> تسجيل الخروج
            </Button>
        </Card>
    </div>
  );
};

export default PendingPage;