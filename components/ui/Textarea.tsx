
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className="w-full text-right">
      <label htmlFor={id} className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 mr-1 uppercase tracking-wider">
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        className={`
          mt-1 block w-full px-5 py-4 
          bg-slate-50 dark:bg-slate-900/50 
          focus:bg-white dark:focus:bg-slate-800 
          border-2 border-slate-100 dark:border-slate-700 
          rounded-ui-component 
          text-slate-900 dark:text-white font-bold text-sm
          placeholder-slate-300 dark:placeholder-slate-600
          focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary
          transition-all duration-200 leading-relaxed
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default Textarea;
