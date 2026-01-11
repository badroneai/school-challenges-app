
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-teal-600 dark:border-t-teal-500 animate-spin"></div>
      </div>
    </div>
  );
};

export default Spinner;