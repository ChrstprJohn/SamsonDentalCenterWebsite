import React from 'react';
import { Button } from '@/components/ui/button';
import type { PendingBooking } from '../../hooks/use-secretary-dashboard';

interface FamilyGroupRowProps {
  famId: string;
  members: PendingBooking[];
  selectedPendingIds: string[];
  handlePendingSelect: (id: string) => void;
  setActivePending: (pb: PendingBooking | null) => void;
  setIsApproveOpen: (open: boolean) => void;
  setIsRejectOpen: (open: boolean) => void;
}

export function FamilyGroupRow({
  famId,
  members,
  selectedPendingIds,
  handlePendingSelect,
  setActivePending,
  setIsApproveOpen,
  setIsRejectOpen,
}: FamilyGroupRowProps) {
  return (
    <div className="p-5 rounded-3xl border border-card-border bg-accent-blue-bg/40 backdrop-blur-md flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-card-border pb-3">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-primary-start uppercase tracking-wider">Family Group Batched Row</span>
          <span className="text-[10px] text-text-muted mt-0.5">Members scheduled on same date Unit</span>
        </div>
        <Button
          size="sm"
          onClick={() => {
            members.forEach((m) => {
              if (!selectedPendingIds.includes(m.id)) {
                handlePendingSelect(m.id);
              }
            });
            setActivePending(null);
            setIsApproveOpen(true);
          }}
        >
          Approve Group
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {members.map((pb) => (
          <div key={pb.id} className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-card-border text-xs justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedPendingIds.includes(pb.id)}
                onChange={() => handlePendingSelect(pb.id)}
              />
              <div className="flex flex-col">
                <span className="font-bold text-text-primary">
                  {pb.patientName} ({pb.relationship})
                </span>
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
        ))}
      </div>
    </div>
  );
}
