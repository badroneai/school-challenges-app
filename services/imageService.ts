
import imageCompression from 'browser-image-compression';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * خدمة معالجة الصور للمنصة
 * تشمل الضغط، التحقق، الحذف، وإنشاء المصغرات
 */

const MAX_ALLOWED_SIZE_MB = 5;
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * التحقق من نوع وحجم الملف
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return { 
      valid: false, 
      error: 'عذراً، صيغة الملف غير مدعومة. يرجى استخدام JPEG أو PNG أو WebP.' 
    };
  }

  if (file.size > MAX_ALLOWED_SIZE_MB * 1024 * 1024) {
    return { 
      valid: false, 
      error: `حجم الملف كبير جداً. الحد الأقصى هو ${MAX_ALLOWED_SIZE_MB} ميجابايت.` 
    };
  }

  return { valid: true };
};

/**
 * ضغط الصورة للحجم المستهدف
 */
export const compressImage = async (file: File, maxSizeMB: number = 1): Promise<File> => {
  const options = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression Error:', error);
    return file; // العودة للملف الأصلي في حال فشل الضغط
  }
};

/**
 * إنشاء صورة مصغرة (Thumbnail) للاستخدام في القوائم
 */
export const generateThumbnail = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.1, // 100KB
    maxWidthOrHeight: 300,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Thumbnail Generation Error:', error);
    return file;
  }
};

/**
 * حذف صورة من Firebase Storage باستخدام الرابط (URL)
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!storage || !imageUrl) return;

  try {
    // إنشاء مرجع للملف من الرابط مباشرة
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    // إذا كان الملف غير موجود أصلاً، نعتبر العملية ناجحة
    if (error.code === 'storage/object-not-found') {
      console.warn('Image already deleted or not found.');
      return;
    }
    console.error('Delete Image Error:', error);
    throw error;
  }
};
