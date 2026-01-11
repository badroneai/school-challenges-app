
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  writeBatch, 
  query, 
  where, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { NotificationType } from '../types';

/**
 * إرسال إشعار لمستخدم محدد
 * @param userId معرف المستخدم المستهدف
 * @param type نوع الإشعار
 * @param title عنوان الإشعار
 * @param message نص الرسالة
 * @param data بيانات إضافية (اختياري)
 * @returns معرف الوثيقة المنشأة
 */
export const sendNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<string> => {
  if (!db) throw new Error("Firebase database not initialized");
  
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      data: data || {},
      read: false,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

/**
 * إرسال إشعار لمجموعة من المستخدمين في عملية واحدة (Batch)
 * مفيد عند إرسال تحدي جديد لكافة منسقي المدارس
 */
export const sendBulkNotifications = async (
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> => {
  if (!db) throw new Error("Firebase database not initialized");
  if (userIds.length === 0) return;

  // Firestore يحد من عدد العمليات في الـ Batch الواحدة بـ 500 عملية
  const batchSize = 500;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const chunk = userIds.slice(i, i + batchSize);
    const batch = writeBatch(db);
    
    chunk.forEach(uid => {
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        userId: uid,
        type,
        title,
        message,
        data: data || {},
        read: false,
        createdAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  }
};

/**
 * تحديد إشعار محدد كمقروء
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  if (!db) return;
  try {
    const ref = doc(db, 'notifications', notificationId);
    await updateDoc(ref, { read: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * تحديد كافة إشعارات مستخدم معين كمقروءة
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  if (!db) return;
  try {
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', userId), 
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * حذف إشعار محدد من قاعدة البيانات
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  if (!db) return;
  try {
    const ref = doc(db, 'notifications', notificationId);
    await deleteDoc(ref);
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// للحفاظ على التوافق مع الكود السابق إذا كان مستخدماً
export const createNotification = sendNotification;
