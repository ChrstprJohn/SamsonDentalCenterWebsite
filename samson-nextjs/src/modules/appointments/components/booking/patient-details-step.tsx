'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { NewDependentInput } from '../../hooks/booking/use-user-booking';

interface PatientDetailsStepProps {
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  selectedDependentId: string | null;
  newDependentData: NewDependentInput | null;
  userNote: string;
  onSetPatientType: (type: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT') => void;
  onSelectDependent: (id: string | null) => void;
  onSetNewDependent: (data: NewDependentInput | null) => void;
  onSetUserNote: (note: string) => void;
}

const MOCK_DEPENDENTS = [
  { id: 'dep-1', name: 'Jane Samson', relationship: 'Spouse', dob: '1992-04-12' },
  { id: 'dep-2', name: 'Timmy Samson', relationship: 'Child', dob: '2016-09-22' },
];

export function PatientDetailsStep({
  patientType,
  selectedDependentId,
  newDependentData,
  userNote,
  onSetPatientType,
  onSelectDependent,
  onSetNewDependent,
  onSetUserNote,
}: PatientDetailsStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal form states
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState<'MALE' | 'FEMALE'>('MALE');
  const [relationship, setRelationship] = useState('Child');

  const handleAddDependentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !dob || !relationship) return;

    const data: NewDependentInput = {
      firstName,
      middleName: middleName || undefined,
      lastName,
      birthday: dob,
      sex,
      relationship,
    };

    onSetNewDependent(data);
    onSetPatientType('NEW_DEPENDENT');
    setIsModalOpen(false);
    
    // Clear form
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setDob('');
    setSex('MALE');
    setRelationship('Child');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Patient Information</h3>
        <p className="text-xs text-slate-500">Specify who this booking slot is reserved for.</p>
      </div>

      {/* Recipient Toggles */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            onSetPatientType('SELF');
            onSelectDependent(null);
            onSetNewDependent(null);
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
            onSetPatientType('EXISTING_DEPENDENT');
            onSetNewDependent(null);
            if (MOCK_DEPENDENTS.length > 0 && !selectedDependentId) {
              onSelectDependent(MOCK_DEPENDENTS[0].id);
            }
          }}
          className={`p-3 rounded-xl border text-center font-semibold text-xs md:text-sm cursor-pointer transition-all ${
            patientType === 'EXISTING_DEPENDENT'
              ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : 'border-slate-200/85 dark:border-white/5 bg-white dark:bg-slate-900/30 text-slate-650 dark:text-slate-350'
          }`}
        >
          My Family
        </button>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`p-3 rounded-xl border text-center font-semibold text-xs md:text-sm cursor-pointer transition-all border-dashed ${
            patientType === 'NEW_DEPENDENT'
              ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : 'border-slate-200/85 dark:border-white/5 bg-white dark:bg-slate-900/30 text-slate-650 dark:text-slate-350'
          }`}
        >
          + Add New
        </button>
      </div>

      {/* Recipient Details Block */}
      {patientType === 'SELF' && (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 text-xs flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Recipient Name</span>
            <span className="font-semibold text-slate-700 dark:text-slate-250">Patient (Self)</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Profile contact details are auto-loaded securely from your credential session records.</p>
        </div>
      )}

      {patientType === 'EXISTING_DEPENDENT' && (
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
      )}

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
            <span>Name: {newDependentData.firstName} {newDependentData.lastName}</span>
            <span>Relationship: {newDependentData.relationship}</span>
            <span>DOB: {newDependentData.birthday}</span>
          </div>
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

      {/* Add New Dependent Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Family Member / Dependent"
        size="md"
      >
        <form onSubmit={handleAddDependentSubmit} className="flex flex-col gap-4 py-2 text-slate-700 dark:text-slate-350 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Middle Name (Opt)</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
              >
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Biological Sex</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    checked={sex === 'MALE'}
                    onChange={() => setSex('MALE')}
                  />
                  Male
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    checked={sex === 'FEMALE'}
                    onChange={() => setSex('FEMALE')}
                  />
                  Female
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-white/5 pt-4 mt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Attach Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
