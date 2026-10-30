import React from 'react';

export default function Card({
  children,
  className = '',
  hoverEffect = false,
  padding = 'p-5 sm:p-6',
  onClick,
  ...props
}) {
  const hoverClasses = hoverEffect 
    ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-teal-200 cursor-pointer" 
    : "";

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs ${padding} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
