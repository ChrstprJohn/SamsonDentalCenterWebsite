import React from 'react';

interface ReviewContactDetailsProps {
  userProfile?: any;
}

export function ReviewContactDetails({ userProfile }: ReviewContactDetailsProps) {
  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-card/50 dark:bg-slate-900/30 relative shadow-sm hover:scale-[1.01] transition-all duration-300 text-left">
      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">4. Contact Details</h4>
      <div className="flex flex-col sm:flex-row gap-8 mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Email Address</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm">📧 {userProfile?.email || 'N/A'}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Phone Number</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm">📱 {userProfile?.phoneNumber || 'N/A'}</span>
        </div>
      </div>
      <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 flex items-start gap-3">
        <span className="text-blue-500 text-lg leading-none mt-0.5">ℹ️</span>
        <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-300 font-medium">
          All booking confirmations, appointment reminders, and clinical updates will be securely sent to these primary contact details.
        </p>
      </div>
    </div>
  );
}
