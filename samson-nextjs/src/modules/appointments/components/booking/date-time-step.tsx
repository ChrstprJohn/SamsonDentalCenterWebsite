'use client';

import React from 'react';
import type { BookingSlot } from '../../hooks/booking/use-user-booking';

interface DateTimeStepProps {
  selectedDate: string | null;
  selectedSlot: BookingSlot | null;
  availableSlots?: BookingSlot[];
  slotHoldRemaining: number;
  isSlotHoldActive: boolean;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: BookingSlot) => void;
}

const MOCK_SLOTS: BookingSlot[] = [
  { time: '09:00 AM', doctorId: 'd-1', doctorName: 'Dr. Sarah Samson' },
  { time: '10:30 AM', doctorId: 'd-1', doctorName: 'Dr. Sarah Samson' },
  { time: '01:00 PM', doctorId: 'd-2', doctorName: 'Dr. James Mercer', isPreferred: true },
  { time: '02:30 PM', doctorId: 'd-2', doctorName: 'Dr. James Mercer' },
  { time: '04:00 PM', doctorId: 'd-1', doctorName: 'Dr. Sarah Samson' },
];

export function DateTimeStep({
  selectedDate,
  selectedSlot,
  availableSlots,
  slotHoldRemaining,
  isSlotHoldActive,
  onSelectDate,
  onSelectSlot,
}: DateTimeStepProps) {
  const slotsToDisplay = availableSlots || MOCK_SLOTS;
  // Get next 7 days for scheduling
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start tomorrow
    return d;
  });

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNum = (date: Date) => {
    return date.getDate();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Date & Time</h3>
        <p className="text-xs text-slate-500">Pick an available day and convenient timing slot.</p>
      </div>

      {/* Date Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {dates.map((date) => {
          const dateStr = formatDate(date);
          const isSelected = selectedDate === dateStr;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`flex-shrink-0 w-16 h-20 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/30 text-slate-700 dark:text-slate-350 hover:border-slate-350'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider mb-1">{getDayName(date)}</span>
              <span className="text-lg font-extrabold">{getDayNum(date)}</span>
            </button>
          );
        })}
      </div>

      {/* Time Slots & Holds */}
      {selectedDate ? (
        <div className="flex flex-col gap-4 mt-2">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Available Time Slots</h4>
          {slotsToDisplay.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slotsToDisplay.map((slot) => {
                const isSelected = selectedSlot?.time === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/30 text-slate-700 dark:text-slate-350 hover:border-slate-350'
                    }`}
                  >
                    <span className="text-xs font-extrabold block">{slot.time}</span>
                    <span className="text-[9px] text-slate-400 block truncate mt-0.5">{slot.doctorName}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 px-4 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
              <span className="text-2xl mb-2 block">📅</span>
              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Slots Available</h5>
              <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto">
                All doctors are fully booked on this date. Please select a different day from the calendar above.
              </p>
            </div>
          )}

          {/* Real-time hold countdown */}
          {isSlotHoldActive && selectedSlot && (
            <div className="mt-6 p-4 rounded-2xl border border-amber-200/60 bg-amber-500/5 backdrop-blur-md flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-xl">⏳</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-450">Temporary Slot Reservation</span>
                  <span className="text-[10px] text-slate-500">Hold expires automatically on timeout.</span>
                </div>
              </div>
              <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-amber-500/20 border-t-amber-500 flex-shrink-0">
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                  {formatTimer(slotHoldRemaining)}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-xs text-slate-400 mt-2">
          Please select a date above to display available times.
        </div>
      )}
    </div>
  );
}
