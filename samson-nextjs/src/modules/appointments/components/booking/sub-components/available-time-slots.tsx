import React from 'react';
import type { BookingSlot } from '../../../hooks/booking/use-user-booking';

interface AvailableTimeSlotsProps {
  selectedDate: string | null;
  selectedSlot: BookingSlot | null;
  availableSlots?: BookingSlot[];
  isLoading?: boolean;
  onSelectSlot: (slot: BookingSlot) => void;
}

export function AvailableTimeSlots({
  selectedDate,
  selectedSlot,
  availableSlots = [],
  isLoading = false,
  onSelectSlot,
}: AvailableTimeSlotsProps) {
  if (!selectedDate) {
    return (
      <div className="text-center py-8 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-450 dark:text-slate-500 mt-6 bg-slate-50/30 dark:bg-slate-900/10 w-full">
        Please select a date above to display available times.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-slate-150/60 dark:border-white/5 text-left">
      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Available Time Slots</h4>
      {isLoading ? (
        <div className="text-xs text-slate-400 animate-pulse py-2">Loading available slots...</div>
      ) : availableSlots.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {availableSlots.map((slot) => {
            const isSelected = selectedSlot?.time === slot.time;
            return (
              <button
                key={slot.time + slot.doctorId}
                type="button"
                onClick={() => onSelectSlot(slot)}
                className={`p-3 rounded-xl border text-left transition-all duration-350 cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-slate-350 dark:hover:border-white/20'
                }`}
              >
                <span className="text-xs font-extrabold block">{slot.time}</span>
                <span className="text-[9px] text-slate-450 dark:text-slate-500 block truncate mt-0.5">{slot.doctorName}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
          <span className="text-2xl mb-2 block">📅</span>
          <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Slots Available</h5>
          <p className="text-xs text-slate-505 mt-1 max-w-[250px] mx-auto leading-relaxed">
            All doctors are fully booked on this date. Please select a different day from the calendar above.
          </p>
        </div>
      )}
    </div>
  );
}
