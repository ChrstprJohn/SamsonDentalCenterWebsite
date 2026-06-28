'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PendingBooking } from '../../hooks/use-secretary-dashboard';
import { FamilyGroupRow } from './family-group-row';
import { IndividualBookingRow } from './individual-booking-row';

interface PendingBookingQueueProps {
  pendingQueue: PendingBooking[];
  selectedPendingIds: string[];
  setSelectedPendingIds: React.Dispatch<React.SetStateAction<string[]>>;
  setIsApproveOpen: (open: boolean) => void;
  setActivePending: (pb: PendingBooking | null) => void;
  setIsRejectOpen: (open: boolean) => void;
  handlePendingSelect: (id: string) => void;
}

export function PendingBookingQueue({
  pendingQueue,
  selectedPendingIds,
  setIsApproveOpen,
  setActivePending,
  setIsRejectOpen,
  handlePendingSelect,
}: PendingBookingQueueProps) {
  // Group pending queue by familyGroupId
  const familyGroups: Record<string, PendingBooking[]> = {};
  const individuals: PendingBooking[] = [];

  pendingQueue.forEach((pb) => {
    if (pb.familyGroupId) {
      if (!familyGroups[pb.familyGroupId]) {
        familyGroups[pb.familyGroupId] = [];
      }
      familyGroups[pb.familyGroupId].push(pb);
    } else {
      individuals.push(pb);
    }
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-center text-left">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Pending Booking Queue</h3>
        {selectedPendingIds.length > 0 && (
          <Button size="sm" onClick={() => setIsApproveOpen(true)}>
            Approve Batched ({selectedPendingIds.length})
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6 text-left">
        {/* Render Family Group Containers */}
        {Object.entries(familyGroups).map(([famId, members]) => (
          <FamilyGroupRow
            key={famId}
            famId={famId}
            members={members}
            selectedPendingIds={selectedPendingIds}
            handlePendingSelect={handlePendingSelect}
            setActivePending={setActivePending}
            setIsApproveOpen={setIsApproveOpen}
            setIsRejectOpen={setIsRejectOpen}
          />
        ))}

        {/* Render Individual Bookings */}
        {individuals.map((pb) => (
          <IndividualBookingRow
            key={pb.id}
            pb={pb}
            selectedPendingIds={selectedPendingIds}
            handlePendingSelect={handlePendingSelect}
            setActivePending={setActivePending}
            setIsApproveOpen={setIsApproveOpen}
            setIsRejectOpen={setIsRejectOpen}
          />
        ))}

        {pendingQueue.length === 0 && (
          <div className="text-center py-10 border border-dashed border-card-border rounded-3xl text-sm text-text-muted">
            No pending booking requests awaiting review.
          </div>
        )}
      </div>
    </section>
  );
}
