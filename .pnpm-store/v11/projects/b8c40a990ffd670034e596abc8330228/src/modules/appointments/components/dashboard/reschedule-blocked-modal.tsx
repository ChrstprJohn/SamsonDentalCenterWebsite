'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface RescheduleBlockedModalProps {
  isOpen: boolean;
  maxReschedules: number;
  onClose: () => void;
}

export function RescheduleBlockedModal({ isOpen, maxReschedules, onClose }: RescheduleBlockedModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rescheduling Blocked"
      size="sm"
    >
      <div className="flex flex-col gap-4 text-sm text-slate-700 dark:text-slate-300 py-1">
        <p className="leading-relaxed">
          You have already reached the online rescheduling limit (<strong>{maxReschedules} time(s)</strong>) for this appointment.
        </p>
        <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs flex flex-col gap-1 mt-1">
          <span className="font-bold text-blue-600 dark:text-blue-400">Please Contact Roster Staff</span>
          <span>Reach out directly to the receptionist to manually reschedule:</span>
          <span className="font-semibold mt-1">📞 (555) 0101</span>
        </div>
        <div className="flex justify-end border-t border-slate-100 dark:border-white/5 pt-4 mt-3">
          <Button onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
}
