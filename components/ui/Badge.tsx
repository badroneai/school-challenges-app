
import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'indigo' | 'teal';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    // Functional Success (Emerald)
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    // Functional Warning (Amber)
    warning: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    // Functional Error (Rose)
    error: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
    // Neutral (Slate)
    neutral: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
    // Brand Primary (Indigo)
    indigo: 'bg-brand-primary-light text-brand-primary border-brand-primary-light dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
    // Brand Secondary (Teal)
    teal: 'bg-brand-secondary-light text-brand-secondary border-brand-secondary-light dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
