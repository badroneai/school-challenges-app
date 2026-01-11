import React from 'react';

interface SkeletonProps {
  /** نوع الشكل: نص، دائرة، مستطيل، أو بطاقة كاملة */
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  /** عرض العنصر (رقم للبكسل أو نص للنسبة المئوية) */
  width?: string | number;
  /** ارتفاع العنصر (رقم للبكسل أو نص للنسبة المئوية) */
  height?: string | number;
  /** كلاسات Tailwind إضافية للتخصيص */
  className?: string;
}

/**
 * مكون Skeleton لعرض حالة التحميل بشكل احترافي.
 * يدعم الوضع الليلي والحركات النابضة.
 */
const Skeleton: React.FC<SkeletonProps> = ({ 
  variant = 'rectangular', 
  width, 
  height, 
  className = '' 
}) => {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700 transition-colors duration-200";
  
  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  const style = getStyle();

  // شكل الدائرة (مثلاً لصور البروفايل أو الأيقونات)
  if (variant === 'circular') {
    return (
      <div 
        className={`${baseClasses} rounded-full ${className}`} 
        style={{ ...style, minWidth: style.width, minHeight: style.height }}
      />
    );
  }

  // شكل النص (يأخذ ارتفاع تلقائي يتناسب مع حجم الخط المحيط)
  if (variant === 'text') {
    return (
      <div 
        className={`${baseClasses} rounded h-[1em] mb-2 last:mb-0 ${className}`} 
        style={style}
      />
    );
  }

  // شكل البطاقة الجاهزة (مثالي لصفحات التحديات والفعاليات)
  if (variant === 'card') {
    return (
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 space-y-4 ${className}`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className={`${baseClasses} h-6 w-3/4 rounded`} />
            <div className={`${baseClasses} h-4 w-1/2 rounded`} />
          </div>
          <div className={`${baseClasses} h-10 w-10 rounded-lg`} />
        </div>
        <div className={`${baseClasses} h-32 w-full rounded-md`} />
        <div className="flex justify-between items-center pt-2">
          <div className={`${baseClasses} h-5 w-24 rounded`} />
          <div className={`${baseClasses} h-10 w-28 rounded-md`} />
        </div>
      </div>
    );
  }

  // المستطيل الافتراضي (للعناصر العامة)
  return (
    <div 
      className={`${baseClasses} rounded ${className}`} 
      style={style}
    />
  );
};

export default Skeleton;
