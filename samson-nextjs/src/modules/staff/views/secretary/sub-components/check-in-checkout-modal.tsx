'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, MessageSquare, Sparkles, X, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';

function getPatientDisplayName(app: any): string {
  if (!app) return 'Patient';
  if (app.dependent) return `${app.dependent.firstName || ''} ${app.dependent.lastName || ''}`.trim() || 'Dependent';
  if (app.guestContact) return `${app.guestContact.firstName || ''} ${app.guestContact.lastName || ''}`.trim() || 'Guest Patient';
  if (app.patient) return `${app.patient.firstName || ''} ${app.patient.lastName || ''}`.trim() || 'Patient';
  return 'Guest Patient';
}

export function CheckInCheckoutModal({ view }: { view: any }) {
  const appointment = view.checkoutAppt;
  const ch = (appointment?.confirmationChannel || appointment?.confirmation_channel) as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE' || 'EMAIL';

  const [channel, setChannel] = useState(ch);
  const [draftChannel, setDraftChannel] = useState(ch);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  useEffect(() => {
    setChannel(ch);
    setDraftChannel(ch);
    setIsEditingChannel(false);
  }, [appointment?.id]);

  if (!appointment) return null;

  const handleSaveChannel = async () => {
    setIsSavingChannel(true);
    const res = await updateConfirmationChannelAction({
      appointmentId: appointment.id,
      confirmationChannel: draftChannel,
    });
    if (res.success) {
      setChannel(draftChannel);
      appointment.confirmationChannel = draftChannel;
      appointment.confirmation_channel = draftChannel;
      setIsEditingChannel(false);
      if (view?.fetchData) view.fetchData();
    }
    setIsSavingChannel(false);
  };

  const handleConfirmCheckout = () => {
    view.handleCheckoutComplete(appointment.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-md shadow-xl flex flex-col gap-5 relative">
        <button
          onClick={() => view.setCheckoutAppt(null)}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-1 text-center items-center">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-xs font-black text-amber-500 uppercase tracking-wider">Patient Checkout</span>
          <h3 className="text-lg font-extrabold text-text-primary">
            Complete Visit for {getPatientDisplayName(appointment)}?
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mt-1">
            Treatment procedure ({appointment.service?.name}) has been rendered.
          </p>
        </div>

        {/* Notification Channel Block */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text-primary">Notification Channel <span className="text-destructive">*</span></span>
              <span className="text-xs text-text-secondary">Which channel should be used to notify the patient?</span>
            </div>
            {!isEditingChannel ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditingChannel(true)} className="h-7 px-2.5 text-xs gap-1">
                <Pencil className="size-3.5" /> Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { setDraftChannel(channel); setIsEditingChannel(false); }} className="h-7 px-2.5 text-xs gap-1">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveChannel} disabled={isSavingChannel || draftChannel === channel} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                  <Check className="size-3.5" /> {isSavingChannel ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          {isEditingChannel ? (
            <Select
              value={draftChannel}
              onChange={(e) => setDraftChannel(e.target.value as any)}
              className="text-sm w-full"
              options={[
                { value: 'EMAIL', label: 'Email' },
                { value: 'SMS', label: 'SMS' },
                { value: 'BOTH', label: 'Email & SMS' },
                { value: 'NONE', label: 'None' },
              ]}
            />
          ) : (
            <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-text-muted border-card-border cursor-default">
              {channel === 'EMAIL' ? 'Email' : channel === 'SMS' ? 'SMS' : channel === 'BOTH' ? 'Email & SMS' : 'None'}
            </div>
          )}
        </div>

        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
            <MessageSquare className="h-4 w-4" />
            <span>Automated Patient Communication</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Clicking <strong>Confirm Checkout</strong> will finalize this visit and automatically send a <strong>Thank You & Post-Care Review Request</strong> message to the patient.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => view.setCheckoutAppt(null)}
            className="text-xs h-9 px-4 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmCheckout}
            disabled={view.isPending || isEditingChannel}
            className="text-xs h-9 px-5 font-bold rounded-xl border-none bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 disabled:opacity-40"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Confirm Checkout & Send Msg</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
