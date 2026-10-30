import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 select-none cursor-pointer";

  const variants = {
    primary: "bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20 focus:ring-teal-500 border border-transparent",
    secondary: "bg-teal-50 hover:bg-teal-100 text-teal-800 focus:ring-teal-500 border border-teal-200/80",
    outline: "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 focus:ring-teal-500 shadow-xs",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-400 border border-transparent",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20 focus:ring-red-500 border border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs sm:text-sm gap-1.5 min-h-[36px]",
    md: "px-4 py-2 text-sm font-medium gap-2 min-h-[42px]",
    lg: "px-6 py-3 text-base font-semibold gap-2.5 min-h-[48px]"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
        </>
      )}
    </button>
  );
}
