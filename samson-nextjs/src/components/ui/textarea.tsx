import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all duration-300 min-h-[100px] resize-y ${
            error
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-card-border focus:border-primary-start/50'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-[11px] font-semibold text-red-500 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
