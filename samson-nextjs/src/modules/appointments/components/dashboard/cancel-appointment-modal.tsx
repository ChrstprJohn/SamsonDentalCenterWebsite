'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  selectedAppt: AppointmentDto | null;
  cancelReason: string;
  isCancelling: boolean;
  onClose: () => void;
  onReasonChange: (reason: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function CancelAppointmentModal({
  isOpen,
  selectedAppt,
  cancelReason,
  isCancelling,
  onClose,
  onReasonChange,
  onSubmit,
}: CancelAppointmentModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Appointment"
      size="sm"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4 text-sm text-slate-700 dark:text-slate-300 py-1">
        <p className="leading-relaxed">
          Are you sure you want to cancel your <strong>{selectedAppt?.service?.name}</strong> appointment?
        </p>
        <div className="flex flex-col gap-1.5 mt-1">
          <label className="text-xs font-semibold text-slate-500">Provide Cancellation Reason</label>
          <textarea
            required
            value={cancelReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Please let us know why you need to cancel (e.g. scheduling conflict)..."
            rows={3}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
          />
        </div>

        <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-white/5 pt-4 mt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
          <Button type="submit" variant="danger" disabled={isCancelling}>
            {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
