'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ArchiveConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function ArchiveConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  isPending,
}: ArchiveConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-card-border max-w-md w-full p-6 rounded-3xl shadow-xl flex flex-col gap-4 text-xs animate-in zoom-in-95 duration-200">
        <div>
          <h4 className="text-sm font-bold text-text-primary">⚠️ Archive Treatment?</h4>
          <p className="text-text-secondary leading-relaxed mt-2">
            Are you sure you want to archive this treatment? This action will hide the service from patient online bookings. Pending appointments under this treatment will remain active but new bookings will be blocked.
          </p>
        </div>

        <div className="flex justify-end items-center gap-2 pt-2 border-t border-card-border">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Archiving...' : 'Yes, Archive'}
          </Button>
        </div>
      </div>
    </div>
  );
}
