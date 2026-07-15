'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useBookingScheduler } from '@/modules/appointments/hooks/shared/use-booking-scheduler';
import { useChatIntake, IntakeWorkflowState } from '@/modules/appointments/hooks/chat/use-chat-intake';
import { formatShortDate } from '@/shared/utils/date.util';

interface ChatIntakeWorkflowProps {
  appointmentId: string;
  serviceId: string | null;
  chatToken?: string;
  onPatientMessageSent: (text: string) => Promise<void>;
  activeWorkflow: IntakeWorkflowState;
  setActiveWorkflow: (state: IntakeWorkflowState) => void;
}

export function ChatIntakeWorkflow({
  appointmentId,
  serviceId,
  chatToken,
  onPatientMessageSent,
  activeWorkflow,
  setActiveWorkflow,
}: ChatIntakeWorkflowProps) {
  const intake = useChatIntake({
    appointmentId,
    chatToken,
    onPatientMessageSent,
  });

  const scheduler = useBookingScheduler();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Link hook's activeWorkflow state with parent state
  useEffect(() => {
    intake.setActiveWorkflow(activeWorkflow);
  }, [activeWorkflow]);

  const handleStateChange = (state: IntakeWorkflowState) => {
    intake.resetIntake();
    setActiveWorkflow(state);
  };

  // Load available dates when month changes
  useEffect(() => {
    if (activeWorkflow === 'RESCHEDULE' && serviceId) {
      const year = currentMonth.getFullYear();
      const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
      scheduler.loadAvailableDates({
        serviceId,
        month: `${year}-${month}`,
      });
    }
  }, [activeWorkflow, serviceId, currentMonth]);

  const handleDateSelect = (date: string) => {
    intake.setSelectedDate(date);
    intake.setSelectedTime('');
    if (serviceId) {
      scheduler.loadAvailableSlots({
        serviceId,
        date,
      });
    }
  };

  const handleMonthPrev = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleMonthNext = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, index) => index + 1);
  const blankDays = Array.from({ length: firstDayIndex });
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (activeWorkflow === 'SELECT_OPTION') {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom duration-200">
        <p className="text-xs text-slate-400 font-medium px-1">How can we help you today?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleStateChange('RESCHEDULE')}
            className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 text-left transition-all group flex flex-col gap-1 cursor-pointer"
          >
            <span className="text-lg">📅</span>
            <span className="text-sm font-bold text-slate-100 group-hover:text-blue-400">Reschedule</span>
            <span className="text-[10px] text-slate-400">Select a new date/time slot.</span>
          </button>
          <button
            type="button"
            onClick={() => handleStateChange('CANCEL')}
            className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/40 text-left transition-all group flex flex-col gap-1 cursor-pointer"
          >
            <span className="text-lg">❌</span>
            <span className="text-sm font-bold text-slate-100 group-hover:text-rose-400">Cancel Appointment</span>
            <span className="text-[10px] text-slate-400">Request cancellation.</span>
          </button>
          <button
            type="button"
            onClick={() => handleStateChange('QUESTION')}
            className="p-4 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-600 text-left transition-all group flex flex-col gap-1 cursor-pointer"
          >
            <span className="text-lg">❓</span>
            <span className="text-sm font-bold text-slate-100 group-hover:text-white">Ask Question</span>
            <span className="text-[10px] text-slate-400">Message clinic staff.</span>
          </button>
        </div>
      </div>
    );
  }

  if (activeWorkflow === 'RESCHEDULE') {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">Select New Date</h3>
          <Button variant="ghost" onClick={() => handleStateChange('SELECT_OPTION')} className="text-xs h-8 text-slate-400 hover:text-white">
            ← Back
          </Button>
        </div>

        {intake.error && <p className="text-xs text-rose-400">{intake.error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Calendar Day Picker */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-200">{monthLabel}</span>
              <div className="flex gap-1">
                <button type="button" onClick={handleMonthPrev} className="p-1 text-slate-400 hover:text-white text-xs">◀</button>
                <button type="button" onClick={handleMonthNext} className="p-1 text-slate-400 hover:text-white text-xs">▶</button>
              </div>
            </div>

            {scheduler.loadingKey === 'dates' ? (
              <div className="text-center text-[10px] text-slate-500 py-10 animate-pulse">Scanning schedule...</div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="font-bold text-slate-500 py-1">{d}</div>
                ))}
                {blankDays.map((_, i) => (
                  <div key={`b-${i}`} className="py-2" />
                ))}
                {daysArray.map((day) => {
                  const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const isAvailable = scheduler.availableDates.includes(dateStr);
                  const isSelected = intake.selectedDate === dateStr;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleDateSelect(dateStr)}
                      className={`py-2 rounded-lg font-bold text-center cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isAvailable
                          ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                          : 'text-slate-700 cursor-not-allowed opacity-30'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Slots Picker */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Available Time Slots</span>
            {!intake.selectedDate ? (
              <div className="text-xs text-slate-500 p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                Please select a date on the calendar.
              </div>
            ) : scheduler.loadingKey === 'slots' ? (
              <div className="text-center text-[10px] text-slate-500 py-8 animate-pulse">Loading slots...</div>
            ) : scheduler.availableSlots.length === 0 ? (
              <div className="text-xs text-slate-500 p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                No slots available on this date.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {scheduler.availableSlots.map((slot, index) => {
                  const startTimeStr = slot.startTime.split('T')[1]?.substring(0, 5) || '';
                  const endTimeStr = slot.endTime.split('T')[1]?.substring(0, 5) || '';
                  const isSelected = intake.selectedTime === startTimeStr;
                  const formattedTime = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        intake.setSelectedTime(startTimeStr);
                        intake.setSelectedEndTime(endTimeStr);
                      }}
                      className={`p-2.5 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {formattedTime}
                    </button>
                  );
                })}
              </div>
            )}

            {intake.selectedDate && intake.selectedTime && (
              <Button
                type="button"
                onClick={intake.submitReschedule}
                disabled={intake.isSubmitting}
                className="w-full mt-auto"
              >
                {intake.isSubmitting ? 'Requesting...' : 'Confirm Reschedule Request'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeWorkflow === 'CANCEL') {
    return (
      <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">Reason for Cancellation</h3>
          <Button variant="ghost" onClick={() => handleStateChange('SELECT_OPTION')} className="text-xs h-8 text-slate-400 hover:text-white">
            ← Back
          </Button>
        </div>

        {intake.error && <p className="text-xs text-rose-400">{intake.error}</p>}

        <textarea
          value={intake.reasonText}
          onChange={(e) => intake.setReasonText(e.target.value)}
          placeholder="Please tell us why you are canceling (optional)..."
          rows={3}
          className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 resize-none"
        />

        <Button
          type="button"
          onClick={intake.submitCancellation}
          disabled={intake.isSubmitting}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white"
        >
          {intake.isSubmitting ? 'Submitting...' : 'Submit Cancellation Request'}
        </Button>
      </div>
    );
  }

  if (activeWorkflow === 'QUESTION') {
    return (
      <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">Ask a Question</h3>
          <Button variant="ghost" onClick={() => handleStateChange('SELECT_OPTION')} className="text-xs h-8 text-slate-400 hover:text-white">
            ← Back
          </Button>
        </div>

        {intake.error && <p className="text-xs text-rose-400">{intake.error}</p>}

        <textarea
          value={intake.questionText}
          onChange={(e) => intake.setQuestionText(e.target.value)}
          placeholder="Type your question for the clinic staff here..."
          rows={3}
          className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
        />

        <Button
          type="button"
          onClick={intake.submitQuestion}
          disabled={intake.isSubmitting || !intake.questionText.trim()}
          className="w-full"
        >
          {intake.isSubmitting ? 'Submitting...' : 'Submit Question'}
        </Button>
      </div>
    );
  }

  return null;
}
