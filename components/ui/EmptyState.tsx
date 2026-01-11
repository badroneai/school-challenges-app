
import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-gray-800/40 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700 transition-all ${className}`}>
      <div className="mb-6 p-6 rounded-full bg-slate-50 dark:bg-slate-800/80 text-slate-300 dark:text-slate-600 text-6xl transition-transform duration-500 hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 text-sm font-medium leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button 
          onClick={action.onClick}
          className="px-8 py-2.5 rounded-xl shadow-lg shadow-teal-500/10 font-bold text-sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;