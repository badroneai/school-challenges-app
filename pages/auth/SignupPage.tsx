
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserRole } from '../../types';
import { getCurrentDate } from '../../services/helpers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) return setError('كلمات المرور غير متطابقة');
    if (password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');

    setLoading(true);
    try {
      if (auth && db) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (user) {
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                display_name: name,
                role: UserRole.USER, 
                school_id: null,
                agency_id: null,
                is_approved: false,
                created_date: getCurrentDate(),
            });

            await updateProfile(user, { displayName: name });
            navigate('/pending');
        }
      } else {
        setError('خطأ في إعداد Firebase.');
      }
    } catch (err: any) {
      console.error("Signup Error:", err);
      setError('حدث خطأ أثناء التسجيل: ' + (err.message || 'غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          تسجيل حساب جديد
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSignup}>
            <Input id="name" name="name" type="text" label="الاسم الكامل" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input id="email" name="email" type="email" label="البريد الإلكتروني" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="password" name="password" type="password" label="كلمة المرور" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input id="confirmPassword" name="confirmPassword" type="password" label="تأكيد كلمة المرور" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            {error && <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</div>}

            <Button type="submit" className="w-full flex justify-center py-2" isLoading={loading}>إنشاء حساب</Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-800 text-gray-500 font-medium">لديك حساب بالفعل؟</span></div>
            </div>
            <div className="mt-6">
              <Link to="/login" className="w-full flex justify-center py-2 px-4 border border-teal-600 rounded-md shadow-sm text-sm font-bold text-teal-600 bg-white hover:bg-teal-50 dark:bg-gray-700 dark:text-teal-400 dark:hover:bg-gray-600 transition-colors">تسجيل الدخول</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
