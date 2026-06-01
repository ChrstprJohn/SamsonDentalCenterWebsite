import React from 'react';
import { Button } from '@/components/ui/button';

interface ProfileDetailsFormProps {
  profileDetails: {
    firstName: string;
    setFirstName: (val: string) => void;
    middleName: string;
    setMiddleName: (val: string) => void;
    lastName: string;
    setLastName: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
    dob: string;
    setDob: (val: string) => void;
    email: string;
  };
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileDetailsForm({ profileDetails, isSubmitting, onSubmit }: ProfileDetailsFormProps) {
  const {
    firstName, setFirstName,
    middleName, setMiddleName,
    lastName, setLastName,
    phone, setPhone,
    dob, setDob,
    email,
  } = profileDetails;

  return (
    <form onSubmit={onSubmit} className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-lg flex flex-col gap-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Personal Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-firstname" className="text-xs font-semibold text-slate-500">First Name</label>
          <input
            type="text"
            id="settings-firstname"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-lastname" className="text-xs font-semibold text-slate-500">Last Name</label>
          <input
            type="text"
            id="settings-lastname"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-middlename" className="text-xs font-semibold text-slate-500">Middle Name</label>
          <input
            type="text"
            id="settings-middlename"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-dob" className="text-xs font-semibold text-slate-500">Date of Birth</label>
          <input
            type="date"
            id="settings-dob"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-email" className="text-xs font-semibold text-slate-500">Email Address (Read-only)</label>
          <input
            type="email"
            id="settings-email"
            readOnly
            value={email}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900 text-sm text-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-phone" className="text-xs font-semibold text-slate-500">Mobile Phone (E.164)</label>
          <input
            type="tel"
            id="settings-phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start mt-2">
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
}
