import React from 'react';
import type { NewDependentInput } from '../../../hooks/booking/use-user-booking';
import { formatShortDate } from '@/shared/utils/date.util';

interface ReviewPatientDetailsProps {
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  selectedDependentId: string | null;
  newDependentData: NewDependentInput | null;
  userProfile?: any;
  userDependents?: any[];
}

export function ReviewPatientDetails({
  patientType,
  selectedDependentId,
  newDependentData,
  userProfile,
  userDependents,
}: ReviewPatientDetailsProps) {
  if (patientType === 'SELF') {
    return (
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-xs flex flex-col gap-3 mt-2 text-left">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">👤 Myself (Self)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">First Name</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{userProfile?.firstName || 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Middle Name</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{userProfile?.middleName || 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Last Name</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{userProfile?.lastName || 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Suffix</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{userProfile?.suffix || 'N/A'}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-slate-200 dark:border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Date of Birth</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">{userProfile?.dateOfBirth ? formatShortDate(userProfile.dateOfBirth) : 'N/A'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (patientType === 'NEW_DEPENDENT' && newDependentData) {
    return (
      <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-xs flex flex-col gap-3 mt-2 text-left">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">👤 New Family Member</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">First Name</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{newDependentData.firstName || 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Middle Name</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{newDependentData.middleName || 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Last Name</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{newDependentData.lastName || 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Suffix</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{newDependentData.suffix || 'N/A'}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-slate-200 dark:border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Date of Birth</span>
            <span className="text-slate-650 dark:text-slate-300 font-medium">{newDependentData.birthday ? formatShortDate(newDependentData.birthday) : 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Relationship</span>
            <span className="text-slate-650 dark:text-slate-300 font-medium">{newDependentData.relationship}</span>
          </div>
        </div>
      </div>
    );
  }

  if (patientType === 'EXISTING_DEPENDENT') {
    const dep = userDependents?.find((d) => d.id === selectedDependentId);
    if (dep) {
      return (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-xs flex flex-col gap-3 mt-2 text-left">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">👤 Existing Family Member</span>
          </div>
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
              <span className="text-slate-600 dark:text-slate-300 font-medium">{dep.dateOfBirth ? formatShortDate(dep.dateOfBirth) : 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Relationship</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">{dep.relationship}</span>
            </div>
          </div>
        </div>
      );
    }
  }

  return <span className="font-bold text-slate-800 dark:text-slate-300 text-sm">👤 Patient</span>;
}
