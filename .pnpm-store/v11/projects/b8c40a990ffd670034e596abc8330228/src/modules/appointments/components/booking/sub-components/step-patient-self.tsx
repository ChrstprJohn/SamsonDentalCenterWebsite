import React from 'react';
import { formatShortDate } from '@/shared/utils/date.util';

interface StepPatientSelfProps {
  userProfile?: any;
}

export function StepPatientSelf({ userProfile }: StepPatientSelfProps) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-xs flex flex-col gap-3 text-left">
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
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Contact Email</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">{userProfile?.email || 'N/A'}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Phone Number</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">{userProfile?.phoneNumber || 'N/A'}</span>
        </div>
      </div>
      <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-2 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
        ℹ️ All booking confirmations and clinical updates will be securely sent to these contact details. They cannot be edited here.
      </p>
    </div>
  );
}
