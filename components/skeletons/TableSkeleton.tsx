
import React from 'react';
import Skeleton from '../ui/Skeleton';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / cols}%`} height={20} />
        ))}
      </div>
      <div className="divide-y dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-5 flex items-center gap-6">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 grid grid-cols-3 gap-8">
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
            </div>
            <div className="flex gap-2">
                <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
                <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
