import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface AppointmentStatusReasonCalloutProps {
  appt: AppointmentDto;
}

const TONE_CLASSES = {
  amber: 'bg-amber-500/5 border-amber-500/10 text-slate-650 dark:text-slate-400 text-amber-600 dark:text-amber-450',
  emerald: 'bg-emerald-500/5 border-emerald-500/10 text-slate-655 dark:text-slate-400 text-emerald-600 dark:text-emerald-450',
  rose: 'bg-rose-500/5 border-rose-500/10 text-slate-655 dark:text-slate-400 text-rose-600 dark:text-rose-455',
};

export function AppointmentStatusReasonCallout({ appt }: AppointmentStatusReasonCalloutProps) {
  if (!appt.statusReason) return null;

  const lowerReason = appt.statusReason.toLowerCase();
  const isRejectedReschedule = lowerReason.includes('reject');
  const isApprovedOrComplete = appt.status === 'APPROVED' || appt.status === 'COMPLETED';
  const isCancelledOrRejected = appt.status === 'CANCELLED' || appt.status === 'REJECTED';
  const tone = appt.proposedDate
    ? appt.status === 'RESCHEDULE_REQUESTED' ? 'amber' : isRejectedReschedule ? 'rose' : 'emerald'
    : isApprovedOrComplete ? 'emerald' : isCancelledOrRejected ? 'rose' : 'amber';
  const label = getReasonLabel(appt, isRejectedReschedule);

  return (
    <div className={`mt-4 p-4 rounded-xl text-xs border leading-relaxed ${TONE_CLASSES[tone]}`}>
      <span className="font-bold block mb-1">{label}</span>
      {appt.statusReason}
    </div>
  );
}

function getReasonLabel(appt: AppointmentDto, isRejectedReschedule: boolean) {
  if (appt.proposedDate) {
    if (appt.status === 'RESCHEDULE_REQUESTED') return 'Reschedule Reason (Pending Review):';
    return isRejectedReschedule ? 'Reschedule Request Rejected:' : 'Reschedule Request Approved:';
  }

  if (appt.status === 'APPROVED') return 'Approval Remarks:';
  if (appt.status === 'COMPLETED') return 'Treatment Remarks:';
  if (appt.status === 'CANCELLED') return 'Cancellation Reason:';
  if (appt.status === 'REJECTED') return 'Rejection Reason:';
  if (appt.status === 'DISPLACED') return 'Displacement Cause:';
  return 'Remarks:';
}
