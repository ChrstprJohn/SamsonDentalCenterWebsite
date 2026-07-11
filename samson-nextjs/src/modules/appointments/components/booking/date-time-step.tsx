'use client';

import React from 'react';
import type { UserProfileResponseDto } from '@/modules/staff/dtos/exports';
import type { BookingSlot } from '../../hooks/booking/use-user-booking';
import { DoctorPreferenceSelector } from './sub-components/doctor-preference-selector';
import { AvailableTimeSlots } from './sub-components/available-time-slots';

interface DateTimeStepProps {
  selectedDate: string | null;
  timePreference: 'MORNING' | 'AFTERNOON';
  selectedDoctorId: string;
  doctors?: UserProfileResponseDto[];
  availableDates?: string[];
  isLoading?: boolean;
  isLoadingDoctors?: boolean;
  onSelectDate: (date: string) => void;
  onSelectTimePreference: (pref: 'MORNING' | 'AFTERNOON') => void;
  onSelectDoctor: (doctorId: string) => void;
}

export function DateTimeStep({
  selectedDate,
  timePreference,
  selectedDoctorId,
  doctors = [],
  availableDates = [],
  isLoading = false,
  isLoadingDoctors = false,
  onSelectDate,
  onSelectTimePreference,
  onSelectDoctor,
}: DateTimeStepProps) {
  // Create Date objects from available YYYY-MM-DD strings to format them
  const datesToDisplay = availableDates.map((dateStr) => new Date(dateStr));

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  };

  const getDayNum = (date: Date) => {
    return date.getUTCDate();
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Date & Time</h3>
        <p className="text-xs text-slate-500">Pick an available day and convenient timing window.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <DoctorPreferenceSelector
          selectedDoctorId={selectedDoctorId}
          doctors={doctors}
          isLoadingDoctors={isLoadingDoctors}
          onSelectDoctor={onSelectDoctor}
        />

        {/* Right Side: Date Carousel / Custom Calendar Grid */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Select Date</h4>
          {isLoading && !selectedDate && (
            <div className="text-xs text-slate-400 animate-pulse py-2">Checking clinic schedule...</div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {datesToDisplay.length > 0 ? (
              datesToDisplay.map((date, idx) => {
                const dateStr = availableDates[idx];
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => onSelectDate(dateStr)}
                    className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-350 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                      {getDayName(date)}
                    </span>
                    <span className="text-base font-extrabold mt-0.5">{getDayNum(date)}</span>
                  </button>
                );
              })
            ) : (
              !isLoading && (
                <div className="col-span-3 text-xs text-slate-400 dark:text-slate-500 py-6 border border-dashed border-slate-200 dark:border-white/10 w-full text-center rounded-2xl bg-slate-50/50 dark:bg-slate-900/10">
                  No upcoming days with availability.
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Time Preference Toggle Group */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505">Preferred Time of Day</h4>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onSelectTimePreference('MORNING')}
            className={`p-4 rounded-2xl border text-center transition-all duration-350 cursor-pointer flex flex-col items-center justify-center gap-1 hover:scale-[1.01] active:scale-[0.99] ${
              timePreference === 'MORNING'
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold ring-2 ring-blue-500/20 shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-350 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <span className="text-lg">🌅</span>
            <span className="text-xs font-extrabold">Morning</span>
            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">09:00 AM - 12:00 PM</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTimePreference('AFTERNOON')}
            className={`p-4 rounded-2xl border text-center transition-all duration-350 cursor-pointer flex flex-col items-center justify-center gap-1 hover:scale-[1.01] active:scale-[0.99] ${
              timePreference === 'AFTERNOON'
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold ring-2 ring-blue-500/20 shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-350 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <span className="text-lg">☀️</span>
            <span className="text-xs font-extrabold">Afternoon</span>
            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">01:00 PM - 05:00 PM</span>
          </button>
        </div>
      </div>
    </div>
  );
}
