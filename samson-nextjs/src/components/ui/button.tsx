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
      'bg-gradient-to-r from-primary-start to-primary-end text-white shadow-lg shadow-primary-start/10 hover:from-primary-hover-start hover:to-primary-hover-end',
    secondary:
      'border border-card-border bg-card text-secondary-text hover:bg-secondary-bg-hover',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/10 hover:from-red-500 hover:to-rose-500',
    ghost:
      'text-text-secondary hover:text-text-primary hover:bg-secondary-bg',
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
