import React from 'react';
import { ExistingDependentSelector } from '../existing-dependent-selector';
import type { NewDependentInput } from '../../../hooks/booking/use-user-booking';
import type { DependentProfileDto } from '@/modules/patients/dtos/exports';
import { formatShortDate } from '@/shared/utils/date.util';

interface StepPatientDependentProps {
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  selectedDependentId: string | null;
  newDependentData: NewDependentInput | null;
  userDependents?: DependentProfileDto[];
  onSetPatientType: (type: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT') => void;
  onSelectDependent: (id: string | null) => void;
  onSetNewDependent: (data: NewDependentInput | null) => void;
  setIsModalOpen: (open: boolean) => void;
}

export function StepPatientDependent({
  patientType,
  selectedDependentId,
  newDependentData,
  userDependents = [],
  onSetPatientType,
  onSelectDependent,
  onSetNewDependent,
  setIsModalOpen,
}: StepPatientDependentProps) {
  return (
    <div className="flex flex-col gap-4 text-left">
      <ExistingDependentSelector
        dependents={userDependents}
        selectedDependentId={patientType === 'EXISTING_DEPENDENT' ? selectedDependentId : null}
        onSelectDependent={(id) => {
          onSetPatientType('EXISTING_DEPENDENT');
          onSetNewDependent(null);
          onSelectDependent(id);
        }}
        onAddNew={() => setIsModalOpen(true)}
        showAddNew={!(patientType === 'NEW_DEPENDENT' && newDependentData !== null)}
      />
      
      {patientType === 'EXISTING_DEPENDENT' && selectedDependentId && (
        (() => {
          const dep = userDependents.find(d => d.id === selectedDependentId);
          if (!dep) return null;
          return (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-xs flex flex-col gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">First Name</span>
                   <span className="text-slate-700 dark:text-slate-300 font-semibold">{dep.firstName || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Middle Name</span>
                   <span className="text-slate-700 dark:text-slate-300 font-semibold">{dep.middleName || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Last Name</span>
                   <span className="text-slate-700 dark:text-slate-300 font-semibold">{dep.lastName || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Suffix</span>
                   <span className="text-slate-700 dark:text-slate-300 font-semibold">{dep.suffix || 'N/A'}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-slate-200 dark:border-white/5">
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Date of Birth</span>
                   <span className="text-slate-650 dark:text-slate-300 font-medium">{dep.dateOfBirth ? formatShortDate(dep.dateOfBirth) : 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Relationship</span>
                   <span className="text-slate-650 dark:text-slate-300 font-medium">{dep.relationship}</span>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {patientType === 'NEW_DEPENDENT' && newDependentData && (
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-xs flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-blue-500 dark:text-blue-400 font-bold">New Family Member Attached</span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Edit Details
            </button>
          </div>
          <div className="flex flex-col gap-1 mt-1 font-semibold text-slate-700 dark:text-slate-300">
            <span>Name: {[newDependentData.firstName, newDependentData.middleName, newDependentData.lastName, newDependentData.suffix].filter(Boolean).join(' ')}</span>
            <span>Relationship: {newDependentData.relationship}</span>
            <span>DOB: {formatShortDate(newDependentData.birthday)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
