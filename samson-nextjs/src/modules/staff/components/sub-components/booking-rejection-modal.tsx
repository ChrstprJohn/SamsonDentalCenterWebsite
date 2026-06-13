import React from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface BookingRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  rejectReason: string;
  setRejectReason: (value: string) => void;
  handleRejectSubmit: (e: React.FormEvent) => void;
}

export function BookingRejectionModal({
  isOpen,
  onClose,
  patientName,
  rejectReason,
  setRejectReason,
  handleRejectSubmit,
}: BookingRejectionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Booking Request" size="sm">
      <form onSubmit={handleRejectSubmit} className="flex flex-col gap-4 text-sm text-text-secondary py-1">
        <p className="leading-relaxed">
          Specify the mandatory rejection reason for: <strong>{patientName || 'this patient'}</strong>?
        </p>
        <div className="flex flex-col gap-1.5 mt-1">
          <label className="text-xs font-semibold text-text-secondary">Mandatory Reason Details</label>
          <textarea
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason (e.g. clinic fully booked, conflicting treatment plan)..."
            rows={3}
            className="px-3 py-2 rounded-lg border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
          />
        </div>

        <div className="flex gap-3 justify-end border-t border-card-border pt-4 mt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={!rejectReason}>
            Confirm Rejection
          </Button>
        </div>
      </form>
    </Modal>
  );
}
