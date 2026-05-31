import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'error' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseStyle =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-all duration-300';

  const variants = {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
    error: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:text-rose-400 dark:border-rose-500/30',
    default: 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400 dark:border-slate-500/30',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
