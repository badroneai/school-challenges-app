
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-800 
        dark:text-white 
        border border-slate-100 dark:border-slate-700/50 
        shadow-sm hover:shadow-md
        rounded-3xl md:rounded-ui-container 
        p-6 md:p-8 
        transition-all duration-300
        ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
