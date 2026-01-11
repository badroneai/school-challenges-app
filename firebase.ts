
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';

// التحقق من الإعدادات
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// تصدير الخدمات بنمط الوحدات (Modular) فقط
export const auth = isFirebaseConfigured ? getAuth(app) : null;
export const db = isFirebaseConfigured ? getFirestore(app) : null;
export const storage = isFirebaseConfigured ? getStorage(app) : null;

// Helper functions to ensure non-null values (for TypeScript)
export const getDb = () => {
  if (!db) throw new Error('Firestore is not initialized');
  return db;
};

export const getStorageInstance = () => {
  if (!storage) throw new Error('Storage is not initialized');
  return storage;
};

export default app;
