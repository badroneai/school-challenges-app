
import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  orderBy,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase';
import { EventRequest, EventStatus, EventType } from '../types';
import { getCurrentDate } from '../services/helpers';

/**
 * تعريف الأنواع بناءً على متطلبات الواجهة المطلوبة
 * مع الحفاظ على التوافق مع الأنواع الأساسية للمشروع
 */
export type RequestStatus = EventStatus;
export type EntityRequest = EventRequest;

export interface NewRequestData extends Omit<EventRequest, 'id' | 'created_date' | 'status'> {}

interface UseEntityRequestsReturn {
  requests: EntityRequest[];
  loading: boolean;
  error: Error | null;
  createRequest: (request: NewRequestData) => Promise<string>;
  updateRequestStatus: (id: string, status: RequestStatus, notes?: string) => Promise<void>;
  filterByStatus: (status: RequestStatus | 'all') => void;
  filterByType: (type: EventType | 'all') => void;
}

/**
 * Hook مخصص لإدارة طلبات الفعاليات بين المدارس والجهات.
 * 
 * @param schoolId - اختياري: معرف المدرسة (لجلب الطلبات المرسلة).
 * @param entityId - اختياري: معرف الجهة (لجلب الطلبات المستلمة).
 */
export const useEntityRequests = (schoolId?: string | null, entityId?: string | null): UseEntityRequestsReturn => {
  const [allRequests, setAllRequests] = useState<EntityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // حالات الفلترة (Client-side filtering لتحسين الأداء)
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');

  useEffect(() => {
    if (!db || (!schoolId && !entityId)) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const constraints: QueryConstraint[] = [];
    if (schoolId) {
      constraints.push(where('school_id', '==', schoolId));
    } else if (entityId) {
      constraints.push(where('agency_id', '==', entityId));
    }
    
    // الترتيب حسب التاريخ الأحدث
    constraints.push(orderBy('created_date', 'desc'));

    const q = query(collection(db, 'event_requests'), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EntityRequest));
      
      setAllRequests(list);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore error in useEntityRequests:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [schoolId, entityId]);

  /**
   * تصفية الطلبات بناءً على الاختيارات الحالية
   */
  const filteredRequests = useMemo(() => {
    return allRequests.filter(req => {
      const matchStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchType = typeFilter === 'all' || req.event_type === typeFilter;
      return matchStatus && matchType;
    });
  }, [allRequests, statusFilter, typeFilter]);

  /**
   * إنشاء طلب جديد وإرساله للجهة
   */
  const createRequest = async (request: NewRequestData): Promise<string> => {
    if (!db) throw new Error("Database not connected");
    
    const payload = {
      ...request,
      status: 'sent' as RequestStatus,
      created_date: getCurrentDate(),
      updated_date: getCurrentDate()
    };

    const docRef = await addDoc(collection(db, 'event_requests'), payload);
    return docRef.id;
  };

  /**
   * تحديث حالة الطلب (قبول، رفض، تنفيذ، إلخ)
   */
  const updateRequestStatus = async (id: string, status: RequestStatus, notes?: string): Promise<void> => {
    if (!db) throw new Error("Database not connected");
    
    const requestRef = doc(db, 'event_requests', id);
    const updateData: any = { 
      status,
      updated_date: getCurrentDate()
    };

    // إذا كانت هناك ملاحظات من الجهة أو سبب للرفض
    if (notes) {
      updateData.entity_response_notes = notes;
      updateData.entity_response_date = getCurrentDate();
    }

    await updateDoc(requestRef, updateData);
  };

  return { 
    requests: filteredRequests, 
    loading, 
    error, 
    createRequest, 
    updateRequestStatus,
    filterByStatus: setStatusFilter,
    filterByType: setTypeFilter
  };
};

export default useEntityRequests;
