
import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  orderBy, 
  limit,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase';
import { InternalEvent, EventStatus } from '../types/internalEvent';
import { getCurrentDate } from '../services/helpers';

interface UseInternalEventsReturn {
  events: InternalEvent[];
  loading: boolean;
  error: Error | null;
  addEvent: (event: Omit<InternalEvent, 'id' | 'created_date' | 'updated_date'>) => Promise<string>;
  updateEvent: (id: string, data: Partial<InternalEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  filterByStatus: (status: EventStatus | 'all') => void;
  loadMore: () => void;
}

/**
 * Hook مخصص لإدارة الفعاليات الداخلية للمدرسة.
 * @param schoolId - معرف المدرسة المسجلة.
 */
export const useInternalEvents = (schoolId: string | null | undefined): UseInternalEventsReturn => {
  const [events, setEvents] = useState<InternalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [itemsLimit, setItemsLimit] = useState(20);

  useEffect(() => {
    if (!schoolId || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Fix: Explicitly type qConstraints as QueryConstraint[] to allow adding limit() constraint.
    let qConstraints: QueryConstraint[] = [
      where('school_id', '==', schoolId),
      orderBy('date', 'desc')
    ];

    // إضافة فلتر الحالة إذا لم يكن "الكل"
    if (statusFilter !== 'all') {
      qConstraints.push(where('status', '==', statusFilter));
    }

    // إضافة الـ Pagination (Limit)
    qConstraints.push(limit(itemsLimit));

    const q = query(collection(db, 'internal_events'), ...qConstraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as InternalEvent));
      
      setEvents(list);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore error in useInternalEvents:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [schoolId, statusFilter, itemsLimit]);

  // إضافة فعالية جديدة
  const addEvent = async (eventData: Omit<InternalEvent, 'id' | 'created_date' | 'updated_date'>): Promise<string> => {
    if (!db) throw new Error("Database not connected");
    
    const payload = {
      ...eventData,
      created_date: getCurrentDate(),
      updated_date: getCurrentDate(),
      status: eventData.status || 'scheduled'
    };

    const docRef = await addDoc(collection(db, 'internal_events'), payload);
    return docRef.id;
  };

  // تحديث فعالية موجودة
  const updateEvent = async (id: string, data: Partial<InternalEvent>): Promise<void> => {
    if (!db) throw new Error("Database not connected");
    
    const eventRef = doc(db, 'internal_events', id);
    await updateDoc(eventRef, {
      ...data,
      updated_date: getCurrentDate()
    });
  };

  // حذف فعالية
  const deleteEvent = async (id: string): Promise<void> => {
    if (!db) throw new Error("Database not connected");
    
    const eventRef = doc(db, 'internal_events', id);
    await deleteDoc(eventRef);
  };

  // تغيير فلتر الحالة
  const filterByStatus = (status: EventStatus | 'all') => {
    setStatusFilter(status);
  };

  // تحميل المزيد (Pagination)
  const loadMore = () => {
    setItemsLimit(prev => prev + 20);
  };

  return { 
    events, 
    loading, 
    error, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    filterByStatus,
    loadMore
  };
};

export default useInternalEvents;
