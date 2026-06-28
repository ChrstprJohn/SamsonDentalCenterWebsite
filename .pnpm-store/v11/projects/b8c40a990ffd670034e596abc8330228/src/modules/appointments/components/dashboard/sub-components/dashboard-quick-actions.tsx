import React from 'react';

interface DashboardQuickActionsProps {
  onBookClick: () => void;
  onAppointmentsClick: () => void;
  onSettingsClick: () => void;
}

export function DashboardQuickActions({
  onBookClick,
  onAppointmentsClick,
  onSettingsClick,
}: DashboardQuickActionsProps) {
  return (
    <section className="flex flex-col gap-4 text-left">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={onBookClick}
          className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-md hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-500/30 text-left transition-all duration-300 group flex flex-col gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform duration-200 select-none">
            ➕
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base">Book Appointment</h4>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">
              Schedule a new visit or consultation slot with our specialists.
            </p>
          </div>
        </button>

        <button
          onClick={onAppointmentsClick}
          className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-md hover:shadow-lg hover:border-indigo-500/50 dark:hover:border-indigo-500/30 text-left transition-all duration-300 group flex flex-col gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform duration-200 select-none">
            📅
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base">My Appointments</h4>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">
              Manage approved bookings, track status changes, and view history.
            </p>
          </div>
        </button>

        <button
          onClick={onSettingsClick}
          className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-md hover:shadow-lg hover:border-violet-500/50 dark:hover:border-violet-500/30 text-left transition-all duration-300 group flex flex-col gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-650 dark:text-violet-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform duration-200 select-none">
            ⚙️
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base">Account Settings</h4>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">
              Update your details, customize avatar, and adjust alerts.
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}
