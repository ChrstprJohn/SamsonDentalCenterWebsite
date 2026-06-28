'use client';

import React from 'react';

interface Service {
  id: string;
  name: string;
}

interface ServicePillSelectorProps {
  allServices: Service[];
  selectedServiceIds: string[];
  onChange: (serviceIds: string[]) => void;
  disabled?: boolean;
}

export function ServicePillSelector({
  allServices,
  selectedServiceIds,
  onChange,
  disabled = false,
}: ServicePillSelectorProps) {
  const selectedServices = allServices.filter((s) => selectedServiceIds.includes(s.id));
  const unselectedServices = allServices.filter((s) => !selectedServiceIds.includes(s.id));

  const handleAdd = (id: string) => {
    if (disabled || !id) return;
    onChange([...selectedServiceIds, id]);
  };

  const handleRemove = (id: string) => {
    if (disabled) return;
    onChange(selectedServiceIds.filter((sid) => sid !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-1.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-900/50">
        {selectedServices.length === 0 ? (
          <span className="text-xs text-text-muted p-1">No services selected</span>
        ) : (
          selectedServices.map((service) => (
            <span
              key={service.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20"
            >
              {service.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(service.id)}
                  className="hover:bg-blue-500/20 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px] leading-none transition-colors"
                >
                  ×
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {!disabled && unselectedServices.length > 0 && (
        <select
          onChange={(e) => {
            handleAdd(e.target.value);
            e.target.value = '';
          }}
          defaultValue=""
          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="" disabled>
            + Add a Service...
          </option>
          {unselectedServices.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
