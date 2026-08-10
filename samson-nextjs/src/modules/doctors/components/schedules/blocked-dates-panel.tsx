'use client';

import React, { useState } from 'react';
import { useBlockedDateForm, BlockedDateFormValues } from '../../hooks/schedules/use-blocked-date-form';
import { createTimeBlockAction } from '@/modules/clinic-config/actions/schedules/create-time-block.action';
import { revokeTimeBlockAction } from '@/modules/clinic-config/actions/schedules/revoke-time-block.action';

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Add Blocked Date */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 bg-card-bg border border-card-border/60 rounded-xl p-5 shadow-sm flex flex-col gap-4"
      >
        <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Add Blocked Date</h3>
        <hr className="border-card-border/40" />
        <p className="text-xs text-text-muted">
          Booking is closed for the entire date (e.g. holidays, closures, unavailable days).
        </p>

        {/* Date Picker */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5">Date</label>
          <input
            type="date"
            {...register('date')}
            className="w-full bg-input-bg border border-input-border/70 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
          />
          {errors.date && <p className="text-xs text-error mt-1">{errors.date.message}</p>}
        </div>

        {/* Reason Textfield */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5">Reason / Note</label>
          <textarea
            {...register('reason')}
            placeholder="e.g. Christmas Holiday, Dental Seminar, Clinic Closure..."
            rows={2}
            className="w-full bg-input-bg border border-input-border/70 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
          />
          {errors.reason && <p className="text-xs text-error mt-1">{errors.reason.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 bg-primary text-primary-foreground hover:bg-primary-hover font-semibold rounded-xl text-sm cursor-pointer disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add Blocked Date'}
        </button>
      </form>

      {/* Right Column: Blocked Dates List */}
      <div className="lg:col-span-7 bg-card-bg border border-card-border/60 rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-card-border/40 pb-4">
          <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Blocked Dates</h3>
        </div>

        {message && message.type === 'success' && (
          <div className="p-2.5 rounded-lg text-xs font-medium border bg-success-bg/10 border-success/30 text-success">
            {message.text}
          </div>
        )}
        {message && message.type === 'error' && (
          <div className="p-2.5 rounded-lg text-xs font-medium border bg-error-bg/10 border-error/30 text-error">
            {message.text}
          </div>
        )}

        <div className="flex flex-col divide-y divide-card-border/30 max-h-[500px] overflow-y-auto pr-1">
          {timeBlocks.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-8">No blocked dates yet.</p>
          ) : (
            timeBlocks.map((tb) => (
              <div key={tb.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center gap-4 hover:bg-card-hover/10 rounded px-1 transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm">
                      {tb.date}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {tb.doctorName}
                    </span>
                  </div>
                  <p className="text-xs text-text-primary font-medium">🏷️ {tb.reason}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRevoke(tb.id)}
                  className="px-2.5 py-1.5 bg-error-bg/10 text-error hover:bg-error-bg/20 text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
