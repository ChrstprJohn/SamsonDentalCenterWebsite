import React from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface BookingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  approveReason: string;
  setApproveReason: (value: string) => void;
  handleApproveSubmit: (e: React.FormEvent) => void;
}

export function BookingApprovalModal({
  isOpen,
  onClose,
  approveReason,
  setApproveReason,
  handleApproveSubmit,
}: BookingApprovalModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Booking Request" size="sm">
      <form onSubmit={handleApproveSubmit} className="flex flex-col gap-4 text-sm text-text-secondary py-1">
        <p className="leading-relaxed">
          Confirm administrative approval for the selected appointment(s)?
        </p>
        <div className="flex flex-col gap-1.5 mt-1">
          <label className="text-xs font-semibold text-text-secondary">Pick Approval Reason</label>
          <select
            value={approveReason}
            onChange={(e) => setApproveReason(e.target.value)}
            className="px-3 py-2 rounded-lg border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
          >
            <option value="Roster schedule cleared">Roster schedule cleared</option>
            <option value="Treatment room available">Treatment room available</option>
            <option value="Staff slots balanced">Staff slots balanced</option>
            <option value="Family batched reservation finalized">Family batched reservation finalized</option>
          </select>
        </div>

        <div className="flex gap-3 justify-end border-t border-card-border pt-4 mt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Finalize Approval</Button>
        </div>
      </form>
    </Modal>
  );
}
