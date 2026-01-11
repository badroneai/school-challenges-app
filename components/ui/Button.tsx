
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading = false, className = '', ...props }) => {
  // Base classes according to visual constitution: rounded-ui-component (12px), font-bold, text-sm
  const baseClasses = 'px-6 py-2.5 h-11 rounded-ui-component font-bold text-sm focus:outline-none focus:ring-4 focus:ring-offset-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.97]';

  const variantClasses = {
    // Brand Primary (Indigo)
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-lg shadow-brand-primary/20 focus:ring-brand-primary/10 border-none',
    // Brand Secondary (Teal - School Main)
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary-dark shadow-lg shadow-brand-secondary/20 focus:ring-brand-secondary/10 border-none',
    // Functional Danger (Rose)
    danger: 'bg-functional-danger text-white hover:bg-rose-600 shadow-lg shadow-functional-danger/20 focus:ring-functional-danger/10 border-none',
    // Neutral Outline
    outline: 'bg-transparent text-slate-600 border-2 border-slate-200 hover:border-brand-primary hover:text-brand-primary focus:ring-brand-primary/5',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs">جارِ التنفيذ...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
