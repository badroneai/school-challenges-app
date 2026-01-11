
import { useQuery } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../firebase';
import { queryKeys } from '../lib/queryKeys';
import { Challenge, Submission } from '../types';
import { InternalEvent } from '../types/internalEvent';

export interface SchoolStats {
  totalPoints: number;
  completedChallenges: number;
  totalChallenges: number;
  internalEvents: number;
  externalEvents: number;
  pendingRequests: number;
}

/**
 * دالة جلب البيانات وحساب الإحصائيات (Optimized)
 * تستخدم Aggregation Queries لتقليل استهلاك القراءات
 */
const fetchSchoolStats = async (schoolId: string): Promise<SchoolStats> => {
  if (!db) throw new Error("Database not initialized");

  const challengesRef = collection(db, 'challenges');
  const submissionsRef = collection(db, 'submissions');
  const internalRef = collection(db, 'internal_events');
  const externalRef = collection(db, 'event_requests');

  // 1. تعريف الاستعلامات (Queries)
  const qPublishedChallenges = query(challengesRef, where('status', '==', 'published'));
  
  // إحصائيات العد فقط (Aggregation)
  const qInternalCount = query(internalRef, where('school_id', '==', schoolId));
  const qExternalCount = query(externalRef, where('school_id', '==', schoolId));
  const qPendingRequests = query(
    externalRef, 
    where('school_id', '==', schoolId), 
    where('status', 'in', ['pending', 'sent', 'waiting_reply'])
  );

  // استعلامات البيانات اللازمة لحساب النقاط (Data Fetching)
  // نحتاج فقط الفعاليات الموثقة التي تحتسب نقاطاً
  const qDocumentedEvents = query(
    internalRef, 
    where('school_id', '==', schoolId), 
    where('status', '==', 'documented'),
    where('points_enabled', '==', true)
  );

  const qSubmissions = query(submissionsRef, where('school_id', '==', schoolId));

  // 2. تنفيذ الطلبات بالتوازي (Parallel Execution)
  const [
    challengesSnap,
    internalCountSnap,
    externalCountSnap,
    pendingRequestsSnap,
    documentedEventsSnap,
    submissionsSnap
  ] = await Promise.all([
    getDocs(qPublishedChallenges),      // نحتاج البيانات لمعرفة الـ Multiplier
    getCountFromServer(qInternalCount), // عد فقط
    getCountFromServer(qExternalCount), // عد فقط
    getCountFromServer(qPendingRequests), // عد فقط
    getDocs(qDocumentedEvents),         // نحتاج البيانات لحساب مجموع النقاط
    getDocs(qSubmissions)               // نحتاج البيانات لحساب مجموع النقاط
  ]);

  // 3. معالجة البيانات (Data Processing)
  const challenges = challengesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
  const submissions = submissionsSnap.docs.map(doc => doc.data() as Submission);
  const documentedEvents = documentedEventsSnap.docs.map(doc => doc.data() as InternalEvent);

  // حساب نقاط التحديات: عدد الطلاب × معامل التحدي
  const challengePoints = submissions.reduce((sum, sub) => {
    const challenge = challenges.find(c => c.id === sub.challenge_id);
    const multiplier = challenge?.points_multiplier || 1;
    return sum + (sub.student_count_participated * multiplier);
  }, 0);

  // حساب نقاط الفعاليات الداخلية
  const internalPoints = documentedEvents.reduce((sum, e) => sum + (e.points_value || 0), 0);

  // عدد التحديات المنجزة (Unique Challenge IDs)
  const participatedChallengeIds = new Set(submissions.map(s => s.challenge_id));

  return {
    totalPoints: challengePoints + internalPoints,
    completedChallenges: participatedChallengeIds.size,
    totalChallenges: challengesSnap.size,
    internalEvents: internalCountSnap.data().count,
    externalEvents: externalCountSnap.data().count,
    pendingRequests: pendingRequestsSnap.data().count
  };
};

export const useSchoolStats = (schoolId: string | null | undefined) => {
  return useQuery({
    queryKey: schoolId ? queryKeys.schools.stats(schoolId) : ['schools', 'stats', 'null'],
    queryFn: () => fetchSchoolStats(schoolId!),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: !!schoolId && !!db,
    retry: 1
  });
};

export default useSchoolStats;
