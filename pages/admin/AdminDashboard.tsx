
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import Card from '../../components/ui/Card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FaSchool, FaUsers, FaBuilding, FaChartPie, FaFilter, FaChartBar } from 'react-icons/fa';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';

const AdminDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({ schools: 0, users: 0, agencies: 0 });
    const [loading, setLoading] = useState(true);
    const [cityData, setCityData] = useState<any[]>([]);

    useEffect(() => {
        if (!db) return;
        const fetchStats = async () => {
            try {
                const schoolsSnapshot = await getDocs(collection(db!, 'schools'));
                const usersSnapshot = await getDocs(collection(db!, 'users'));
                const agenciesSnapshot = await getDocs(collection(db!, 'agencies'));

                const cityCounts: { [key: string]: number } = {};
                schoolsSnapshot.docs.forEach(doc => {
                    const city = doc.data().city || 'غير محدد';
                    cityCounts[city] = (cityCounts[city] || 0) + 1;
                });

                setCityData(Object.keys(cityCounts).map(city => ({
                    name: city,
                    value: cityCounts[city]
                })));

                setStats({
                    schools: schoolsSnapshot.size,
                    users: usersSnapshot.size,
                    agencies: agenciesSnapshot.size,
                });
            } catch (error) {
                console.error("Error fetching stats: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <AdminLayout title="لوحة التحكم الرئيسية">
                <DashboardSkeleton />
            </AdminLayout>
        );
    }

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#14b8a6'];

    const InsightCard = ({ title, value, icon: Icon, colorClass, bgClass }: any) => (
      <Card className="flex items-center justify-between p-6 border-none shadow-sm rounded-2xl group hover:shadow-md transition-all">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="h-7 w-7" />
        </div>
      </Card>
    );

    return (
        <AdminLayout title="لوحة القيادة">
            {/* Hero Header */}
            <div className="mb-10 text-right">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">أهلاً بك، {userProfile?.display_name || 'المشرف'} 👋</h2>
              <p className="text-slate-500 font-medium mt-1">إليك ملخص شامل لأداء المنصة اليوم، {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <InsightCard 
                  title="عدد المدارس المسجلة" 
                  value={stats.schools} 
                  icon={FaSchool} 
                  colorClass="text-indigo-600" 
                  bgClass="bg-indigo-50 dark:bg-indigo-900/20" 
                />
                <InsightCard 
                  title="إحصائيات عامة" 
                  value={stats.users} 
                  icon={FaChartBar} 
                  colorClass="text-emerald-600" 
                  bgClass="bg-emerald-50 dark:bg-emerald-900/20" 
                />
                <InsightCard 
                  title="الجهات الشريكة" 
                  value={stats.agencies} 
                  icon={FaBuilding} 
                  colorClass="text-amber-600" 
                  bgClass="bg-amber-50 dark:bg-amber-900/20" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 rounded-[2rem] p-0 overflow-hidden border-none shadow-sm">
                    <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                            <FaChartPie size={16} />
                          </div>
                          <h2 className="text-lg font-bold text-slate-800 dark:text-white">توزيع المدارس حسب المدن</h2>
                        </div>
                        {/* Filter Icon for Chart */}
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-xs font-black bg-slate-50 px-3 py-2 rounded-xl">
                          <span>تصفية</span>
                          <FaFilter size={12} />
                        </button>
                    </div>
                    <div className="p-8 h-80 w-full">
                        {cityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={cityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {cityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-gray-400 italic">لا توجد مدارس مسجلة</div>}
                    </div>
                </Card>

                <div className="space-y-6 text-right">
                    <Card className="bg-indigo-600 text-white border-none rounded-[2rem] p-8 shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                        <div className="relative z-10">
                          <h2 className="text-xl font-bold mb-4">نظرة سريعة على النمو</h2>
                          <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                              شهد الأسبوع الحالي انضمام 4 مدارس جديدة وتفعيل حسابات 12 منسقاً، مما يعزز من وصول المنصة في المنطقة الوسطى.
                          </p>
                          <div className="mt-8 pt-6 border-t border-indigo-400/30 flex justify-between items-center">
                              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">آخر تحديث</span>
                              <span className="text-xs text-white font-black">{new Date().toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;