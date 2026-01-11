
import React from 'react';
import Skeleton from '../ui/Skeleton';

const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton variant="text" width="20%" />
        <Skeleton variant="rectangular" width="100%" height={48} className="rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="rectangular" width="100%" height={48} className="rounded-xl" />
        </div>
        <div className="space-y-2">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="rectangular" width="100%" height={48} className="rounded-xl" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="rectangular" width="100%" height={120} className="rounded-xl" />
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
        <Skeleton variant="rectangular" width={100} height={40} className="rounded-lg" />
        <Skeleton variant="rectangular" width={150} height={40} className="rounded-lg" />
      </div>
    </div>
  );
};

export default FormSkeleton;
