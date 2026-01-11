import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { Challenge, Submission } from '../../types';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getChallengeStatusText, getStatusColor } from '../../constants';
import { ref, getDownloadURL } from 'firebase/storage';
// Fix: Added missing FaBoxOpen and FaStar imports to resolve errors on lines 145 and 174
import { FaArrowRight, FaBullseye, FaCalendarCheck, FaHistory, FaTrophy, FaInfoCircle, FaImages, FaPlus, FaBoxOpen, FaStar } from 'react-icons/fa';
import { getHijriDate } from '../../services/helpers';

const ChallengeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [path: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchChallengeAndSubmissions = async () => {
      setLoading(true);
      try {
        const challengeDocRef = doc(db, 'challenges', id);
        const challengeDoc = await getDoc(challengeDocRef);
        if (challengeDoc.exists()) {
          setChallenge({ id: challengeDoc.id, ...challengeDoc.data() } as Challenge);
        }

        const submissionsQuery = query(collection(db, 'submissions'), where('challenge_id', '==', id));
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissionsList = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
        setSubmissions(submissionsList);

        const urls: { [path: string]: string } = {};
        for (const sub of submissionsList) {
          for (const path of sub.evidence_image_paths || []) {
            if (!urls[path]) {
                try {
                    const url = await getDownloadURL(ref(storage, path));
                    urls[path] = url;
                } catch(e) { console.error("Error loading image:", path); }
            }
          }
        }
        setImageUrls(urls);
      } catch (error) { console.error("Error fetching data:", error); } 
      finally { setLoading(false); }
    };
    fetchChallengeAndSubmissions();
  }, [id]);

  if (loading) return <SchoolLayout title="تفاصيل التحدي"><div className="py-20 flex justify-center"><Spinner /></div></SchoolLayout>;
  if (!challenge) return <SchoolLayout title="خطأ"><div className="py-20 text-center text-slate-400 font-bold">لم يتم العثور على التحدي المطلوب.</div></SchoolLayout>;

  const totalPoints = submissions.reduce((acc, sub) => acc + (sub.student_count_participated * (challenge.points_multiplier || 1)), 0);

  const MetaItem = ({ label, value, icon: Icon, colorClass = "text-slate-900" }: any) => (
    <div className="py-4 border-b border-slate-50 dark:border-slate-700 last:border-0">
      <dt className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
          {Icon && <Icon className="text-indigo-400" size={10} />}
          {label}
      </dt>
      <dd className={`text-sm font-black ${colorClass} dark:text-white`}>{value}</dd>
    </div>
  );

  return (
    <SchoolLayout title={challenge.title}>
      {/* Cinematic Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div className="text-right">
            <div className="flex items-center gap-3 mb-3">
                <Badge variant="indigo">{challenge.category}</Badge>
                <span className="text-xs font-black text-slate-400">Challenge ID: {challenge.id.substring(0, 8)}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">{challenge.title}</h1>
        </div>
        <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><FaArrowRight /></button>
            <Link to={`/school/challenges/${id}/new-submission`}>
                <Button className="rounded-2xl px-10 py-4 font-black shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 border-none flex items-center gap-3">
                    <span>إرسال مشاركة جديدة</span>
                    <FaPlus size={12} />
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] p-10 border-none shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FaInfoCircle /></div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">وصف التحدي</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-bold whitespace-pre-line">
                    {challenge.description}
                </p>
            </Card>

            <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">المشاركات الموثقة</h3>
                <span className="text-xs font-black text-slate-400">إجمالي المشاركات: {submissions.length}</span>
            </div>

            {submissions.length > 0 ? (
                <div className="space-y-4 text-right">
                    {submissions.map(sub => (
                        <Card key={sub.id} className="rounded-[2rem] border-none shadow-sm p-8 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-4 py-1 bg-slate-50 text-slate-600 text-[10px] font-black rounded-lg">التاريخ: {sub.date}</span>
                                <div className="text-right">
                                    <h4 className="font-black text-slate-900 dark:text-white">المرحلة: {sub.grade_level}</h4>
                                    <p className="text-xs font-bold text-slate-400 mt-1">بمشاركة {sub.student_count_participated} طالب</p>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed mb-6 italic">"{sub.evidence_notes}"</p>
                            
                            {sub.evidence_image_paths && sub.evidence_image_paths.length > 0 && (
                                <div className="pt-6 border-t border-slate-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaImages /> صور التوثيق</p>
                                    <div className="flex flex-wrap gap-3">
                                        {sub.evidence_image_paths.map(path => imageUrls[path] && (
                                            <a key={path} href={imageUrls[path]} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-2xl shadow-sm border border-slate-100">
                                                <img src={imageUrls[path]} loading="lazy" width={120} height={120} className="h-24 w-24 object-cover transition-transform group-hover:scale-110" alt="دليل" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                    <FaBoxOpen size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 font-bold">لم تقم مدرستكم برفع أي توثيق لهذا التحدي بعد.</p>
                </Card>
            )}
        </div>

        {/* Sidebar Metadata Column */}
        <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-sm font-black text-indigo-600 mb-6 flex items-center gap-2">
                    <FaHistory /> سجل التحدي
                </h3>
                <dl className="text-right">
                    <MetaItem label="حالة التحدي" value={getChallengeStatusText(challenge.status)} icon={FaBullseye} colorClass="text-emerald-600" />
                    <MetaItem label="تاريخ البدء" value={challenge.start_date} icon={FaCalendarCheck} />
                    <MetaItem label="الموعد النهائي" value={challenge.end_date} icon={FaHistory} colorClass="text-rose-600" />
                    <MetaItem label="التاريخ الهجري" value={getHijriDate(challenge.end_date)} />
                </dl>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl p-10 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white relative overflow-hidden text-center">
                <div className="relative z-10">
                    <div className="p-5 bg-white/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
                        <FaTrophy size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">النقاط المكتسبة</p>
                    <p className="text-5xl font-black">{totalPoints}</p>
                    <p className="text-xs font-bold text-indigo-100 mt-4 opacity-80 leading-relaxed">تعتمد النقاط على كثافة المشاركة الطلابية مضروبة في معامل التحدي.</p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><FaStar size={100} /></div>
            </Card>
        </div>
      </div>
    </SchoolLayout>
  );
};

export default ChallengeDetails;