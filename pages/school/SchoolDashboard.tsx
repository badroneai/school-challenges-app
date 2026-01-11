
import React, { useEffect, useState } from 'react';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Card from '../../components/ui/Card';
import { FaTasks, FaClipboardCheck, FaUsers, FaStar, FaCalendarAlt, FaChartLine, FaEllipsisH, FaFileAlt } from 'react-icons/fa';
import { Challenge, Submission, InternalEvent } from '../../types';
import { Link } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';

const SchoolDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({
        activeChallenges: 0,
        totalSubmissions: 0,
        totalParticipants: 0,
        totalPoints: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentChallenges, setRecentChallenges] = useState<Challenge[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);

    useEffect(() => {
        let isMounted = true;
        if (!userProfile?.school_id) {
            if (isMounted) setLoading(false);
            return;
        }

        const fetchData = async () => {
            if (isMounted) setLoading(true);
            try {
                const schoolId = userProfile.school_id!;
                const [challengesSnap, submissionsSnap, eventsSnap] = await Promise.all([
                    getDocs(query(collection(db, 'challenges'), where('status', '==', 'published'))),
                    getDocs(query(collection(db, 'submissions'), where('school_id', '==', schoolId))),
                    getDocs(query(collection(db, 'internal_events'), where('school_id', '==', schoolId)))
                ]);

                if (!isMounted) return;

                const challenges = challengesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
                const currentDate = new Date().toISOString().split('T')[0];
                const activeChallenges = challenges.filter(c => c.end_date && c.end_date >= currentDate);
                const submissions = submissionsSnap.docs.map(doc => doc.data() as Submission);
                
                let totalParticipants = 0;
                let challengesPoints = 0;
                const pointsByMonth: { [key: string]: number } = {};
                const pointsByCategory: { [key: string]: number } = {};

                submissions.forEach(sub => {
                    const studentCount = Number(sub.student_count_participated) || 0;
                    totalParticipants += studentCount;
                    const challenge = challenges.find(c => c.id === sub.challenge_id);
                    const multiplier = Number(challenge?.points_multiplier) || 1;
                    const p = studentCount * multiplier;
                    challengesPoints += p;

                    if (sub.date) {
                        const month = sub.date.substring(0, 7);
                        pointsByMonth[month] = (pointsByMonth[month] || 0) + p;
                    }
                    if (challenge && challenge.category) {
                        pointsByCategory[challenge.category] = (pointsByCategory[challenge.category] || 0) + p;
                    }
                });

                const events = eventsSnap.docs.map(doc => doc.data() as InternalEvent);
                const documentedEvents = events.filter(e => e.status === 'documented' && e.points_enabled);
                const eventsPoints = documentedEvents.reduce((sum, e) => sum + (Number(e.points_value) || 0), 0);

                documentedEvents.forEach(e => {
                    if (e.date) {
                        const m = e.date.substring(0, 7);
                        pointsByMonth[m] = (pointsByMonth[m] || 0) + (Number(e.points_value) || 0);
                    }
                    pointsByCategory['فعاليات'] = (pointsByCategory['فعاليات'] || 0) + (Number(e.points_value) || 0);
                });

                setRecentChallenges(activeChallenges.sort((a, b) => (b.start_date || '').localeCompare(a.start_date || '')).slice(0, 3));
                setChartData(Object.keys(pointsByMonth).sort().map(m => ({ name: m, points: pointsByMonth[m] })));
                setCategoryData(Object.keys(pointsByCategory).map(cat => ({ name: cat, value: pointsByCategory[cat] })));
                setStats({ activeChallenges: activeChallenges.length, totalSubmissions: submissions.length, totalParticipants, totalPoints: challengesPoints + eventsPoints });
            } catch (error) {
                console.error("Error fetching dashboard data: ", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [userProfile?.school_id]);
    
    const COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6'];

    const InsightCard = ({ title, value, icon: Icon, colorClass, bgClass }: any) => (
      <Card className="flex items-center justify-between p-6 border-none shadow-sm rounded-2xl group hover:shadow-md transition-all">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
      </Card>
    );

    if (!userProfile?.school_id && !loading) {
        return (
            <SchoolLayout title="لوحة التحكم">
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Card className="p-10 rounded-[2.5rem]">
                        <p className="text-xl font-bold text-gray-500 mb-2">حسابك غير مرتبط بمدرسة بعد</p>
                        <p className="text-gray-400 font-medium">يرجى التواصل مع المشرف لربط حسابك بمدرسة لتتمكن من رؤية الإحصائيات.</p>
                    </Card>
                </div>
            </SchoolLayout>
        );
    }

    return (
        <SchoolLayout title="لوحة القيادة">
            {/* Hero Header */}
            <div className="mb-10 text-right">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">صباح الخير، منسق {userProfile?.display_name?.split(' - ')[0]} 👋</h2>
              <p className="text-slate-500 font-medium mt-1">نحن فخورون بمساهمات مدرستكم. إليكم نظرة على تقدمكم اليوم، {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <InsightCard title="التحديات النشطة" value={stats.activeChallenges} icon={FaTasks} colorClass="text-indigo-600" bgClass="bg-indigo-50 dark:bg-indigo-900/20" />
                <InsightCard title="إجمالي المشاركات" value={stats.totalSubmissions} icon={FaClipboardCheck} colorClass="text-emerald-600" bgClass="bg-emerald-50 dark:bg-emerald-900/20" />
                <InsightCard title="الطلاب الفاعلون" value={stats.totalParticipants} icon={FaUsers} colorClass="text-amber-600" bgClass="bg-amber-50 dark:bg-amber-900/20" />
                <InsightCard title="رصيد النقاط" value={stats.totalPoints} icon={FaStar} colorClass="text-teal-600" bgClass="bg-teal-50 dark:bg-teal-900/20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <Card className="lg:col-span-2 p-0 overflow-hidden rounded-[2.5rem] border-none shadow-sm">
                    <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-lg">
                            <FaChartLine size={16} />
                          </div>
                          <h3 className="font-bold text-lg text-slate-800 dark:text-white">اتجاه نمو النقاط الأسبوعي</h3>
                        </div>
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                          <FaEllipsisH />
                        </button>
                    </div>
                    <div className="p-8 h-72 w-full" dir="ltr">
                        {loading ? <div className="h-full flex items-center justify-center"><Spinner /></div> : (
                            chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', textAlign: 'right' }} />
                                        <Line type="monotone" dataKey="points" stroke="#0d9488" strokeWidth={4} dot={{ r: 5, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} name="النقاط" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : <div className="h-full flex items-center justify-center text-gray-400 italic font-medium">لا توجد بيانات كافية للرسم</div>
                        )}
                    </div>
                </Card>

                <Card className="p-0 overflow-hidden rounded-[2.5rem] border-none shadow-sm">
                    <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white text-right">توزيع النقاط حسب الفئة</h3>
                    </div>
                    <div className="p-8 h-72 w-full" dir="ltr">
                        {loading ? <div className="h-full flex items-center justify-center"><Spinner /></div> : (
                            categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: '600'}} />
                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', textAlign: 'right' }} />
                                        <Bar dataKey="value" name="النقاط" radius={[0, 6, 6, 0]} barSize={20}>
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <div className="h-full flex items-center justify-center text-gray-400 italic font-medium text-center">لا توجد مشاركات لتبويبها</div>
                        )}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border-none shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <Link to="/school/challenges" className="text-xs font-bold text-teal-600 hover:underline">عرض الكل</Link>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">أحدث التحديات المتاحة</h2>
                    </div>
                    {loading ? <div className="py-10"><Spinner /></div> : (
                        <ul className="space-y-4">
                            {recentChallenges.length > 0 ? recentChallenges.map(challenge => (
                                <li key={challenge.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border-r-4 border-teal-500 hover:bg-slate-100 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-black">{challenge.category}</span>
                                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-teal-700 transition-colors">{challenge.title}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2 text-right">الموعد النهائي: {challenge.end_date} م</p>
                                </li>
                            )) : <p className="text-slate-500 text-center py-6 italic font-medium">لا توجد تحديات نشطة في الوقت الحالي.</p>}
                        </ul>
                    )}
                </Card>
                
                <Card className="bg-gradient-to-br from-teal-600 to-teal-800 text-white border-none shadow-xl rounded-[2.5rem] p-10 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold mb-6 text-right leading-tight">مركز الوصول السريع</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/school/internal-events" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-center py-6 rounded-2xl transition-all hover:scale-105 flex flex-col items-center gap-3">
                            <FaCalendarAlt size={24} />
                            <span className="text-sm font-bold">الفعاليات</span>
                        </Link>
                        <Link to={`/reports/view/submissions?schoolId=${userProfile?.school_id}`} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-center py-6 rounded-2xl transition-all hover:scale-105 flex flex-col items-center gap-3">
                            <FaFileAlt size={24} />
                            <span className="text-sm font-bold">تقرير رسمي</span>
                        </Link>
                    </div>
                </Card>
            </div>
        </SchoolLayout>
    );
};

export default SchoolDashboard;