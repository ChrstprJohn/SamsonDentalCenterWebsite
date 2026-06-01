import React from 'react';

interface ProfilePreferencesFormProps {
  preferences: {
    emailAlerts: boolean;
    setEmailAlerts: (val: boolean) => void;
    smsAlerts: boolean;
    setSmsAlerts: (val: boolean) => void;
    bellAlerts: boolean;
    setBellAlerts: (val: boolean) => void;
  };
}

export function ProfilePreferencesForm({ preferences }: ProfilePreferencesFormProps) {
  const {
    emailAlerts, setEmailAlerts,
    smsAlerts, setSmsAlerts,
    bellAlerts, setBellAlerts,
  } = preferences;

  return (
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
  );
}
