
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  getDocs, 
  QueryConstraint, 
  DocumentData,
  Query,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../firebase';

interface UseFirestoreQueryOptions {
  collectionName: string;
  constraints?: QueryConstraint[];
  realTime?: boolean;
}

interface UseFirestoreQueryReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | FirestoreError | null;
  refetch: () => Promise<void>;
}

/**
 * Hook مخصص وقابل لإعادة الاستخدام لجلب البيانات من Firestore.
 * @param options - إعدادات الاستعلام (اسم المجموعة، القيود، الوضع اللحظي).
 * @returns { data, loading, error, refetch }
 */
export function useFirestoreQuery<T = DocumentData>({
  collectionName,
  constraints = [],
  realTime = true,
}: UseFirestoreQueryOptions): UseFirestoreQueryReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | FirestoreError | null>(null);

  // استخدام useRef للحفاظ على مرجع القيود وتجنب الـ Infinite Loops عند الرندر
  const constraintsRef = useRef(constraints);
  
  // تحديث المرجع فقط إذا تغيرت مصفوفة القيود فعلياً (بناءً على طول المصفوفة كمؤشر أولي)
  // ملاحظة: يفضل دائماً تمرير القيود باستخدام useMemo في المكون المستدعي.
  useEffect(() => {
    constraintsRef.current = constraints;
  }, [constraints]);

  /**
   * وظيفة لجلب البيانات يدوياً (تستخدم في وضع non-realtime أو للتحديث القسري)
   */
  const fetchData = useCallback(async () => {
    if (!db) {
      setError(new Error("Firebase Database is not initialized."));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, collectionName), ...constraintsRef.current);
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      
      setData(results);
      setError(null);
    } catch (err) {
      console.error(`Error in useFirestoreQuery (${collectionName}):`, err);
      setError(err as FirestoreError);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    if (!db) return;

    let unsubscribe: () => void = () => {};

    if (realTime) {
      setLoading(true);
      try {
        const q = query(collection(db, collectionName), ...constraintsRef.current);
        
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const results = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as T[];
            setData(results);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error(`Snapshot error in useFirestoreQuery (${collectionName}):`, err);
            setError(err);
            setLoading(false);
          }
        );
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    } else {
      fetchData();
    }

    // تنظيف الاشتراك عند إغلاق المكون
    return () => unsubscribe();
  }, [collectionName, realTime, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

export default useFirestoreQuery;
