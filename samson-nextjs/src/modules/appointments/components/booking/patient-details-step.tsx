'use client';

import React, { useState } from 'react';
import { AddDependentModal } from './add-dependent-modal';
import { StepPatientSelf } from './sub-components/step-patient-self';
import { StepPatientDependent } from './sub-components/step-patient-dependent';
import type { NewDependentInput } from '../../hooks/booking/use-user-booking';
import type { DependentProfileDto } from '@/modules/patients/dtos/exports';

interface PatientDetailsStepProps {
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  selectedDependentId: string | null;
  newDependentData: NewDependentInput | null;
  userNote: string;
  userProfile?: any;
  userDependents?: DependentProfileDto[];
  onSetPatientType: (type: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT') => void;
  onSelectDependent: (id: string | null) => void;
  onSetNewDependent: (data: NewDependentInput | null) => void;
  onSetUserNote: (note: string) => void;
}

export function PatientDetailsStep({
  patientType,
  selectedDependentId,
  newDependentData,
  userNote,
  userProfile,
  userDependents = [],
  onSetPatientType,
  onSelectDependent,
  onSetNewDependent,
  onSetUserNote,
}: PatientDetailsStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddDependentSubmit = (data: NewDependentInput) => {
    onSetNewDependent(data);
    onSetPatientType('NEW_DEPENDENT');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Patient Information</h3>
        <p className="text-xs text-slate-500">Specify who this booking slot is reserved for.</p>
      </div>

      {/* Recipient Toggles */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSetPatientType('SELF')}
          className={`p-3.5 rounded-2xl border text-center font-bold text-xs md:text-sm cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
            patientType === 'SELF'
              ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold ring-2 ring-blue-500/20 shadow-sm'
              : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          Myself
        </button>

        <button
          type="button"
          onClick={() => {
            if (newDependentData) {
              onSetPatientType('NEW_DEPENDENT');
            } else {
              onSetPatientType('EXISTING_DEPENDENT');
              if (userDependents.length > 0 && !selectedDependentId) {
                onSelectDependent(userDependents[0].id);
              }
            }
          }}
          className={`p-3.5 rounded-2xl border text-center font-bold text-xs md:text-sm cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
            patientType === 'EXISTING_DEPENDENT' || patientType === 'NEW_DEPENDENT'
              ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold ring-2 ring-blue-500/20 shadow-sm'
              : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          My Family
        </button>
      </div>

      {/* Recipient Details Block */}
      {patientType === 'SELF' && <StepPatientSelf userProfile={userProfile} />}

      {(patientType === 'EXISTING_DEPENDENT' || patientType === 'NEW_DEPENDENT') && (
        <StepPatientDependent
          patientType={patientType}
          selectedDependentId={selectedDependentId}
          newDependentData={newDependentData}
          userDependents={userDependents}
          onSetPatientType={onSetPatientType}
          onSelectDependent={onSelectDependent}
          onSetNewDependent={onSetNewDependent}
          setIsModalOpen={setIsModalOpen}
        />
      )}

      {/* Booking Notes */}
      <div className="flex flex-col gap-1.5 mt-2">
        <label htmlFor="user-notes" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Clinical Notes (Optional)
        </label>
        <textarea
          id="user-notes"
          value={userNote}
          onChange={(e) => onSetUserNote(e.target.value)}
          placeholder="Enter symptoms, treatment preferences, or any specific comments..."
          rows={3}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white"
        />
      </div>

      <AddDependentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddDependentSubmit}
      />
    </div>
  );
}
