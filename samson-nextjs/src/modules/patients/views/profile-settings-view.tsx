'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast-container';

interface ProfileSettingsViewProps {
  initialUser: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
  };
}

export function ProfileSettingsView({ initialUser }: ProfileSettingsViewProps) {
  const [firstName, setFirstName] = useState(initialUser.firstName);
  const [middleName, setMiddleName] = useState(initialUser.middleName || '');
  const [lastName, setLastName] = useState(initialUser.lastName);
  const [phone, setPhone] = useState(initialUser.phone);
  const [dob, setDob] = useState(initialUser.dob);

  // Notification Preferences states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [bellAlerts, setBellAlerts] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !dob) {
      addToast('Please fill out all mandatory fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate server action profile update
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    addToast('Profile records updated successfully.', 'success');
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h2>
        <p className="text-xs text-slate-500">Edit your contact details and customize notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Profile Details Form */}
        <form onSubmit={handleProfileSubmit} className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-lg flex flex-col gap-6">
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
                value={initialUser.email}
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

        {/* Notification preferences block */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-lg flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Preferences</h3>
            
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Email Alerts</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Reminders & Receipts</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">SMS Updates</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Quick text slot alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">In-App Notifications</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Bell count badge triggers</span>
                </div>
                <input
                  type="checkbox"
                  checked={bellAlerts}
                  onChange={(e) => setBellAlerts(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
