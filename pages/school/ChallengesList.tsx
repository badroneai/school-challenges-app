
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Challenge } from '../../types';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { 
    FaTrophy, FaCalendarAlt, FaCheckCircle, FaBoxOpen, 
    FaBullseye, FaHistory, FaStar, FaExternalLinkAlt, FaFilter 
} from 'react-icons/fa';
import { getCurrentDate, getHijriDate } from '../../services/helpers';

const ChallengesList: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [mySubmissions, setMySubmissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) return;
    setLoading(true);
    
    const q = query(collection(db, 'challenges'), where('status', '==', 'published'));
    const unsubChallenges = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
      setChallenges(list);
      if (!userProfile?.school_id) setLoading(false);
    });

    let unsubSubmissions = () => {};
    if (userProfile?.school_id) {
        const subQ = query(collection(db, 'submissions'), where('school_id', '==', userProfile.school_id));
        unsubSubmissions = onSnapshot(subQ, (snapshot) => {
            setMySubmissions(snapshot.docs.map(doc => doc.data().challenge_id));
            setLoading(false);
        });
    }

    return () => {
      unsubChallenges();
      unsubSubmissions();
    };
  }, [user, userProfile]);

  const getCategoryImage = (category: string) => {
      switch(category) {
          case 'ماء': return 'https://images.unsplash.com/photo-1555113066-42c36a2676aa?auto=format&fit=crop&q=80&w=400';
          case 'طاقة': return 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400';
          case 'نفايات': return 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400';
          case 'تشجير': return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400';
          default: return 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=400';
      }
  };

  return (
    <SchoolLayout title="كتالوج التحديات">
      {/* Hero Showcase */}
      <div className="relative mb-10 p-10 rounded-[2.5rem] bg-slate-900 text-white overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Hero" />
        </div>
        <div className="relative z-10 text-right max-w-2xl">
            <h2 className="text-4xl font-black mb-4">أسبوع البيئة المدرسي 🌿</h2>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
                اكتشف تحديات الأسبوع وساهم في جعل مدرستك أكثر استدامة. كل مشاركة ترفع رصيد مدرستك في الترتيب العام للمنطقة.
            </p>
        </div>
        <div className="absolute left-12 bottom-12 hidden lg:flex flex-col items-center p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-1">نقاط مدرستك</p>
            <p className="text-3xl font-black">2,450</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8 px-2">
         <h3 className="text-lg font-black text-slate-800 dark:text-white">التحديات المتاحة ({challenges.length})</h3>
         <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-5 py-2.5 rounded-2xl text-xs font-black shadow-sm transition-all active:scale-95">
           <span>تصفية حسب المجال</span>
           <FaFilter className="text-teal-600" />
         </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <Skeleton key={i} variant="card" className="rounded-[2.5rem] h-[400px]" />)}
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState icon={<FaBoxOpen />} title="لا توجد تحديات منشورة" description="تنتظر مدرستكم تحديات بيئية جديدة! سيتم إبلاغكم فور نشر المشرف لتحديات الأسبوع القادم." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-right">
          {challenges.map((challenge, idx) => {
            const isParticipated = mySubmissions.includes(challenge.id);
            const isExpired = challenge.end_date < getCurrentDate();

            return (
              <div key={challenge.id} className="group animate__animated animate__fadeInUp animate__faster" style={{ animationDelay: `${idx * 100}ms` }}>
                <Card className={`flex flex-col p-0 overflow-hidden rounded-[2rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full bg-white dark:bg-slate-800 ${isExpired ? 'grayscale opacity-75' : ''}`}>
                  {/* Card Media Header */}
                  <div className="relative h-48 overflow-hidden">
                      <img src={getCategoryImage(challenge.category)} alt={challenge.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <Badge variant={challenge.category === 'ماء' ? 'indigo' : challenge.category === 'طاقة' ? 'warning' : 'teal'}>
                            {challenge.category}
                        </Badge>
                      </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{challenge.title}</h3>
                      <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium flex-grow">{challenge.description}</p>
                      
                      <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-700">
                          <div className="flex justify-between items-center text-[11px] font-black text-slate-400">
                              <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-indigo-400" /> ينتهي: {challenge.end_date}</span>
                              <span className="bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-lg text-indigo-600">{challenge.points_multiplier} نقطة</span>
                          </div>

                          <div className="flex gap-2">
                            <Link to={`/school/challenges/${challenge.id}`} className="flex-1">
                                <Button variant="secondary" className="w-full rounded-xl py-3 text-xs font-black bg-slate-50 hover:bg-slate-100 border-none">التفاصيل</Button>
                            </Link>
                            {isParticipated ? (
                                <div className="flex-[1.5] flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs gap-2 border border-emerald-100">
                                    <FaCheckCircle /> مكتمل
                                </div>
                            ) : (
                                <Link to={`/school/challenges/${challenge.id}/new-submission`} className="flex-[1.5]">
                                    <Button className="w-full rounded-xl py-3 text-xs font-black bg-indigo-600 shadow-lg shadow-indigo-500/20 border-none">شارك الآن</Button>
                                </Link>
                            )}
                          </div>
                      </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </SchoolLayout>
  );
};

export default ChallengesList;