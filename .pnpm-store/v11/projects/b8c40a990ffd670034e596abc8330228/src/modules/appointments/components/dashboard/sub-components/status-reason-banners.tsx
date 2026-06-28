import React from 'react';
import type { AppointmentDto } from '../../../dtos/exports';

interface StatusReasonBannersProps {
  appt: AppointmentDto;
}

export function StatusReasonBanners({ appt }: StatusReasonBannersProps) {
  return (
    <div className="mt-4">
      {appt.status === 'APPROVED' && appt.statusReason && (
        <div className="bg-emerald-500/5 p-4 rounded-2xl text-xs border border-emerald-500/10 text-slate-500 dark:text-slate-400 leading-relaxed text-left">
          <span className="font-bold block text-emerald-600 dark:text-emerald-450 mb-1">✅ Approval Remarks:</span>
          {appt.statusReason}
        </div>
      )}

      {appt.status === 'RESCHEDULE_REQUESTED' && appt.statusReason && (
        <div className="bg-amber-500/5 p-4 rounded-2xl text-xs border border-amber-500/10 text-slate-500 dark:text-slate-400 leading-relaxed text-left">
          <span className="font-bold block text-amber-600 dark:text-amber-450 mb-1">🗓️ Request Note:</span>
          {appt.statusReason}
        </div>
      )}

      {appt.status === 'COMPLETED' && appt.statusReason && (
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-xs border border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 leading-relaxed text-left">
          <span className="font-bold block text-slate-700 dark:text-slate-300 mb-1">👩‍⚕️ Treatment Remarks:</span>
          {appt.statusReason}
        </div>
      )}

      {appt.status === 'CANCELLED' && appt.statusReason && (
        <div className="bg-rose-500/5 p-4 rounded-2xl text-xs border border-rose-500/10 text-slate-500 dark:text-slate-400 leading-relaxed text-left">
          <span className="font-bold block text-rose-500 dark:text-rose-450 mb-1">❌ Cancellation Reason:</span>
          {appt.statusReason}
        </div>
      )}

      {appt.status === 'REJECTED' && appt.statusReason && (
        <div className="bg-red-500/5 p-4 rounded-2xl text-xs border border-red-500/10 text-slate-500 dark:text-slate-400 leading-relaxed text-left">
          <span className="font-bold block text-red-500 dark:text-red-450 mb-1">🚫 Rejection Reason:</span>
          {appt.statusReason}
        </div>
      )}

      {appt.status === 'DISPLACED' && appt.statusReason && (
        <div className="bg-amber-500/5 p-4 rounded-2xl text-xs border border-amber-500/10 text-slate-500 dark:text-slate-400 leading-relaxed text-left">
          <span className="font-bold block text-amber-500 dark:text-amber-450 mb-1">⚠️ Displacement Cause:</span>
          {appt.statusReason}
        </div>
      )}

      {appt.status === 'NO_SHOW' && (
        <div className="bg-slate-100/50 dark:bg-slate-950 p-4 rounded-2xl text-xs border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 leading-relaxed flex gap-2 text-left">
          <span className="text-amber-500">⚠️</span>
          <p>
            <strong>No-Show Warning</strong>: You missed this appointment. Failures to attend without prior cancellation are recorded as negative credibility, which may restrict your reservation permissions.
          </p>
        </div>
      )}

      {appt.status === 'TREATMENT_RENDERED' && (
        <div className="bg-blue-500/5 p-4 rounded-2xl text-xs border border-blue-500/10 text-slate-500 dark:text-slate-400 leading-relaxed text-left">
          <span className="font-bold block text-blue-600 dark:text-blue-400 mb-1">💳 Billing & Checkout:</span>
          Your treatment has been submitted by the doctor. Please proceed to the clinic front desk for final checkout and invoice settlement.
        </div>
      )}
    </div>
  );
}
