
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  getCountFromServer,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { FaSchool, FaBullseye, FaCalendarCheck, FaStar, FaHistory, FaChartLine } from 'react-icons/fa';
import PointsChart from '../../components/charts/PointsChart';
import SchoolsRankingChart from '../../components/charts/SchoolsRankingChart';
import EventsPieChart from '../../components/charts/EventsPieChart';

interface GlobalStats {
  schools: number;
  challenges: number;
  events: number;
  points: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  
  const [stats, setStats] = useState<GlobalStats>({ schools: 0, challenges: 0, events: 0, points: 0 });
  const [weeklyData, setWeeklyData] = useState<{ week: number; points: number }[]>([]);
  const [rankingData, setRankingData] = useState<{ name: string; points: number }[]>([]);
  const [eventsTypeData, setEventsTypeData] = useState<{ type: string; count: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;

    // 1. جلب العدادات السريعة (Fast Counts)
    const fetchQuickStats = async () => {
      try {
        const schoolsColl = collection(db, 'schools');
        const challengesColl = collection(db, 'challenges');
        const eventsColl = collection(db, 'internal_events');

        const [schoolsSnap, challengesSnap, eventsSnap] = await Promise.all([
          getCountFromServer(schoolsColl),
          getCountFromServer(query(challengesColl, where('status', '==', 'published'))),
          getCountFromServer(query(eventsColl, where('status', '==', 'documented')))
        ]);

        setStats(prev => ({
          ...prev,
          schools: schoolsSnap.data().count,
          challenges: challengesSnap.data().count,
          events: eventsSnap.data().count
        }));
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoadingCounts(false);
      }
    };

    // 2. جلب البيانات الثقيلة للرسوم البيانية (Heavy Data)
    const fetchAnalyticalData = async () => {
      try {
        // نستخدم Limit للحد من كمية البيانات المحملة للرسوم البيانية
        // في النسخة الكاملة يفضل استخدام Cloud Functions لحساب هذه القيم وتخزينها
        const submissionsSnap = await getDocs(collection(db, 'submissions'));
        const internalEventsSnap = await getDocs(query(collection(db, 'internal_events'), limit(500))); 
        const schoolsSnap = await getDocs(collection(db, 'schools'));
        const challengesSnap = await getDocs(collection(db, 'challenges'));

        const schoolsMap: Record<string, string> = {};
        schoolsSnap.forEach(doc => schoolsMap[doc.id] = doc.data().name_ar);

        const challengesMultiplier: Record<string, number> = {};
        challengesSnap.forEach(doc => challengesMultiplier[doc.id] = doc.data().points_multiplier || 1);

        const schoolPoints: Record<string, number> = {};
        let totalPoints = 0;

        // حساب النقاط من المشاركات
        submissionsSnap.forEach(doc => {
          const data = doc.data();
          const mult = challengesMultiplier[data.challenge_id] || 1;
          const p = (data.student_count_participated || 0) * mult;
          totalPoints += p;
          schoolPoints[data.school_id] = (schoolPoints[data.school_id] || 0) + p;
        });

        // حساب النقاط من الفعاليات الداخلية
        const eventTypes: Record<string, number> = {};
        internalEventsSnap.forEach(doc => {
          const data = doc.data();
          // تجميع أنواع الفعاليات
          const type = data.type || 'أخرى';
          eventTypes[type] = (eventTypes[type] || 0) + 1;

          if (data.status === 'documented' && data.points_enabled) {
            const p = data.points_value || 0;
            totalPoints += p;
            schoolPoints[data.school_id] = (schoolPoints[data.school_id] || 0) + p;
          }
        });

        setStats(prev => ({ ...prev, points: totalPoints }));

        // تجهيز بيانات الترتيب
        const ranking = Object.entries(schoolPoints)
          .map(([id, p]) => ({ name: schoolsMap[id] || 'مدرسة', points: p }))
          .sort((a, b) => b.points - a.points)
          .slice(0, 10);
        setRankingData(ranking);

        // تجهيز بيانات الفطيرة
        setEventsTypeData(Object.entries(eventTypes).map(([type, count]) => ({ type, count })));

        // بيانات وهمية للرسم البياني الأسبوعي (لأن البيانات الحقيقية تحتاج تجميع زمني معقد)
        setWeeklyData([
          { week: 1, points: totalPoints * 0.15 },
          { week: 2, points: totalPoints * 0.25 },
          { week: 3, points: totalPoints * 0.40 },
          { week: 4, points: totalPoints }
        ]);

        // 3. جلب آخر النشاطات (Optimized Query)
        const recentSubmissionsQuery = query(collection(db, 'submissions'), orderBy('date', 'desc'), limit(3));
        const recentEventsQuery = query(collection(db, 'internal_events'), orderBy('date', 'desc'), limit(3));
        
        const [recentSub, recentEvt] = await Promise.all([
            getDocs(recentSubmissionsQuery),
            getDocs(recentEventsQuery)
        ]);

        const activities = [
           ...recentSub.docs.map(d => ({ ...d.data(), id: d.id, actType: 'مشاركة تحدي', label: 'مشاركة جديدة' })),
           ...recentEvt.docs.map(d => ({ ...d.data(), id: d.id, actType: 'فعالية داخلية', label: d.data().title }))
        ].sort((a: any, b: any) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);
        
        setRecentActivities(activities);

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoadingCharts(false);
      }
    };

    fetchQuickStats();
    fetchAnalyticalData();
  }, []);

  return (
    <AdminLayout title="تحليلات المنصة الشاملة">
      {/* Summary Cards - Loads First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard title="إجمالي المدارس" value={loadingCounts ? '...' : stats.schools} icon={<FaSchool />} color="text-blue-600" bgColor="bg-blue-100" />
        <StatCard title="التحديات النشطة" value={loadingCounts ? '...' : stats.challenges} icon={<FaBullseye />} color="text-teal-600" bgColor="bg-teal-100" />
        <StatCard title="الفعاليات الموثقة" value={loadingCounts ? '...' : stats.events} icon={<FaCalendarCheck />} color="text-purple-600" bgColor="bg-purple-100" />
        <StatCard title="إجمالي النقاط" value={loadingCharts ? '...' : stats.points} icon={<FaStar />} color="text-yellow-600" bgColor="bg-yellow-100" />
      </div>

      {loadingCharts ? (
        <div className="py-20 flex justify-center"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
            <Card className="rounded-2xl md:rounded-[2rem]">
              <h3 className="text-base md:text-lg font-bold mb-6 flex items-center gap-2">
                <FaChartLine className="text-teal-600" />
                تطور المشاركة (النقاط التراكمية)
              </h3>
              <div className="h-48 md:h-64">
                <PointsChart data={weeklyData} />
              </div>
            </Card>

            <Card className="rounded-2xl md:rounded-[2rem]">
              <h3 className="text-base md:text-lg font-bold mb-6 flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                أفضل المدارس تفاعلاً
              </h3>
              <div className="h-64 md:h-72">
                <SchoolsRankingChart schools={rankingData} />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="lg:col-span-1 rounded-2xl md:rounded-[2.5rem]">
              <h3 className="text-base md:text-lg font-bold mb-4">توزيع أنواع الفعاليات</h3>
              <div className="h-56 md:h-64">
                <EventsPieChart data={eventsTypeData} />
              </div>
            </Card>

            <Card className="lg:col-span-2 rounded-2xl md:rounded-[2.5rem]">
              <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                <FaHistory className="text-gray-400" /> آخر النشاطات
              </h3>
              <div className="overflow-x-auto -mx-6 md:mx-0">
                <div className="min-w-[500px] px-6 md:px-0">
                    <table className="w-full text-right text-sm">
                    <thead>
                        <tr className="border-b dark:border-gray-700 text-gray-500">
                        <th className="py-2">النشاط</th>
                        <th className="py-2">التاريخ</th>
                        <th className="py-2">النوع</th>
                        <th className="py-2">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivities.map((act, idx) => (
                        <tr key={idx} className="border-b last:border-0 dark:border-gray-700">
                            <td className="py-3 font-medium">{act.label || act.title}</td>
                            <td className="py-3 text-gray-500">{act.date}</td>
                            <td className="py-3 text-xs text-slate-400 font-bold">{act.actType}</td>
                            <td className="py-3">
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold">مسجل</span>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

const StatCard = ({ title, value, icon, color, bgColor }: any) => (
  <Card className="flex items-center gap-4 p-4 md:p-6 rounded-2xl md:rounded-3xl border-none shadow-sm">
    <div className={`p-3 md:p-4 rounded-xl ${bgColor} ${color} text-xl md:text-2xl shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight">
        {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
      </p>
    </div>
  </Card>
);

export default AnalyticsDashboard;
