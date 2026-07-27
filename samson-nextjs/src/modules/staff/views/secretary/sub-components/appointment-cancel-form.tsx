'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AppointmentCancelFormProps {
  reasonPreset: string;
  setReasonPreset: (value: string) => void;
  reasonCustom: string;
  setReasonCustom: (value: string) => void;
  confirmationChannel?: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';
  onConfirmationChannelChange?: (channel: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE') => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
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
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-medium text-destructive">Cancel Slot</h3>
        <p className="text-xs text-muted-foreground">Select a cancellation reason to confirm.</p>
      </div>

      {props.onConfirmationChannelChange && (
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/40 border border-card-border">
          <span className="text-xs font-bold text-text-secondary">Notification Channel</span>
          <div className="grid grid-cols-4 gap-1.5">
            {(['EMAIL', 'SMS', 'BOTH', 'NONE'] as const).map((ch) => (
              <button
                type="button"
                key={ch}
                onClick={() => props.onConfirmationChannelChange?.(ch)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                  (props.confirmationChannel || 'EMAIL') === ch
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-text-muted hover:text-text-primary border-card-border'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Reason <span className="text-destructive">*</span></label>
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

      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          disabled={props.isSubmitting || !activeReason.trim()}
          className="flex-1 h-[42px] text-sm font-medium bg-destructive text-white hover:bg-destructive/90 rounded-xl disabled:opacity-50"
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
    </form>
  );
}

