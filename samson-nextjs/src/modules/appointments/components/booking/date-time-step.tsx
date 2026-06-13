'use client';

import React from 'react';
import type { UserProfileResponseDto } from '@/modules/staff/dtos';
import type { BookingSlot } from '../../hooks/booking/use-user-booking';

interface DateTimeStepProps {
  selectedDate: string | null;
  selectedSlot: BookingSlot | null;
  selectedDoctorId: string;
  doctors?: UserProfileResponseDto[];
  availableDates?: string[];
  availableSlots?: BookingSlot[];
  isLoading?: boolean;
  isLoadingDoctors?: boolean;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: BookingSlot) => void;
  onSelectDoctor: (doctorId: string) => void;
}

export function DateTimeStep({
  selectedDate,
  selectedSlot,
  selectedDoctorId,
  doctors = [],
  availableDates = [],
  availableSlots = [],
  isLoading = false,
  isLoadingDoctors = false,
  onSelectDate,
  onSelectSlot,
  onSelectDoctor,
}: DateTimeStepProps) {
  
  // Create Date objects from available YYYY-MM-DD strings to format them
  const datesToDisplay = availableDates.map(dateStr => new Date(dateStr));

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  };

  const getDayNum = (date: Date) => {
    return date.getUTCDate();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Date & Time</h3>
        <p className="text-xs text-slate-500">Pick an available day and convenient timing slot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Side: Doctor preference selection */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Preferred Doctor</h4>
          {isLoadingDoctors ? (
            <div className="text-xs text-slate-400 animate-pulse py-2">Loading available doctors...</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {/* Any Doctor Option */}
              <button
                type="button"
                onClick={() => onSelectDoctor('ANY')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-350 cursor-pointer flex flex-col gap-1 hover:scale-[1.01] active:scale-[0.99] ${
                  selectedDoctorId === 'ANY'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <span>👨‍⚕️✨</span>
                  <span>Any Doctor</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Fastest available time slot</span>
              </button>

              {/* Specific Doctor Options */}
              {doctors.map((doc) => {
                const isSelected = selectedDoctorId === doc.id;
                const specialty = doc.lastName === 'Doe' ? 'Orthodontics Specialist' : 'General Dentist';
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => onSelectDoctor(doc.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-350 cursor-pointer flex flex-col gap-1 hover:scale-[1.01] active:scale-[0.99] ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-extrabold">
                      <span>{doc.lastName === 'Doe' ? '👩‍⚕️' : '👨‍⚕️'}</span>
                      <span className="truncate">Dr. {doc.firstName} {doc.lastName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">{specialty}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Date Carousel / Custom Calendar Grid */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Select Date</h4>
          {isLoading && (!selectedDate || availableSlots.length === 0) && (
            <div className="text-xs text-slate-400 animate-pulse py-2">Checking clinic schedule...</div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {datesToDisplay.length > 0 ? datesToDisplay.map((date, idx) => {
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
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-405 dark:text-slate-500">{getDayName(date)}</span>
                  <span className="text-base font-extrabold mt-0.5">{getDayNum(date)}</span>
                </button>
              );
            }) : !isLoading && (
              <div className="col-span-3 text-xs text-slate-450 dark:text-slate-500 py-6 border border-dashed border-slate-200 dark:border-white/10 w-full text-center rounded-2xl bg-slate-50/50 dark:bg-slate-900/10">
                No upcoming days with availability.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Slots & Holds */}
      {selectedDate ? (
        <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-slate-150/60 dark:border-white/5">
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
                    className={`p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
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
              <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto leading-relaxed">
                All doctors are fully booked on this date. Please select a different day from the calendar above.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-450 dark:text-slate-500 mt-6 bg-slate-50/30 dark:bg-slate-900/10">
          Please select a date above to display available times.
        </div>
      )}
    </div>
  );
}
