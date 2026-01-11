
import React, { ReactNode, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Sheet Container */}
      <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        {/* Handle Bar */}
        <div className="flex justify-center p-3" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-8 pb-4 border-b border-slate-50 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 text-right">
          {children}
        </div>

        {/* Footer Actions */}
        {footer && (
          <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomSheet;