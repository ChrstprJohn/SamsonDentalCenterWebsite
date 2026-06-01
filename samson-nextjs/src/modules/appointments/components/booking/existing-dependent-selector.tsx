'use client';

import React from 'react';

// Keeping MOCK_DEPENDENTS for now as we haven't wired up fetching real dependents.
export const MOCK_DEPENDENTS = [
  { id: 'dep-1', name: 'Jane Samson', relationship: 'Spouse', dob: '1992-04-12' },
  { id: 'dep-2', name: 'Timmy Samson', relationship: 'Child', dob: '2016-09-22' },
];

interface ExistingDependentSelectorProps {
  selectedDependentId: string | null;
  onSelectDependent: (id: string | null) => void;
}

export function ExistingDependentSelector({ selectedDependentId, onSelectDependent }: ExistingDependentSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Registered Dependent</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MOCK_DEPENDENTS.map((dep) => {
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
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{dep.name}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{dep.relationship}</span>
              </div>
              <span className="text-[10px] text-slate-400">📅 {dep.dob}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
