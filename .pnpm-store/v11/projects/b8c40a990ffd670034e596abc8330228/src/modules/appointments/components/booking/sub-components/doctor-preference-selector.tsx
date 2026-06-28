import React from 'react';
import type { UserProfileResponseDto } from '@/modules/staff/dtos/exports';

interface DoctorPreferenceSelectorProps {
  selectedDoctorId: string;
  doctors?: UserProfileResponseDto[];
  isLoadingDoctors?: boolean;
  onSelectDoctor: (doctorId: string) => void;
}

export function DoctorPreferenceSelector({
  selectedDoctorId,
  doctors = [],
  isLoadingDoctors = false,
  onSelectDoctor,
}: DoctorPreferenceSelectorProps) {
  return (
    <div className="md:col-span-2 flex flex-col gap-3 text-left">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Preferred Doctor</h4>
      {isLoadingDoctors ? (
        <div className="text-xs text-slate-400 animate-pulse py-2">Loading available doctors...</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {/* Any Doctor Option */}
          <button
            type="button"
            onClick={() => onSelectDoctor('ANY')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-350 cursor-pointer flex flex-col gap-1 hover:scale-[1.01] active:scale-[0.99] ${
              selectedDoctorId === 'ANY'
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold ring-2 ring-blue-500/20 shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold">
              <span>👨‍⚕️✨</span>
              <span>Any Doctor</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Fastest available time slot</span>
          </button>

          {/* Specific Doctor Options */}
          {doctors.map((doc) => {
            const isSelected = selectedDoctorId === doc.id;
            const specialty = doc.lastName === 'Doe' ? 'Orthodontics Specialist' : 'General Dentist';
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDoctor(doc.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-350 cursor-pointer flex flex-col gap-1 hover:scale-[1.01] active:scale-[0.99] ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <span>{doc.lastName === 'Doe' ? '👩‍⚕️' : '👨‍⚕️'}</span>
                  <span className="truncate">Dr. {doc.firstName} {doc.lastName}</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">{specialty}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
