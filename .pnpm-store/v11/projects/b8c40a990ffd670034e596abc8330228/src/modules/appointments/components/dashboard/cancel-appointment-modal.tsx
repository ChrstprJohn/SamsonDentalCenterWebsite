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
  warnExcessiveCancellations?: boolean;
  onClose: () => void;
  onReasonChange: (reason: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function CancelAppointmentModal({
  isOpen,
  selectedAppt,
  cancelReason,
  isCancelling,
  warnExcessiveCancellations,
  onClose,
  onReasonChange,
  onSubmit,
}: CancelAppointmentModalProps) {
  const [selectedOption, setSelectedOption] = React.useState('Scheduling conflict');
  const [customReason, setCustomReason] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedOption('Scheduling conflict');
      setCustomReason('');
      onReasonChange('Scheduling conflict');
    }
  }, [isOpen, onReasonChange]);

  const handleOptionChange = (val: string) => {
    setSelectedOption(val);
    if (val === 'OTHER') {
      onReasonChange(customReason);
    } else {
      onReasonChange(val);
    }
  };

  const handleCustomReasonChange = (val: string) => {
    setCustomReason(val);
    onReasonChange(val);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Appointment"
      size="sm"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4 text-sm text-slate-700 dark:text-slate-300 py-1">
        {warnExcessiveCancellations && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs leading-relaxed flex gap-2">
            <span>⚠️</span>
            <p>
              <strong>Excessive Cancellation Warning</strong>: You have cancelled multiple appointments recently. Repeated cancellations impact your booking reliability and may limit future reservation capabilities.
            </p>
          </div>
        )}
        <p className="leading-relaxed">
          Are you sure you want to cancel your <strong>{selectedAppt?.service?.name}</strong> appointment?
        </p>
        
        <div className="flex flex-col gap-3.5 mt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cancellation Reason</label>
            <select
              value={selectedOption}
              onChange={(e) => handleOptionChange(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white font-medium cursor-pointer"
            >
              <option value="Scheduling conflict">Scheduling conflict</option>
              <option value="Personal / Family emergency">Personal / Family emergency</option>
              <option value="Feeling unwell / Sick">Feeling unwell / Sick</option>
              <option value="OTHER">Other (please specify below)</option>
            </select>
          </div>

          {selectedOption === 'OTHER' && (
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-xs font-semibold text-slate-500">Custom Reason details</label>
              <textarea
                required
                value={customReason}
                onChange={(e) => handleCustomReasonChange(e.target.value)}
                placeholder="Please describe your reason for cancellation..."
                rows={3}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
              />
            </div>
          )}
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
