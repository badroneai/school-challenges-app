
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, getDocs, or } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Notification } from '../types';

export const useNotifications = () => {
  const { user, userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ننتظر حتى يكون المستخدم متوفراً تماماً (بما في ذلك uid)
    if (!user?.uid || !db) {
      setLoading(false);
      return;
    }

    // استعلام مزدوج: إشعارات المستخدم الشخصية + إشعارات الجهة (في حال كان شريكاً)
    // إذا لم يكن لدى المستخدم agency_id (مثل المدارس)، نستخدم 'NONE' كقيمة آمنة
    const agencyNotifId = userProfile?.agency_id ? `AGENCY_${userProfile.agency_id}` : 'NONE';
    
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', 'in', [user.uid, agencyNotifId])
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        
        // ترتيب العميل Client-side لتفادي الحاجة لفهارس مركبة معقدة
        list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return timeB - timeA;
        });

        setNotifications(list);
        setUnreadCount(list.filter(n => !n.read).length);
        setLoading(false);
      }, (err) => {
        console.error("Notifications fetch error (snapshot):", err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Notifications query setup error:", err);
      setLoading(false);
    }
  }, [user, userProfile]);

  const markAsRead = async (notificationId: string) => {
    if (!db) return;
    try {
      const ref = doc(db, 'notifications', notificationId);
      await updateDoc(ref, { read: true });
    } catch (error) { console.error(error); }
  };

  const markAllAsRead = async () => {
    if (!db || !user) return;
    try {
      const agencyNotifId = userProfile?.agency_id ? `AGENCY_${userProfile.agency_id}` : 'NONE';
      const q = query(
        collection(db, 'notifications'), 
        where('userId', 'in', [user.uid, agencyNotifId]), 
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => batch.update(d.ref, { read: true }));
      await batch.commit();
    } catch (error) { console.error(error); }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
};
