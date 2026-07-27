'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ArchiveConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
  isArchived?: boolean;
}

export function ArchiveConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  isPending,
  isArchived = false,
}: ArchiveConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-card-border max-w-md w-full p-6 rounded-3xl shadow-xl flex flex-col gap-4 text-xs animate-in zoom-in-95 duration-200">
        <div>
          <h4 className="text-sm font-bold text-text-primary">
            {isArchived ? '🔄 Restore Treatment?' : '⚠️ Archive Treatment?'}
          </h4>
          <p className="text-text-secondary leading-relaxed mt-2">
            {isArchived
              ? 'Are you sure you want to restore this treatment? It will become visible in your clinic catalog (as Hidden online until activated).'
              : 'Are you sure you want to archive this treatment? This action will disable the service across all platforms and clinic catalog.'}
          </p>
        </div>

        <div className="flex justify-end items-center gap-2 pt-2 border-t border-card-border">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button variant={isArchived ? 'default' : 'destructive'} size="sm" onClick={onConfirm} disabled={isPending}>
            {isPending ? (isArchived ? 'Restoring...' : 'Archiving...') : (isArchived ? 'Yes, Restore' : 'Yes, Archive')}
          </Button>
        </div>
      </div>
    </div>
  );
}
