
import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import imageCompression from 'browser-image-compression';

interface UseImageUploadReturn {
  uploadImage: (file: File, path: string) => Promise<string>;
  uploadMultiple: (files: File[], basePath: string) => Promise<string[]>;
  progress: number;
  uploading: boolean;
  error: Error | null;
}

const MAX_FILE_SIZE_MB = 5;
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
};

/**
 * Hook مخصص لرفع الصور إلى Firebase Storage مع الضغط التلقائي.
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * دالة داخلية للرفع مع مراقبة التقدم
   */
  const _performUpload = useCallback((file: File, storagePath: string, onFileProgress?: (p: number) => void): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      if (!storage) {
        reject(new Error("Firebase Storage is not initialized."));
        return;
      }

      try {
        // 1. التحقق من الحجم قبل البدء
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          throw new Error(`حجم الملف كبير جداً (${file.name}). الحد الأقصى المسموح به هو 5 ميجابايت قبل الضغط.`);
        }

        // 2. ضغط الصورة
        const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
        
        // 3. بدء عملية الرفع
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onFileProgress) onFileProgress(p);
          },
          (err) => {
            console.error("Upload error:", err);
            reject(err);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  /**
   * رفع صورة واحدة
   */
  const uploadImage = async (file: File, path: string): Promise<string> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const url = await _performUpload(file, path, (p) => setProgress(Math.round(p)));
      return url;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  /**
   * رفع مجموعة صور
   */
  const uploadMultiple = async (files: File[], basePath: string): Promise<string[]> => {
    if (files.length === 0) return [];
    
    setUploading(true);
    setProgress(0);
    setError(null);

    const individualProgress = new Array(files.length).fill(0);
    
    try {
      const uploadPromises = files.map((file, index) => {
        const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const fullPath = `${basePath.endsWith('/') ? basePath : basePath + '/'}${uniqueName}`;
        
        return _performUpload(file, fullPath, (p) => {
          individualProgress[index] = p;
          const totalProgress = individualProgress.reduce((a, b) => a + b, 0) / files.length;
          setProgress(Math.round(totalProgress));
        });
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploadMultiple,
    progress,
    uploading,
    error,
  };
};

export default useImageUpload;
