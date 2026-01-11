
import React, { ReactNode } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, id, children, className = '', ...props }) => {
  return (
    <div className="w-full text-right">
      <label htmlFor={id} className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 mr-1 uppercase tracking-wider">
        {label}
      </label>
      <select
        id={id}
        className={`
          mt-1 block w-full h-12 px-4
          bg-slate-50 dark:bg-slate-900/50 
          focus:bg-white dark:focus:bg-slate-800 
          border-2 border-slate-100 dark:border-slate-700 
          text-slate-900 dark:text-white font-bold text-sm
          rounded-ui-component 
          focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary
          transition-all duration-200 
          cursor-pointer
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
