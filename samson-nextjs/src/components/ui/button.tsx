import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500',
    secondary:
      'border border-slate-250 dark:border-slate-800 bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/10 hover:from-red-500 hover:to-rose-500',
    ghost:
      'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900',
    glass:
      'border border-white/10 bg-white/5 text-slate-100 backdrop-blur-md hover:bg-white/10 hover:border-white/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
