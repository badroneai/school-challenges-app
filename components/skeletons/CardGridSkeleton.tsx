
import React from 'react';
import Skeleton from '../ui/Skeleton';

interface CardGridSkeletonProps {
  count?: number;
}

const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
           <div className="flex justify-between items-start">
              <Skeleton variant="rectangular" width={56} height={56} className="rounded-2xl" />
              <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
           </div>
           <div className="space-y-3">
              <Skeleton variant="text" width="70%" height={28} />
              <Skeleton variant="rectangular" width="100%" height={60} className="rounded-xl" />
           </div>
           <div className="pt-4 border-t dark:border-gray-700 flex justify-between items-center">
              <div className="space-y-2">
                 <Skeleton variant="text" width={40} />
                 <Skeleton variant="text" width={80} height={24} />
              </div>
              <div className="flex gap-2">
                 <Skeleton variant="rectangular" width={40} height={40} className="rounded-xl" />
                 <Skeleton variant="rectangular" width={40} height={40} className="rounded-xl" />
              </div>
           </div>
        </div>
      ))}
    </div>
  );
};

export default CardGridSkeleton;
