'use client';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { RescheduleDecision } from '@/modules/staff/hooks/secretary/use-secretary-reschedule-requests';

interface RescheduleDecisionFormProps {
  stagedStatus: RescheduleDecision;
  stagedReason: string;
  customReason: string;
  isSubmitting: boolean;
  onDecisionChange: (status: Exclude<RescheduleDecision, ''>) => void;
  onReasonChange: (reason: string) => void;
  onCustomReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

export function RescheduleDecisionForm(props: RescheduleDecisionFormProps) {
  return (
    <div className="border-t border-card-border/80 pt-4 flex flex-col gap-4 mt-auto">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-text-secondary">Decision Action</span>
        <div className="flex gap-2">
          {(['APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => props.onDecisionChange(status)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${getDecisionClass(props.stagedStatus, status)}`}
            >
              {status === 'APPROVED' ? 'Approve Reschedule' : 'Reject / Keep Original'}
            </button>
          ))}
        </div>
      </div>
      {props.stagedStatus && (
        <ReasonFields
          stagedStatus={props.stagedStatus}
          stagedReason={props.stagedReason}
          customReason={props.customReason}
          onReasonChange={props.onReasonChange}
          onCustomReasonChange={props.onCustomReasonChange}
        />
      )}
      <Button
        onClick={props.onConfirm}
        disabled={props.isSubmitting || !props.stagedStatus || !props.stagedReason || (props.stagedReason === 'CUSTOM' && !props.customReason.trim())}
        variant="primary"
        className="w-full text-xs font-bold py-3 mt-2"
      >
        {props.isSubmitting ? 'Saving Review...' : 'Confirm Decision'}
      </Button>
    </div>
  );
}

function ReasonFields(props: Pick<RescheduleDecisionFormProps, 'stagedStatus' | 'stagedReason' | 'customReason' | 'onReasonChange' | 'onCustomReasonChange'>) {
  const options = props.stagedStatus === 'APPROVED'
    ? [
        { value: '', label: 'Select approval remark...' },
        { value: 'Doctor schedule cleared', label: 'Doctor schedule cleared' },
        { value: 'Requested slot available', label: 'Requested slot available' },
        { value: 'Patient emergency priority', label: 'Patient emergency priority' },
        { value: 'CUSTOM', label: 'Other / Custom Remark...' },
      ]
    : [
        { value: '', label: 'Select rejection reason...' },
        { value: 'Proposed slot double-booked', label: 'Proposed slot double-booked' },
        { value: 'Doctor unavailable on proposed date', label: 'Doctor unavailable on proposed date' },
        { value: 'Clinic closed on proposed day', label: 'Clinic closed on proposed day' },
        { value: 'CUSTOM', label: 'Other / Custom Reason...' },
      ];

  return (
    <div className="flex flex-col gap-2 transition-all">
      <span className="text-xs font-bold text-text-secondary">Remarks / Reason (Required)</span>
      <Select value={props.stagedReason} onChange={(event) => props.onReasonChange(event.target.value)} className="text-xs py-2 px-3 rounded-lg border border-card-border" options={options} />
      {props.stagedReason === 'CUSTOM' && (
        <Textarea value={props.customReason} onChange={(event) => props.onCustomReasonChange(event.target.value)} placeholder="Enter your custom justification reason..." rows={2} className="text-xs mt-1" />
      )}
    </div>
  );
}

function getDecisionClass(current: RescheduleDecision, status: Exclude<RescheduleDecision, ''>) {
  if (current !== status) return 'border-card-border bg-card text-text-muted hover:text-text-primary';
  return status === 'APPROVED'
    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
    : 'bg-rose-500/10 text-rose-500 border-rose-500/30';
}
