import React, { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring transition-all duration-300 ${
            error
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-card-border focus:border-primary-start/50'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-card text-text-primary"
            >
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-[11px] font-semibold text-red-500 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
