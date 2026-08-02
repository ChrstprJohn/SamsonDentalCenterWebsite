'use client';

import { useEffect, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';

export function NotificationChannelField({
  appointmentId,
  value,
  onChange,
}: {
  appointmentId: string;
  value?: NotificationChannel;
  onChange?: (value: NotificationChannel) => void;
}) {
  const current = value || 'EMAIL';
  const [channel, setChannel] = useState<NotificationChannel>(current);
  const [draft, setDraft] = useState<NotificationChannel>(current);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setChannel(current); setDraft(current); setEditing(false); }, [current, appointmentId]);

  const save = async () => {
    if (draft === channel) { setEditing(false); return; }
    setSaving(true);
    const result = await updateConfirmationChannelAction({ appointmentId, confirmationChannel: draft });
    if (result.success) { setChannel(draft); onChange?.(draft); setEditing(false); }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-medium text-foreground">Notification Channel <span className="text-destructive">*</span></span>
          <span className="text-xs text-muted-foreground">Which channel should be used to notify the patient?</span>
        </div>
        {!editing ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)} className="h-7 px-2.5 text-xs gap-1 shrink-0">
            <Pencil className="size-3.5" /> Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => { setDraft(channel); setEditing(false); }} className="h-7 px-2.5 text-xs gap-1">
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
    </div>
  );
}
