
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Challenge, Submission, EventRequest, School, InternalEvent } from '../../types';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { generateSchoolReportPDF } from '../../services/pdfGenerator';
import { 
  FaTasks, FaClipboardCheck, FaUsers, FaStar, FaCalendarAlt, FaFilePdf, 
  FaFilter, FaChartLine, FaChartPie 
} from 'react-icons/fa';
import { getEventStatusText } from '../../constants';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Area, ComposedChart
} from 'recharts';
import EventsPieChart from '../../components/charts/EventsPieChart';

interface ReportStats {
  totalChallenges: number;
  totalSubmissions: number;
  totalParticipants: number;
  totalPoints: number;
  eventsByStatus: { [key: string]: number };
  pointsByCategory: { type: string, count: number }[];
  weeklyData: { name: string, school: number, average: number }[];
}

const Reports: React.FC = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'term'>('term');

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      if (!userProfile?.school_id || !db) {
        setLoading(false);
        return;
      }
      
      try {
        const schoolId = userProfile.school_id;
        
        // 1. Calculate Date Filter (Server-Side Filtering Prep)
        const now = new Date();
        let filterDate = new Date();
        if (timeFilter === 'week') filterDate.setDate(now.getDate() - 7);
        else if (timeFilter === 'month') filterDate.setMonth(now.getMonth() - 1);
        else filterDate.setMonth(now.getMonth() - 4); // Term approx 4 months
        const filterStr = filterDate.toISOString().split('T')[0];

        // 2. Fetch Data in Parallel with Optimized Queries
        // We fetch School Data + Challenges Metadata (Small) + Filtered Transactional Data
        const [
            schoolDoc,
            challengesSnap,
            submissionsSnap,
            internalEventsSnap,
            requestsSnap
        ] = await Promise.all([
            getDoc(doc(db, 'schools', schoolId)),
            // We need all published challenges to map categories and points multipliers
            getDocs(query(collection(db, 'challenges'), where('status', '==', 'published'))),
            // Filter submissions by date directly on server
            getDocs(query(
                collection(db, 'submissions'), 
                where('school_id', '==', schoolId),
                where('date', '>=', filterStr)
            )),
            // Filter internal events by date and status
            getDocs(query(
                collection(db, 'internal_events'), 
                where('school_id', '==', schoolId),
                where('status', '==', 'documented'),
                where('date', '>=', filterStr)
            )),
            // Filter external requests by date
            getDocs(query(
                collection(db, 'event_requests'), 
                where('school_id', '==', schoolId),
                where('created_date', '>=', filterStr)
            ))
        ]);

        if (schoolDoc.exists()) setSchool({ id: schoolDoc.id, ...schoolDoc.data() } as School);

        // 3. Process Data
        const challenges = challengesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
        const submissions = submissionsSnap.docs.map(doc => doc.data() as Submission);
        const internalEvents = internalEventsSnap.docs.map(doc => doc.data() as InternalEvent);
        const requests = requestsSnap.docs.map(doc => doc.data() as EventRequest);

        // Calculate Totals & Points
        let totalParticipants = 0;
        let totalPoints = 0;
        const pointsByCat: Record<string, number> = { 'تحديات': 0, 'فعاليات': 0 };

        // Process Submissions
        submissions.forEach(sub => {
          totalParticipants += Number(sub.student_count_participated) || 0;
          const challenge = challenges.find(c => c.id === sub.challenge_id);
          const points = (Number(sub.student_count_participated) || 0) * (Number(challenge?.points_multiplier) || 1);
          
          totalPoints += points;
          
          // Categorize points
          const cat = challenge?.category || 'تحديات';
          pointsByCat[cat] = (pointsByCat[cat] || 0) + points;
        });

        // Process Internal Events
        internalEvents.forEach(e => {
            const points = Number(e.points_value) || 0;
            totalPoints += points;
            pointsByCat['فعاليات'] += points;
            totalParticipants += Number(e.documentation?.actual_participants) || 0;
        });

        // Process External Requests Status
        const eventsByStatus: { [key: string]: number } = {};
        requests.forEach(event => {
            const statusText = getEventStatusText(event.status);
            eventsByStatus[statusText] = (eventsByStatus[statusText] || 0) + 1;
        });

        // Mock Weekly Data (In a real app, this would be aggregated from the fetched docs based on their dates)
        const weeklyData = [
          { name: 'الأسبوع 1', school: totalPoints * 0.15, average: 300 },
          { name: 'الأسبوع 2', school: totalPoints * 0.25, average: 450 },
          { name: 'الأسبوع 3', school: totalPoints * 0.20, average: 400 },
          { name: 'الأسبوع 4', school: totalPoints * 0.40, average: 550 },
        ];

        setStats({
          totalChallenges: challenges.length,
          totalSubmissions: submissions.length,
          totalParticipants,
          totalPoints,
          eventsByStatus,
          pointsByCategory: Object.entries(pointsByCat).map(([type, count]) => ({ type, count })),
          weeklyData
        });

      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [userProfile, timeFilter]);
  
  const handleExportPDF = () => {
      if(stats && school) generateSchoolReportPDF(school, stats);
      else alert('البيانات قيد التحميل، يرجى الانتظار.');
  };

  if (loading) return <SchoolLayout title="التقارير"><div className="flex justify-center items-center h-64"><Spinner /></div></SchoolLayout>;

  return (
    <SchoolLayout title="تحليلات وتقارير الأداء">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-8 gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-full">
            <button onClick={() => setTimeFilter('week')} className={`flex-1 px-4 py-2 rounded-lg text-xs md:text-sm transition-all font-black ${timeFilter === 'week' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600' : 'text-gray-500'}`}>أسبوع</button>
            <button onClick={() => setTimeFilter('month')} className={`flex-1 px-4 py-2 rounded-lg text-xs md:text-sm transition-all font-black ${timeFilter === 'month' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600' : 'text-gray-500'}`}>شهر</button>
            <button onClick={() => setTimeFilter('term')} className={`flex-1 px-4 py-2 rounded-lg text-xs md:text-sm transition-all font-black ${timeFilter === 'term' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600' : 'text-gray-500'}`}>فصل</button>
          </div>
          <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl hidden sm:block"><FaFilter /></div>
        </div>
        
        <Button onClick={handleExportPDF} className="flex items-center justify-center gap-3 shadow-lg shadow-teal-500/20 px-6 py-4 rounded-2xl font-black text-sm w-full lg:w-auto">
            <span>تصدير تقرير معتمد</span>
            <FaFilePdf />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1" />
            <h3 className="font-black text-base md:text-lg flex items-center gap-2">
              <span>تطور النقاط مقابل المتوسط</span>
              <FaChartLine className="text-teal-600" />
            </h3>
          </div>
          <div className="h-56 md:h-72 w-full" dir="ltr">
             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats?.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', textAlign: 'right'}} />
                  <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="average" name="المتوسط" fill="#e5e7eb" stroke="#d1d5db" fillOpacity={0.4} />
                  <Line type="monotone" dataKey="school" name="نقاطي" stroke="#0d9488" strokeWidth={4} dot={{ r: 5, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} />
                </ComposedChart>
             </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8">
          <h3 className="font-black text-base md:text-lg mb-8 flex items-center justify-end gap-2 text-right">
            <span>مصادر النقاط</span>
            <FaChartPie className="text-indigo-600" />
          </h3>
          <div className="h-64">
            <EventsPieChart data={stats?.pointsByCategory || []} />
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatSummaryCard title="تحديات" value={stats?.totalSubmissions || 0} icon={<FaTasks />} color="blue" />
        <StatSummaryCard title="مشاركات" value={stats?.totalSubmissions || 0} icon={<FaClipboardCheck />} color="teal" />
        <StatSummaryCard title="طلاب" value={stats?.totalParticipants || 0} icon={<FaUsers />} color="orange" />
        <StatSummaryCard title="النقاط" value={stats?.totalPoints || 0} icon={<FaStar />} color="yellow" isHighlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <Card className="rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
            <h2 className="text-base md:text-lg font-black mb-6 flex items-center justify-end gap-2 border-b pb-4 text-right">
                <span>ملخص الفعاليات الخارجية</span>
                <FaCalendarAlt className="text-slate-400" />
            </h2>
            {stats && Object.keys(stats.eventsByStatus || {}).length > 0 ? (
            <div className="space-y-3 mt-4">
                {Object.entries(stats.eventsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-gray-100 transition-colors border border-transparent hover:border-slate-100">
                    <span className="font-black text-xs md:text-sm text-gray-700 dark:text-gray-300">{status}</span>
                    <span className="bg-white dark:bg-gray-600 px-4 py-1 rounded-full font-black shadow-sm text-teal-600 text-xs">{count}</span>
                </div>
                ))}
            </div>
            ) : (
            <div className="py-12 text-center">
               <FaCalendarAlt size={40} className="mx-auto text-gray-200 mb-2 opacity-20" />
               <p className="text-gray-400 italic font-black text-xs">لا توجد طلبات مسجلة في هذه الفترة</p>
            </div>
            )}
          </Card>

          <Card className="bg-gradient-to-br from-teal-600 to-teal-800 text-white border-none shadow-xl relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10">
              <div className="absolute top-0 right-0 p-8 opacity-10"><FaStar size={100} /></div>
              <div className="relative z-10 text-right">
                <h2 className="text-xl md:text-2xl font-black mb-4 leading-tight">نظام تصنيف المدرسة</h2>
                <div className="space-y-6">
                    <p className="text-xs md:text-sm leading-relaxed text-teal-50 font-bold opacity-90">يعتمد التصنيف على كثافة المشاركة في التحديات الأسبوعية وتوثيق الفعاليات المبتكرة.</p>
                    <div className="p-6 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-inner">
                        <div className="flex items-center justify-end gap-3 mb-2">
                           <p className="text-base md:text-lg font-black">مدرسة رائدة بيئياً 🏆</p>
                           <div className="p-2 bg-yellow-400 text-teal-900 rounded-lg font-black text-[10px]">ذهبي</div>
                        </div>
                        <p className="text-[10px] text-teal-100 font-black opacity-80">أعلى 5% من مدارس المنطقة في التفاعل</p>
                    </div>
                </div>
              </div>
          </Card>
      </div>
    </SchoolLayout>
  );
};

const StatSummaryCard = ({ title, value, icon, color, isHighlight }: any) => {
  const colors: any = { blue: 'text-blue-600 bg-blue-50', teal: 'text-teal-600 bg-teal-50', orange: 'text-orange-600 bg-orange-50', yellow: 'text-yellow-600 bg-yellow-50' };
  return (
    <Card className={`relative overflow-hidden rounded-[1.5rem] md:rounded-3xl p-4 md:p-6 ${isHighlight ? 'ring-4 ring-teal-500/10 shadow-xl border-none' : 'shadow-sm border-none'}`}>
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 md:p-4 rounded-2xl mb-2 md:mb-3 text-lg md:text-2xl ${colors[color]}`}>{icon}</div>
        <p className="text-[9px] md:text-[11px] text-gray-400 dark:text-gray-400 font-black mb-1 uppercase tracking-tighter">{title}</p>
        <p className={`text-xl md:text-3xl font-black ${isHighlight ? 'text-teal-600' : 'text-gray-900 dark:text-white'}`}>{value.toLocaleString('ar-SA')}</p>
      </div>
    </Card>
  );
};

export default Reports;
