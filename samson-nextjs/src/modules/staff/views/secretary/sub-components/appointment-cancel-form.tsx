'use client';
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NotificationChannelField } from './notification-channel-field';

interface AppointmentCancelFormProps {
  reasonPreset: string;
  appointmentId: string;
  setReasonPreset: (value: string) => void;
  reasonCustom: string;
  setReasonCustom: (value: string) => void;
  confirmationChannel?: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';
  onConfirmationChannelChange?: (channel: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE') => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  noFooter?: boolean;
}

const CANCEL_REASONS = [
  { value: 'Patient requested reschedule / cancellation', label: 'Patient requested' },
  { value: 'Assigned dentist unavailable today', label: 'Dentist unavailable' },
  { value: 'Unexpected clinic emergency / closure', label: 'Clinic emergency/holiday' },
  { value: 'CUSTOM', label: 'Other / Custom Reason...' },
];

export function AppointmentCancelForm(props: AppointmentCancelFormProps) {
  const [preset, setPreset] = useState<string>(props.reasonPreset || CANCEL_REASONS[0].value);
  const [customText, setCustomText] = useState<string>(props.reasonCustom || '');

  useEffect(() => {
    props.setReasonPreset(preset);
  }, [preset]);

  useEffect(() => {
    props.setReasonCustom(customText);
  }, [customText]);

  const handleSelectChange = (val: string) => {
    setPreset(val);
    props.setReasonPreset(val);
    if (val !== 'CUSTOM') {
      props.setReasonCustom('');
    }
  };

  const handleCustomChange = (val: string) => {
    setCustomText(val);
    props.setReasonCustom(val);
  };

  const activeReason = preset === 'CUSTOM' ? customText : preset;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit();
      }}
      className="flex flex-col gap-4 pt-1"
    >
      {props.onConfirmationChannelChange && <NotificationChannelField appointmentId={props.appointmentId} value={props.confirmationChannel} onChange={props.onConfirmationChannelChange} />}

      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-medium text-foreground">Cancellation Reason <span className="text-destructive">*</span></span>
          <span className="text-xs text-muted-foreground">Add a reason for this cancellation before confirming.</span>
        </div>
        <select
          value={preset}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
          required
        >
          {CANCEL_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {preset === 'CUSTOM' && (
          <Textarea
            placeholder="Enter custom cancellation reason..."
            value={customText}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border min-h-[60px] resize-none"
            required
          />
        )}
      </div>

      {!props.noFooter && (
        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            disabled={props.isSubmitting || !activeReason.trim()}
            className="flex-1 h-[42px] text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 rounded-xl disabled:opacity-50 transition-colors"
          >
            {props.isSubmitting ? 'Canceling...' : 'Confirm'}
          </Button>
          <Button
            type="button"
            onClick={props.onBack}
            className="flex-1 h-[42px] text-sm font-medium border border-card-border text-foreground bg-transparent hover:bg-muted rounded-xl"
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
