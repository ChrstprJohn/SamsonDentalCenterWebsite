import React from 'react';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface AppointmentStatusHeroProps {
  appt: AppointmentDto;
}

export function AppointmentStatusHero({ appt }: AppointmentStatusHeroProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending Staff Review';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      case 'RESCHEDULE_REQUESTED': return 'Reschedule Requested';
      case 'DISPLACED': return 'Displaced';
      case 'CHECKED_IN': return 'Checked-In';
      case 'TREATMENT_RENDERED': return 'Ready for Checkout';
      case 'COMPLETED': return 'Completed';
      case 'NO_SHOW': return 'No-Show';
      default: return status;
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'CHECKED_IN':
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          border: 'border-emerald-200 dark:border-emerald-900',
          text: 'text-emerald-800 dark:text-emerald-350',
          icon: '✅',
        };
      case 'CANCELLED':
      case 'REJECTED':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/20',
          border: 'border-rose-200 dark:border-rose-900',
          text: 'text-rose-800 dark:text-rose-350',
          icon: '❌',
        };
      case 'RESCHEDULE_REQUESTED':
      case 'PENDING':
      case 'DISPLACED':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-900',
          text: 'text-amber-800 dark:text-amber-350',
          icon: '🗓️',
        };
      case 'TREATMENT_RENDERED':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          border: 'border-blue-200 dark:border-blue-900',
          text: 'text-blue-800 dark:text-blue-350',
          icon: '💳',
        };
      case 'NO_SHOW':
        return {
          bg: 'bg-slate-100 dark:bg-slate-900/40',
          border: 'border-slate-200 dark:border-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          icon: '⚠️',
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-900/40',
          border: 'border-slate-200 dark:border-slate-800',
          text: 'text-slate-850 dark:text-slate-300',
          icon: 'ℹ️',
        };
    }
  };

  const statusTheme = getStatusColorClass(appt.status);

  return (
    <div className={`p-6 rounded-2xl border ${statusTheme.bg} ${statusTheme.border} flex flex-col gap-4 shadow-sm`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{statusTheme.icon}</span>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-550 block">
              Current Status
            </span>
            <h1 className={`text-xl sm:text-2xl font-black ${statusTheme.text}`}>
              {getStatusLabel(appt.status)}
            </h1>
          </div>
        </div>
        
        <div className="flex flex-col gap-0.5 self-start sm:self-auto">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest text-right">Reference ID</span>
          <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/5 select-all">
            {appt.id}
          </span>
        </div>
      </div>

      {/* Banners for specific states inside status hero */}
      {appt.status === 'CHECKED_IN' && (
        <div className="mt-2 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-xs font-medium text-emerald-805 dark:text-emerald-350">
          🏥 <strong>You are Checked-In!</strong> Please wait in the reception area. Your doctor will see you shortly.
        </div>
      )}

      {appt.status === 'TREATMENT_RENDERED' && (
        <div className="mt-2 bg-blue-500/10 p-3.5 rounded-xl border border-blue-500/20 text-xs text-blue-805 dark:text-blue-350 leading-relaxed">
          <strong>💳 Billing & Checkout Required:</strong> Your treatment is completed. Please proceed to the clinic front desk for final checkout and invoice settlement.
        </div>
      )}

      {appt.status === 'NO_SHOW' && (
        <div className="mt-2 bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20 text-xs text-rose-805 dark:text-rose-350 leading-relaxed">
          <strong>⚠️ Reliability Warning:</strong> You missed this appointment. Failures to attend without prior cancellation are recorded as negative credibility, which may restrict your reservation permissions.
        </div>
      )}
    </div>
  );
}
