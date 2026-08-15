'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Info, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';

const BOOKING_CHANNEL_MESSAGES: Record<NotificationChannel, string> = {
  NONE: 'No confirmation message or reminders will be sent to the patient.',
  SMS: 'The patient will receive appointment confirmations and reminders via SMS only.',
  EMAIL: 'The patient will receive appointment confirmations and reminders via email only.',
  BOTH: 'The patient will receive appointment confirmations and reminders via both SMS and email.',
};

const CANCELLATION_CHANNEL_MESSAGES: Record<NotificationChannel, string> = {
  NONE: 'No cancellation notification will be sent to the patient.',
  SMS: 'The patient will receive the cancellation notification via SMS only.',
  EMAIL: 'The patient will receive the cancellation notification via email only.',
  BOTH: 'The patient will receive the cancellation notification via both SMS and email.',
};

const RESCHEDULE_CHANNEL_MESSAGES: Record<NotificationChannel, string> = {
  NONE: 'No reschedule notification will be sent to the patient.',
  SMS: 'The patient will receive the reschedule notification via SMS only.',
  EMAIL: 'The patient will receive the reschedule notification via email only.',
  BOTH: 'The patient will receive the reschedule notification via both SMS and email.',
};

const COMPLETION_CHANNEL_MESSAGES: Record<NotificationChannel, string> = {
  NONE: 'No checkout or thank-you-for-your-visit message will be sent to the patient.',
  SMS: 'The patient will receive the checkout thank-you message by SMS only.',
  EMAIL: 'The patient will receive the checkout thank-you message by email only.',
  BOTH: 'The patient will receive the checkout thank-you message by SMS and email.',
};
const NO_SHOW_CHANNEL_MESSAGES: Record<NotificationChannel, string> = {
  NONE: 'No no-show notification or warning will be sent to the patient.',
  SMS: 'A no-show notification will be sent to the patient via SMS.',
  EMAIL: 'A no-show notification will be sent to the patient via email.',
  BOTH: 'A no-show notification will be sent to the patient via SMS and email.',
};

export function NotificationChannelMessage({ channel, purpose = 'booking', className = '' }: { channel: NotificationChannel; purpose?: 'booking' | 'cancellation' | 'reschedule' | 'completion' | 'no-show'; className?: string }) {
  const messages = purpose === 'cancellation' ? CANCELLATION_CHANNEL_MESSAGES : purpose === 'reschedule' ? RESCHEDULE_CHANNEL_MESSAGES : purpose === 'completion' ? COMPLETION_CHANNEL_MESSAGES : purpose === 'no-show' ? NO_SHOW_CHANNEL_MESSAGES : BOOKING_CHANNEL_MESSAGES;
  return <div className={`${className} mt-1 flex items-start gap-2 rounded-lg border p-2 text-xs font-medium leading-relaxed ${channel === 'NONE' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300'}`}>
    {channel === 'NONE' ? <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> : <Info className="mt-0.5 size-3.5 shrink-0" />}
    <span>{messages[channel]}</span>
  </div>;
}

export function NotificationChannelField({
  appointmentId,
  value,
  onChange,
  onEditingChange,
  onSave,
  purpose = 'booking',
}: {
  appointmentId?: string;
  value?: NotificationChannel;
  onChange?: (value: NotificationChannel) => void;
  onEditingChange?: (isEditing: boolean) => void;
  onSave?: (value: NotificationChannel) => Promise<{ success: boolean } | void>;
  purpose?: 'booking' | 'cancellation' | 'reschedule';
}) {
  const current = value || 'EMAIL';
  const [channel, setChannel] = useState<NotificationChannel>(current);
  const [draft, setDraft] = useState<NotificationChannel>(current);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setChannel(current); setDraft(current); setEditing(false); }, [current, appointmentId]);

  const toggleEditing = (isEdit: boolean) => {
    setEditing(isEdit);
    onEditingChange?.(isEdit);
  };

  const save = async () => {
    if (draft === channel) { toggleEditing(false); return; }
    setSaving(true);
    const result = onSave
      ? (await onSave(draft)) ?? { success: true }
      : appointmentId
        ? await updateConfirmationChannelAction({ appointmentId, confirmationChannel: draft })
        : { success: false };
    if (result.success) { setChannel(draft); onChange?.(draft); toggleEditing(false); }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Notification Channel <span className="text-destructive">*</span></span>
          <span className="text-xs text-muted-foreground">Which channel should be used to notify the patient?</span>
        </div>
        {!editing ? (
          <Button type="button" variant="outline" size="sm" onClick={() => toggleEditing(true)} className="h-7 px-2.5 text-xs gap-1 shrink-0">
            <Pencil className="size-3.5" /> Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => { setDraft(channel); toggleEditing(false); }} className="h-7 px-2.5 text-xs gap-1">
              <X className="size-3.5" /> Cancel
            </Button>
            <Button type="button" size="sm" onClick={save} disabled={saving || draft === channel} className="h-7 px-2.5 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              <Check className="size-3.5" /> {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>
      {editing ? (
        <Select value={draft} onChange={(e) => setDraft(e.target.value as NotificationChannel)} className="text-sm w-full" options={[
          { value: 'EMAIL', label: 'Email' }, { value: 'SMS', label: 'SMS' }, { value: 'BOTH', label: 'Email & SMS' }, { value: 'NONE', label: 'None' },
        ]} />
      ) : (
        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
          {channel === 'EMAIL' ? 'Email' : channel === 'SMS' ? 'SMS' : channel === 'BOTH' ? 'Email & SMS' : 'None'}
        </div>
      )}
      <div className={`flex items-start gap-2 rounded-lg border p-2 text-xs font-medium leading-relaxed ${channel === 'NONE' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300'}`}>
        {channel === 'NONE' ? <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> : <Info className="mt-0.5 size-3.5 shrink-0" />}
        <span>{(purpose === 'cancellation' ? CANCELLATION_CHANNEL_MESSAGES : purpose === 'reschedule' ? RESCHEDULE_CHANNEL_MESSAGES : BOOKING_CHANNEL_MESSAGES)[channel]}</span>
      </div>
    </div>
  );
}
