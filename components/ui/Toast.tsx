
import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { ToastType, useToast } from '../../contexts/ToastContext';

interface ToastItemProps {
  id: string;
  message: string;
  type: ToastType;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type }) => {
  const { removeToast } = useToast();

  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: <FaCheckCircle className="text-green-500" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: <FaExclamationCircle className="text-red-500" />,
    },
    warning: {
      bg: 'bg-orange-50 dark:bg-orange-900/30',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-800 dark:text-orange-200',
      icon: <FaExclamationTriangle className="text-orange-500" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <FaInfoCircle className="text-blue-500" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div 
      className={`
        pointer-events-auto
        flex items-center gap-3 p-4 rounded-xl border shadow-xl 
        animate-toast
        ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text}
      `}
      role="alert"
    >
      <div className="text-xl shrink-0">
        {currentStyle.icon}
      </div>
      <div className="flex-1 text-sm font-bold leading-relaxed">
        {message}
      </div>
      <button 
        onClick={() => removeToast(id)}
        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors active:scale-90"
        aria-label="إغلاق"
      >
        <FaTimes size={14} className="opacity-50 hover:opacity-100" />
      </button>
    </div>
  );
};

export default ToastItem;