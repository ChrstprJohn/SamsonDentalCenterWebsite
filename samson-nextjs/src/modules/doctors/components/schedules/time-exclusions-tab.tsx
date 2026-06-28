'use client';

import React, { useState } from 'react';
import { useTimeBlockForm, TimeBlockFormValues } from '../../hooks/schedules/use-time-block-form';
import { createTimeBlockAction } from '@/modules/clinic-config/actions/schedules/create-time-block.action';
import { revokeTimeBlockAction } from '@/modules/clinic-config/actions/schedules/revoke-time-block.action';
import { DoctorListItem, TimeBlockItem } from '../../views/schedule-view';

interface TimeExclusionsTabProps {
  doctors: DoctorListItem[];
  initialTimeBlocks: TimeBlockItem[];
}

export function TimeExclusionsTab({ doctors, initialTimeBlocks }: TimeExclusionsTabProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlockItem[]>(initialTimeBlocks);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const onSubmit = async (values: TimeBlockFormValues) => {
    setMessage(null);
    try {
      const res = await createTimeBlockAction({
        doctorId: values.scope === 'DOCTOR' ? values.doctorId : null,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        reason: values.reason,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      // Proactively refresh the list locally
      const doctorObj = doctors.find((d) => d.id === values.doctorId);
      const newBlock: TimeBlockItem = {
        id: Math.random().toString(), // fallback temporary key
        doctorId: values.scope === 'DOCTOR' ? values.doctorId : null,
        doctorName: values.scope === 'DOCTOR' && doctorObj ? doctorObj.name : '🏥 Clinic-wide',
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        reason: values.reason,
        createdBy: 'Secretary',
      };
      
      setTimeBlocks((prev) => [newBlock, ...prev]);
      setMessage({ type: 'success', text: 'Schedule exception created successfully!' });
      reset();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to create exception' });
    }
  };

  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    watch,
    handleAllDayChange,
    handleScopeChange,
    reset,
  } = useTimeBlockForm({
    onSubmit,
  });

  const scope = watch('scope');
  const isAllDay = watch('isAllDay');

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this schedule block exception?')) {
      return;
    }
    try {
      const res = await revokeTimeBlockAction(id);
      if (!res.success) {
        throw new Error(res.error);
      }
      setTimeBlocks((prev) => prev.filter((tb) => tb.id !== id));
      setMessage({ type: 'success', text: 'Schedule block exception revoked!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to revoke block' });
    }
  };

  const filteredBlocks = timeBlocks.filter(
    (tb) =>
      tb.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tb.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Creator Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 bg-card-bg border border-card-border/60 rounded-xl p-5 shadow-sm flex flex-col gap-4"
      >
        <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider">🚫 Add Schedule Block</h3>
        <hr className="border-card-border/40" />

        {/* Scope Radio Buttons */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2">Scope</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-sm text-text-primary cursor-pointer">
              <input
                type="radio"
                name="scope"
                checked={scope === 'CLINIC'}
                onChange={() => handleScopeChange('CLINIC')}
                className="accent-primary"
              />
              🏥 Clinic-wide
            </label>
            <label className="flex items-center gap-1.5 text-sm text-text-primary cursor-pointer">
              <input
                type="radio"
                name="scope"
                checked={scope === 'DOCTOR'}
                onChange={() => handleScopeChange('DOCTOR')}
                className="accent-primary"
              />
              👨‍⚕️ Specific Doctor
            </label>
          </div>
        </div>

        {/* Doctor Dropdown Selector */}
        {scope === 'DOCTOR' && (
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Select Doctor</label>
            <select
              {...register('doctorId')}
              className="w-full bg-input-bg border border-input-border/70 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="">-- Choose Dentist --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
            {errors.doctorId && (
              <p className="text-xs text-error mt-1">{errors.doctorId.message}</p>
            )}
          </div>
        )}

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

        {/* Time Period Option */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2">Time Period</label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-1.5 text-sm text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => handleAllDayChange(e.target.checked)}
                className="accent-primary"
              />
              Block Entire Day
            </label>

            {!isAllDay && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="time"
                  {...register('startTime')}
                  className="bg-input-bg border border-input-border/70 rounded-lg px-2.5 py-1 text-sm text-text-primary focus:outline-none"
                />
                <span className="text-text-muted text-xs">to</span>
                <input
                  type="time"
                  {...register('endTime')}
                  className="bg-input-bg border border-input-border/70 rounded-lg px-2.5 py-1 text-sm text-text-primary focus:outline-none"
                />
              </div>
            )}
            {errors.endTime && <p className="text-xs text-error mt-1">{errors.endTime.message}</p>}
          </div>
        </div>

        {/* Reason Textfield */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5">Reason / Note</label>
          <textarea
            {...register('reason')}
            placeholder="e.g. Christmas Holiday, Dental Seminar, Vacation..."
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
          {isSubmitting ? 'Creating Exception...' : '➕ Create Exception'}
        </button>
      </form>

      {/* Right Column: Active Exceptions list */}
      <div className="lg:col-span-7 bg-card-bg border border-card-border/60 rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-card-border/40 pb-4">
          <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider">📋 Active Exclusions & Vacations</h3>
          <input
            type="text"
            placeholder="🔍 Filter exclusions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-input-bg border border-input-border/70 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        {message && message.type === 'success' && (
          <div className="p-2.5 rounded-lg text-xs font-medium border bg-success-bg/10 border-success/30 text-success">
            {message.text}
          </div>
        )}

        <div className="flex flex-col divide-y divide-card-border/30 max-h-[500px] overflow-y-auto pr-1">
          {filteredBlocks.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-8">No active schedule block exceptions found.</p>
          ) : (
            filteredBlocks.map((tb) => (
              <div key={tb.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center gap-4 hover:bg-card-hover/10 rounded px-1 transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm">
                      {tb.doctorName}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      by {tb.createdBy}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted">
                    📅 {tb.date} ({tb.startTime} - {tb.endTime})
                  </div>
                  <p className="text-xs text-text-primary font-medium mt-0.5">🏷️ {tb.reason}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRevoke(tb.id)}
                  className="px-2.5 py-1.5 bg-error-bg/10 text-error hover:bg-error-bg/20 text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                >
                  Revoke Block
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
