
import React from 'react';
import Skeleton from '../ui/Skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <Skeleton variant="circular" width={56} height={56} />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="60%" height={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <Skeleton variant="text" width="30%" height={32} className="mb-6" />
          <Skeleton variant="rectangular" width="100%" height={300} className="rounded-2xl" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <Skeleton variant="text" width="50%" height={32} className="mb-6" />
          <div className="flex justify-center items-center h-[300px]">
             <Skeleton variant="circular" width={200} height={200} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
