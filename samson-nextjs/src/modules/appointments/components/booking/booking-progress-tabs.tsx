'use client';

import React from 'react';

interface BookingProgressTabsProps {
  currentStep: number;
  goToStep: (step: 1 | 2 | 3 | 4) => void;
  isNextDisabled: () => boolean;
}

export function BookingProgressTabs({ currentStep, goToStep, isNextDisabled }: BookingProgressTabsProps) {
  const steps = [
    { num: 1 as const, label: 'Service' },
    { num: 2 as const, label: 'Schedule' },
    { num: 3 as const, label: 'Details' },
    { num: 4 as const, label: 'Review' },
  ];

  return (
    <div className="flex items-center justify-between relative">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-150 dark:bg-white/5 -translate-y-1/2 z-0" />
      {steps.map((step) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;
        return (
          <button
            key={step.num}
            onClick={() => goToStep(step.num)}
            disabled={step.num > currentStep && isNextDisabled()}
            className="flex flex-col items-center gap-2 relative z-10 cursor-pointer disabled:opacity-50 disabled:pointer-events-none group"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
              isActive
                ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : isCompleted
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-400'
            }`}>
              {isCompleted ? '✓' : step.num}
            </div>
            <span className={`text-[10px] md:text-xs font-semibold ${
              isActive ? 'text-blue-550 dark:text-blue-450' : 'text-slate-400'
            }`}>
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
