'use client';

import React, { useState } from 'react';
import { useDoctorShiftsForm, ShiftState } from '../../hooks/schedules/use-doctor-shifts-form';
import { DoctorListItem, ClinicConfigItem, DoctorScheduleItem } from '../../views/schedule-view';

const WEEK_DAYS = [
  { day: 0, label: 'Sunday' },
  { day: 1, label: 'Monday' },
  { day: 2, label: 'Tuesday' },
  { day: 3, label: 'Wednesday' },
  { day: 4, label: 'Thursday' },
  { day: 5, label: 'Friday' },
  { day: 6, label: 'Saturday' },
];

interface DoctorWeeklyShiftsTabProps {
  doctors: DoctorListItem[];
  clinicConfig: ClinicConfigItem;
  initialSchedules: DoctorScheduleItem[];
}

export function DoctorWeeklyShiftsTab({ doctors, clinicConfig, initialSchedules }: DoctorWeeklyShiftsTabProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const DAYS_MAP: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  // Get schedules for selected doctor
  const doctorSchedules = WEEK_DAYS.map(({ day }) => {
    const sched = initialSchedules.find((s) => s.doctorId === selectedDoctorId && s.dayOfWeek === day);
    const dayName = DAYS_MAP[day];
    const baseline = clinicConfig.operatingHours[dayName] || {};
    const useBaseline = !sched || !sched.isCustom;

    return {
      dayOfWeek: day,
      isOpen: useBaseline ? (baseline.isOpen ?? false) : sched.isOpen,
      startTime: useBaseline ? (baseline.openTime || '08:00') : (sched.startTime || '08:00'),
      endTime: useBaseline ? (baseline.closeTime || '17:00') : (sched.endTime || '17:00'),
      breakStartTime: useBaseline ? (baseline.breakStartTime || '12:00') : (sched.breakStartTime || '12:00'),
      breakEndTime: useBaseline ? (baseline.breakEndTime || '13:00') : (sched.breakEndTime || '13:00'),
      isCustom: sched ? sched.isCustom : false,
    };
  });

  const {
    shifts,
    isSubmitting,
    error,
    updateShiftField,
    handleRevert,
    handleClone,
    handleSave,
  } = useDoctorShiftsForm({
    doctorId: selectedDoctorId,
    initialShifts: doctorSchedules,
    onSuccess: () => {
      alert('Schedules saved successfully!');
    },
  });

  const [editStates, setEditStates] = useState<Record<number, boolean>>({});

  const toggleEditMode = (day: number) => {
    setEditStates((prev) => ({ ...prev, [day]: !prev[day] }));
    if (!editStates[day]) {
      // Mark as custom when starting to edit
      updateShiftField(day, 'isCustom', true);
    }
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Doctor Search Selector */}
      <div className="bg-card-bg border border-card-border/60 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Select Doctor</label>
          <div className="flex gap-2">
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setEditStates({});
              }}
              className="bg-input-bg border border-input-border/70 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary flex-1 min-w-[200px]"
            >
              {filteredDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="🔍 Search doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input-bg border border-input-border/70 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-xs font-medium border bg-error-bg/10 border-error/30 text-error">
          {error}
        </div>
      )}

      {/* Roster day cards */}
      <div className="flex flex-col gap-4">
        {WEEK_DAYS.map(({ day, label }) => {
          const shift = shifts.find((s) => s.dayOfWeek === day);
          if (!shift) return null;

          const isEditing = editStates[day];

          return (
            <div
              key={day}
              className={`bg-card-bg border rounded-xl p-5 shadow-sm transition-all duration-200 ${
                shift.isCustom
                  ? 'border-primary/45 shadow-primary/5 bg-primary/5'
                  : 'border-card-border/60'
              }`}
            >
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm uppercase tracking-wide">{label}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        shift.isCustom
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-card-hover text-text-muted border border-card-border/50'
                      }`}
                    >
                      {shift.isCustom ? '⭐ Custom Override' : '🟢 Inheriting Baseline'}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mt-1.5">
                    {shift.isOpen ? (
                      <span>
                        Hours: <span className="font-medium text-text-primary">{shift.startTime} - {shift.endTime}</span>
                        {shift.breakStartTime && (
                          <span className="ml-3 border-l border-card-border/60 pl-3">
                            Lunch: <span className="font-medium text-text-primary">{shift.breakStartTime} - {shift.breakEndTime}</span>
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-error font-medium">CLOSED</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleEditMode(day)}
                        className="px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary-hover text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleEditMode(day)}
                        className="px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary-hover text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                      >
                        ✏️ Edit Custom
                      </button>
                      {shift.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleRevert(day)}
                          className="px-3 py-1.5 bg-error-bg/10 text-error hover:bg-error-bg/20 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                        >
                          ↩️ Revert
                        </button>
                      )}
                    </>
                  )}

                  {/* Bulk clone action */}
                  <select
                    onChange={(e) => {
                      const mode = e.target.value;
                      if (mode === 'all') {
                        handleClone(day, WEEK_DAYS.map((w) => w.day).filter((d) => d !== day));
                      } else if (mode === 'weekdays') {
                        handleClone(day, [1, 2, 3, 4, 5].filter((d) => d !== day));
                      }
                      e.target.value = '';
                    }}
                    className="bg-input-bg border border-input-border/70 rounded-lg px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="">📋 Clone Schedule...</option>
                    <option value="all">Clone to All Days</option>
                    <option value="weekdays">Clone to Weekdays</option>
                  </select>
                </div>
              </div>

              {/* Editing Form controls */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-card-border/40 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Status</label>
                    <button
                      type="button"
                      onClick={() => updateShiftField(day, 'isOpen', !shift.isOpen)}
                      className={`w-full py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        shift.isOpen
                          ? 'bg-success-bg/10 border-success/30 text-success'
                          : 'bg-error-bg/10 border-error/30 text-error'
                      }`}
                    >
                      {shift.isOpen ? 'OPEN' : 'CLOSED'}
                    </button>
                  </div>

                  {shift.isOpen && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-text-muted mb-1">Work Hours</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={shift.startTime || '08:00'}
                            onChange={(e) => updateShiftField(day, 'startTime', e.target.value)}
                            className="bg-input-bg border border-input-border/70 rounded px-2 py-1 text-xs text-text-primary focus:outline-none"
                          />
                          <span className="text-text-muted text-xs">to</span>
                          <input
                            type="time"
                            value={shift.endTime || '17:00'}
                            onChange={(e) => updateShiftField(day, 'endTime', e.target.value)}
                            className="bg-input-bg border border-input-border/70 rounded px-2 py-1 text-xs text-text-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-muted mb-1">Lunch Break</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={shift.breakStartTime || ''}
                            onChange={(e) => updateShiftField(day, 'breakStartTime', e.target.value)}
                            className="bg-input-bg border border-input-border/70 rounded px-2 py-1 text-xs text-text-primary focus:outline-none"
                          />
                          <span className="text-text-muted text-xs">to</span>
                          <input
                            type="time"
                            value={shift.breakEndTime || ''}
                            onChange={(e) => updateShiftField(day, 'breakEndTime', e.target.value)}
                            className="bg-input-bg border border-input-border/70 rounded px-2 py-1 text-xs text-text-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-card-border/40">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSave}
          className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-hover font-semibold rounded-xl text-sm cursor-pointer disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving Weekly Roster...' : 'Save Weekly Roster'}
        </button>
      </div>
    </div>
  );
}
