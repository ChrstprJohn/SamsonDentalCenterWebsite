'use client';

import React from 'react';
import type { DependentProfileDto } from '@/modules/patients/dtos';
import { formatShortDate } from '@/shared/utils/date.util';

interface ExistingDependentSelectorProps {
  dependents: DependentProfileDto[];
  selectedDependentId: string | null;
  onSelectDependent: (id: string | null) => void;
  onAddNew: () => void;
  showAddNew?: boolean;
}

export function ExistingDependentSelector({ 
  dependents, 
  selectedDependentId, 
  onSelectDependent, 
  onAddNew,
  showAddNew = true,
}: ExistingDependentSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Registered Dependent</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dependents.map((dep) => {
          const isSelected = selectedDependentId === dep.id;
          return (
            <div
              key={dep.id}
              onClick={() => onSelectDependent(dep.id)}
              className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {[dep.firstName, dep.middleName, dep.lastName, dep.suffix].filter(Boolean).join(' ')}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">{dep.relationship}</span>
              </div>
              <span className="text-[10px] text-slate-400">📅 {formatShortDate(dep.dateOfBirth)}</span>
            </div>
          );
        })}

        {/* Add New Button */}
        {showAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="h-full min-h-[70px] border-2 border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Add New Member</span>
          </button>
        )}
      </div>
    </div>
  );
}
