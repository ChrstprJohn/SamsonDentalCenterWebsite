'use client';

import React from 'react';
import type { DependentProfileDto } from '@/modules/patients/dtos';

interface ExistingDependentSelectorProps {
  dependents: DependentProfileDto[];
  selectedDependentId: string | null;
  onSelectDependent: (id: string | null) => void;
  onAddNew: () => void;
}

export function ExistingDependentSelector({ 
  dependents, 
  selectedDependentId, 
  onSelectDependent, 
  onAddNew 
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
              className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-500/10 ring-2 ring-blue-500/20'
                  : 'border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/30 hover:border-slate-350'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {[dep.firstName, dep.middleName, dep.lastName, dep.suffix].filter(Boolean).join(' ')}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">{dep.relationship}</span>
              </div>
              <span className="text-[10px] text-slate-400">📅 {dep.dateOfBirth}</span>
            </div>
          );
        })}

        {/* Add New Button Card */}
        <div
          onClick={onAddNew}
          className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-500/10 cursor-pointer flex items-center justify-center transition-all text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 min-h-[72px]"
        >
          <span className="text-xs font-semibold">+ Add New Member</span>
        </div>
      </div>
    </div>
  );
}
