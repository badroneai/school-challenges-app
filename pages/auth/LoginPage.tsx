
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDemoLogin = async (type: 'admin' | 'school' | 'entity') => {
    setLoading(true);
    let demoEmail = '';
    const demoPassword = '123456';
    
    if (type === 'admin') { 
      demoEmail = 'admin@demo.com'; 
    } else if (type === 'school') { 
      demoEmail = 'school@demo.com'; 
    } else if (type === 'entity') { 
      demoEmail = 'agency@demo.com'; 
    }

    try {
        if (!auth) throw new Error();

        try {
            await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
        } catch (e) {
            // محاولة إنشاء الحساب في Authentication فقط إذا لم يكن موجوداً
            // ملاحظة: لن يتم إنشاء بيانات في Firestore، يعتمد على البيانات الموجودة مسبقاً
            await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
        }

        navigate('/');
    } catch (err: any) {
        console.error(err);
        setError('خطأ في الدخول السريع.');
    } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (err: any) {
      setError('خطأ في البريد الإلكتروني أو كلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 px-6 lg:px-8 font-sans" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 rounded-2xl bg-teal-600 text-white mb-4 shadow-lg shadow-teal-500/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">منصة تحديات المدارس</h2>
        <p className="mt-2 text-slate-500 font-bold">Pilot Version 1.0</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-10 border-none shadow-2xl rounded-[2rem]">
          <form className="space-y-6" onSubmit={handleLogin}>
            <Input id="email" label="البريد الإلكتروني" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="password" label="كلمة المرور" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

            {error && <div className="bg-red-50 p-3 rounded-xl text-red-600 text-sm text-center font-bold border border-red-100">{error}</div>}

            <Button type="submit" className="w-full justify-center text-lg py-4 rounded-2xl shadow-xl shadow-teal-500/20" isLoading={loading}>دخول للمنصة</Button>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                <div className="relative flex justify-center text-xs"><span className="px-4 bg-white dark:bg-slate-800 text-slate-400 font-black tracking-widest uppercase">دخول تجريبي سريع</span></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => handleDemoLogin('admin')} className="flex flex-col items-center gap-1 p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-100 dark:border-slate-700 rounded-2xl transition group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🛡️</span>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">مشرف</span>
                </button>
                <button type="button" onClick={() => handleDemoLogin('school')} className="flex flex-col items-center gap-1 p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 border border-slate-100 dark:border-slate-700 rounded-2xl transition group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🏫</span>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">مدرسة</span>
                </button>
                <button type="button" onClick={() => handleDemoLogin('entity')} className="flex flex-col items-center gap-1 p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-100 dark:border-slate-700 rounded-2xl transition group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🤝</span>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">شريك</span>
                </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
