'use client';

import { CheckCircle2, MessageSquare, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CheckInCheckoutModal({ view }: { view: any }) {
  const appointment = view.checkoutAppt;

  if (!appointment) return null;

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
            Complete Visit for {appointment.patient?.firstName} {appointment.patient?.lastName}?
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mt-1">
            Treatment procedure ({appointment.service?.name}) has been rendered.
          </p>
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
            disabled={view.isPending}
            className="text-xs h-9 px-5 font-bold rounded-xl border-none bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Confirm Checkout & Send Msg</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
