
import React, { useState, useCallback } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { validateImage } from '../../services/imageService';
import { FaCloudUploadAlt, FaTrash, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import Spinner from './Spinner';

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  existingImages?: string[];
  folder: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  maxFiles = 5,
  existingImages = [],
  folder
}) => {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingImages);
  const [localError, setLocalError] = useState<string | null>(null);
  const { uploadMultiple, progress, uploading, error: uploadError } = useImageUpload();

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLocalError(null);
    const filesArray = Array.from(files);
    if (uploadedUrls.length + filesArray.length > maxFiles) {
      setLocalError(`عذراً، يمكنك رفع ${maxFiles} صور كحد أقصى فقط.`);
      return;
    }
    const validFiles: File[] = [];
    for (const file of filesArray) {
      const validation = validateImage(file);
      if (!validation.valid) {
        setLocalError(validation.error || 'ملف غير صالح');
        return;
      }
      validFiles.push(file);
    }
    try {
      const urls = await uploadMultiple(validFiles, folder);
      const newUrls = [...uploadedUrls, ...urls];
      setUploadedUrls(newUrls);
      onUpload(newUrls);
    } catch (err: any) { console.error(err); }
  }, [uploadedUrls, maxFiles, folder, onUpload, uploadMultiple]);

  const removeImage = (indexToRemove: number) => {
    const newUrls = uploadedUrls.filter((_, index) => index !== indexToRemove);
    setUploadedUrls(newUrls);
    onUpload(newUrls);
  };

  return (
    <div className="space-y-4 w-full">
      {uploadedUrls.length < maxFiles && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer ${uploading ? 'bg-gray-50 border-teal-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-gray-700'}`}
          onClick={() => !uploading && document.getElementById('file-upload')?.click()}
        >
          <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
          {uploading ? (
            <div className="w-full text-center">
              <Spinner />
              <p className="mt-4 font-bold text-teal-600">جاري المعالجة... {progress}%</p>
            </div>
          ) : (
            <>
              <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
              <p className="text-gray-700 dark:text-gray-200 font-medium">اسحب الصور هنا أو اضغط للاختيار</p>
            </>
          )}
        </div>
      )}

      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {uploadedUrls.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50 dark:bg-gray-700">
              <img 
                src={url} 
                loading="lazy"
                width={200}
                height={200}
                alt={`صورة مرفوعة ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" onClick={() => removeImage(index)} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg"><FaTrash size={14} /></button>
              </div>
              <div className="absolute bottom-1 right-1"><FaCheckCircle className="text-green-500 bg-white rounded-full shadow-sm" /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
