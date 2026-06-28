'use client';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PendingDecision } from '@/modules/staff/hooks/secretary/use-secretary-pending-requests';

interface PendingDecisionFormProps {
  stagedStatus: PendingDecision;
  stagedReason: string;
  customReason: string;
  isSubmitting: boolean;
  onDecisionChange: (status: Exclude<PendingDecision, ''>) => void;
  onReasonChange: (reason: string) => void;
  onCustomReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

const REASONS = {
  APPROVED: [
    { value: '', label: 'Select approval reason...' },
    { value: 'Roster schedule cleared', label: 'Roster schedule cleared' },
    { value: 'Treatment room available', label: 'Treatment room available' },
    { value: 'Staff slots balanced', label: 'Staff slots balanced' },
    { value: 'Family batched reservation finalized', label: 'Family batched reservation finalized' },
    { value: 'CUSTOM', label: 'Other / Custom Remark...' },
  ],
  REJECTED: [
    { value: '', label: 'Select rejection reason...' },
    { value: 'Doctor unavailable on requested slot', label: 'Doctor unavailable on requested slot' },
    { value: 'Clinic closed on requested date', label: 'Clinic closed on requested date' },
    { value: 'Selected service requires pre-consultation', label: 'Selected service requires pre-consultation' },
    { value: 'Double-booking conflict on slot', label: 'Double-booking conflict on slot' },
    { value: 'CUSTOM', label: 'Other / Custom Reason...' },
  ],
  DISPLACED: [
    { value: '', label: 'Select displacement reason...' },
    { value: 'Doctor emergency leave', label: 'Doctor emergency leave' },
    { value: 'Clinic power outage / maintenance', label: 'Clinic power outage / maintenance' },
    { value: 'Overbooked schedule adjustments', label: 'Overbooked schedule adjustments' },
    { value: 'Priority emergency treatment took precedence', label: 'Priority emergency treatment took precedence' },
    { value: 'CUSTOM', label: 'Other / Custom Reason...' },
  ],
};

export function PendingDecisionForm(props: PendingDecisionFormProps) {
  return (
    <div className="border-t border-card-border/80 pt-4 flex flex-col gap-4 mt-auto">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-text-secondary">Staged Decision Action</span>
        <div className="flex gap-2">
          {(['APPROVED', 'REJECTED', 'DISPLACED'] as const).map((status) => (
            <button key={status} type="button" onClick={() => props.onDecisionChange(status)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${getDecisionClass(props.stagedStatus, status)}`}>
              {status === 'APPROVED' ? 'Approve' : status === 'REJECTED' ? 'Reject' : 'Displace'}
            </button>
          ))}
        </div>
      </div>
      {props.stagedStatus && (
        <div className="flex flex-col gap-2 transition-all">
          <span className="text-xs font-bold text-text-secondary">Remarks / Reason (Required)</span>
          <Select value={props.stagedReason} onChange={(event) => props.onReasonChange(event.target.value)} className="text-xs py-2 px-3 rounded-lg border border-card-border" options={REASONS[props.stagedStatus]} />
          {props.stagedReason === 'CUSTOM' && (
            <Textarea value={props.customReason} onChange={(event) => props.onCustomReasonChange(event.target.value)} placeholder="Enter your custom justification reason..." rows={2} className="text-xs mt-1" />
          )}
        </div>
      )}
      <Button
        onClick={props.onConfirm}
        disabled={props.isSubmitting || !props.stagedStatus || !props.stagedReason || (props.stagedReason === 'CUSTOM' && !props.customReason.trim())}
        variant="primary"
        className="w-full text-xs font-bold py-3 mt-2"
      >
        {props.isSubmitting ? 'Saving Review...' : 'Finish Review Decision'}
      </Button>
    </div>
  );
}

function getDecisionClass(current: PendingDecision, status: Exclude<PendingDecision, ''>) {
  if (current !== status) return 'border-card-border bg-card text-text-muted hover:text-text-primary';
  if (status === 'APPROVED') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
  if (status === 'REJECTED') return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
  return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
}
