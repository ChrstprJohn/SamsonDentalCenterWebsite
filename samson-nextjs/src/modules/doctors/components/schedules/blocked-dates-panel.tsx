'use client';

import React, { useState } from 'react';
import { useBlockedDateForm, BlockedDateFormValues } from '../../hooks/schedules/use-blocked-date-form';
import { createTimeBlockAction } from '@/modules/clinic-config/actions/schedules/create-time-block.action';
import { revokeTimeBlockAction } from '@/modules/clinic-config/actions/schedules/revoke-time-block.action';
import { Button } from '@/components/ui/button';
import { formatShortDate } from '@/shared/utils/date.util';

export interface BlockedDateItem {
  id: string;
  doctorId: string | null;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

interface BlockedDatesPanelProps {
  initialTimeBlocks: BlockedDateItem[];
}

export function BlockedDatesPanel({ initialTimeBlocks }: BlockedDatesPanelProps) {
  const [timeBlocks, setTimeBlocks] = useState<BlockedDateItem[]>(initialTimeBlocks);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const onSubmit = async (values: BlockedDateFormValues) => {
    setMessage(null);
    try {
      const res = await createTimeBlockAction({
        doctorId: null,
        date: values.date,
        startTime: '00:00',
        endTime: '23:59',
        reason: values.reason,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      const newBlock: BlockedDateItem = {
        id: res.data.id,
        doctorId: null,
        doctorName: 'Clinic-wide',
        date: values.date,
        startTime: '00:00',
        endTime: '23:59',
        reason: values.reason,
      };

      setTimeBlocks((prev) => [newBlock, ...prev]);
      setMessage({ type: 'success', text: 'Blocked date added successfully!' });
      reset();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to add blocked date' });
    }
  };

  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    reset,
  } = useBlockedDateForm({
    onSubmit,
  });

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this blocked date?')) {
      return;
    }
    try {
      const res = await revokeTimeBlockAction(id);
      if (!res.success) {
        throw new Error(res.error);
      }
      setTimeBlocks((prev) => prev.filter((tb) => tb.id !== id));
      setMessage({ type: 'success', text: 'Blocked date removed!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to remove blocked date' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Add Blocked Date */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 flex flex-col gap-4"
      >
        <div>
          <h3 className="font-bold text-foreground text-sm">Add Blocked Date</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Booking is closed for the entire date (e.g. holidays, closures, unavailable days).
          </p>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Date</label>
          <input
            type="date"
            {...register('date')}
            className="w-full bg-card border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
          />
          {errors.date && <p className="text-[11px] font-semibold text-red-500 mt-1">{errors.date.message}</p>}
        </div>

        {/* Reason Textfield */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Reason / Note</label>
          <textarea
            {...register('reason')}
            placeholder="e.g. Christmas Holiday, Dental Seminar, Clinic Closure..."
            rows={2}
            className="w-full bg-card border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-ring resize-none"
          />
          {errors.reason && <p className="text-[11px] font-semibold text-red-500 mt-1">{errors.reason.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-9 text-xs mt-1 bg-[#1D1E1E] text-white hover:bg-[#1D1E1E]/90"
        >
          {isSubmitting ? 'Adding...' : 'Add Blocked Date'}
        </Button>
      </form>

      {/* Right Column: Blocked Dates List */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-3">
          <div>
            <h3 className="font-bold text-foreground text-sm">Blocked Dates</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Dates when bookings will be unavailable.</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {timeBlocks.length} {timeBlocks.length === 1 ? 'date' : 'dates'}
          </span>
        </div>

        {message && message.type === 'success' && (
          <div className="p-3 rounded-xl text-xs font-medium border bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            {message.text}
          </div>
        )}
        {message && message.type === 'error' && (
          <div className="p-3 rounded-xl text-xs font-medium border bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400">
            {message.text}
          </div>
        )}

        <div className="flex flex-col divide-y divide-border max-h-[420px] overflow-y-auto pr-1">
          {timeBlocks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-10">No blocked dates scheduled.</p>
          ) : (
            timeBlocks.map((tb) => (
              <div key={tb.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center gap-4 hover:bg-muted/20 rounded-lg px-2 transition-colors">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-xs">
                      {formatShortDate(tb.date + 'T00:00:00')}
                    </span>
                    <span className="text-[10px] text-muted-foreground rounded bg-muted px-1.5 py-0.5">
                      {tb.doctorName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium truncate">🏷️ {tb.reason}</p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(tb.id)}
                  className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 shrink-0"
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
