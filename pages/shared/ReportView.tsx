
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import PrintableReport from '../../components/ui/PrintableReport';
import Spinner from '../../components/ui/Spinner';
import { Submission, Challenge, InternalEvent, School } from '../../types';

const ReportView: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const schoolId = searchParams.get('schoolId');
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [reportTitle, setReportTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId || !db) return;
      setLoading(true);
      try {
        const schoolSnap = await getDoc(doc(db, 'schools', schoolId));
        if (schoolSnap.exists()) setSchool({ id: schoolSnap.id, ...schoolSnap.data() } as School);

        if (type === 'submissions') {
          setReportTitle('سجل المشاركات في التحديات البيئية');
          const q = query(collection(db, 'submissions'), where('school_id', '==', schoolId));
          const snap = await getDocs(q);
          const list = snap.docs.map(d => d.data());
          
          // Get challenge titles
          const challengesSnap = await getDocs(collection(db, 'challenges'));
          const challengesMap: Record<string, string> = {};
          challengesSnap.forEach(d => challengesMap[d.id] = d.data().title);
          
          setData(list.map(s => ({ ...s, challenge_title: challengesMap[s.challenge_id] || 'تحدي' })));
        } else if (type === 'internal_events') {
          setReportTitle('بيان الفعاليات والأنشطة الداخلية المنفذة');
          const q = query(collection(db, 'internal_events'), where('school_id', '==', schoolId));
          const snap = await getDocs(q);
          setData(snap.docs.map(d => d.data()));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [type, schoolId]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-100"><Spinner /></div>;

  return (
    <PrintableReport 
        title={reportTitle} 
        subtitle={`الفصل الدراسي الحالي - للعام الدراسي 1446هـ`}
        refNumber={`REP-${Math.random().toString(36).substring(7).toUpperCase()}`}
        schoolName={school?.name_ar}
        managerName={school?.manager_name}
        logoUrl={school?.logo_url}
    >
      <div className="overflow-hidden border border-black rounded-sm">
        <table className="w-full text-right border-collapse">
            <thead>
                <tr className="bg-slate-50 border-b border-black">
                    <th className="p-3 border-l border-black text-xs font-black">#</th>
                    <th className="p-3 border-l border-black text-xs font-black">البيان / النشاط</th>
                    <th className="p-3 border-l border-black text-xs font-black">التاريخ</th>
                    <th className="p-3 border-l border-black text-xs font-black">المشاركة</th>
                    <th className="p-3 text-xs font-black">الحالة</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, idx) => (
                    <tr key={idx} className="border-b border-black last:border-0">
                        <td className="p-3 border-l border-black text-xs font-bold">{idx + 1}</td>
                        <td className="p-3 border-l border-black text-xs font-black">{item.challenge_title || item.title}</td>
                        <td className="p-3 border-l border-black text-xs font-bold">{item.date}</td>
                        <td className="p-3 border-l border-black text-xs font-bold">
                            {item.student_count_participated || item.actual_participants || 0} طالب
                        </td>
                        <td className="p-3 text-xs font-black uppercase">
                            [{item.status === 'documented' || item.date ? 'مكتمل' : 'مجدول'}]
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      
      <div className="mt-12 p-6 bg-slate-50 border border-black/10 rounded-lg">
          <p className="text-sm font-black mb-4">إجمالي الإحصائيات:</p>
          <div className="grid grid-cols-2 gap-8">
              <p className="text-xs font-bold">عدد السجلات الموثقة: <span className="font-black">{data.length} سجل</span></p>
              <p className="text-xs font-bold">إجمالي المشاركة الطلابية: <span className="font-black">{data.reduce((acc, i) => acc + (i.student_count_participated || i.actual_participants || 0), 0)} طالب</span></p>
          </div>
      </div>
    </PrintableReport>
  );
};

export default ReportView;