'use client';

import React, { useState } from 'react';
import { AddDependentModal } from './add-dependent-modal';
import { ExistingDependentSelector } from './existing-dependent-selector';
import type { NewDependentInput } from '../../hooks/booking/use-user-booking';
import type { DependentProfileDto } from '@/modules/patients/dtos';
import { formatShortDate } from '@/shared/utils/date.util';

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Patient Information</h3>
        <p className="text-xs text-slate-500">Specify who this booking slot is reserved for.</p>
      </div>

      {/* Recipient Toggles */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            onSetPatientType('SELF');
          }}
          className={`p-3 rounded-xl border text-center font-semibold text-xs md:text-sm cursor-pointer transition-all ${
            patientType === 'SELF'
              ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : 'border-slate-200/85 dark:border-white/5 bg-white dark:bg-slate-900/30 text-slate-650 dark:text-slate-350'
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
          className={`p-3 rounded-xl border text-center font-semibold text-xs md:text-sm cursor-pointer transition-all ${
            patientType === 'EXISTING_DEPENDENT' || patientType === 'NEW_DEPENDENT'
              ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : 'border-slate-200/85 dark:border-white/5 bg-white dark:bg-slate-900/30 text-slate-650 dark:text-slate-350'
          }`}
        >
          My Family
        </button>
      </div>

      {/* Recipient Details Block */}
      {patientType === 'SELF' && (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 text-xs flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">First Name</span>
               <span className="text-slate-700 dark:text-slate-250 font-semibold">{userProfile?.firstName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Middle Name</span>
               <span className="text-slate-700 dark:text-slate-250 font-semibold">{userProfile?.middleName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Last Name</span>
               <span className="text-slate-700 dark:text-slate-250 font-semibold">{userProfile?.lastName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Suffix</span>
               <span className="text-slate-700 dark:text-slate-250 font-semibold">{userProfile?.suffix || 'N/A'}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-slate-200 dark:border-white/5">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Date of Birth</span>
               <span className="text-slate-600 dark:text-slate-300 font-medium">{userProfile?.dateOfBirth ? formatShortDate(userProfile.dateOfBirth) : 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Contact Email</span>
               <span className="text-slate-600 dark:text-slate-300 font-medium">{userProfile?.email || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Phone Number</span>
               <span className="text-slate-600 dark:text-slate-300 font-medium">{userProfile?.phoneNumber || 'N/A'}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
            ℹ️ All booking confirmations and clinical updates will be securely sent to these contact details. They cannot be edited here.
          </p>
        </div>
      )}

      {(patientType === 'EXISTING_DEPENDENT' || patientType === 'NEW_DEPENDENT') && (
        <div className="flex flex-col gap-4">
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
          
          {patientType === 'NEW_DEPENDENT' && newDependentData && (
        <div className="p-4 rounded-2xl border border-blue-200/50 bg-blue-500/5 text-xs flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-blue-500 font-bold">New Family Member Attached</span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-blue-550 dark:text-blue-450 hover:underline font-semibold"
            >
              Edit Details
            </button>
          </div>
          <div className="flex flex-col gap-1 mt-1 font-semibold text-slate-700 dark:text-slate-250">
            <span>Name: {[newDependentData.firstName, newDependentData.middleName, newDependentData.lastName, newDependentData.suffix].filter(Boolean).join(' ')}</span>
            <span>Relationship: {newDependentData.relationship}</span>
            <span>DOB: {formatShortDate(newDependentData.birthday)}</span>
          </div>
        </div>
      )}
      </div>
      )}

      {/* Booking Notes */}
      <div className="flex flex-col gap-1.5 mt-2">
        <label htmlFor="user-notes" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Notes (Optional)</label>
        <textarea
          id="user-notes"
          value={userNote}
          onChange={(e) => onSetUserNote(e.target.value)}
          placeholder="Enter symptoms, treatment preferences, or any specific comments..."
          rows={3}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-850 dark:text-white"
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
