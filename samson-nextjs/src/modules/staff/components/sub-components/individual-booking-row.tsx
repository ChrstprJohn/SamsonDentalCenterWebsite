import React from 'react';
import { Button } from '@/components/ui/button';
import type { PendingBooking } from '../../hooks/use-secretary-dashboard';

interface IndividualBookingRowProps {
  pb: PendingBooking;
  selectedPendingIds: string[];
  handlePendingSelect: (id: string) => void;
  setActivePending: (pb: PendingBooking | null) => void;
  setIsApproveOpen: (open: boolean) => void;
  setIsRejectOpen: (open: boolean) => void;
}

export function IndividualBookingRow({
  pb,
  selectedPendingIds,
  handlePendingSelect,
  setActivePending,
  setIsApproveOpen,
  setIsRejectOpen,
}: IndividualBookingRowProps) {
  return (
    <div className="p-4 rounded-2xl border border-card-border bg-card flex items-center justify-between text-xs hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selectedPendingIds.includes(pb.id)}
          onChange={() => handlePendingSelect(pb.id)}
        />
        <div className="flex flex-col">
          <span className="font-bold text-text-primary">{pb.patientName}</span>
          <span className="text-[10px] text-text-muted mt-0.5">{pb.serviceName}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold text-text-secondary">📅 {pb.date} at {pb.time}</span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="px-2.5 py-1 text-[10px]"
            onClick={() => {
              setActivePending(pb);
              setIsRejectOpen(true);
            }}
          >
            Reject
          </Button>
          <Button
            className="px-2.5 py-1 text-[10px]"
            onClick={() => {
              setActivePending(pb);
              setIsApproveOpen(true);
            }}
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
