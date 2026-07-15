'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useBookingScheduler } from '@/modules/appointments/hooks/shared/use-booking-scheduler';
import { useChatIntake, IntakeWorkflowState } from '@/modules/appointments/hooks/chat/use-chat-intake';
import { formatShortDate } from '@/shared/utils/date.util';
import { Calendar, XCircle, HelpCircle, ArrowLeft, Check, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    intake.setActiveWorkflow(activeWorkflow);
  }, [activeWorkflow]);

  const handleStateChange = (state: IntakeWorkflowState) => {
    intake.resetIntake();
    setActiveWorkflow(state);
  };

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
      <div className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground font-medium px-1">How can we help you today?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleStateChange('RESCHEDULE')}
            className="p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 text-left transition-all group flex flex-col gap-1 cursor-pointer"
          >
            <Calendar className="size-5 text-primary" />
            <span className="text-sm font-bold text-foreground group-hover:text-primary">Reschedule</span>
            <span className="text-[10px] text-muted-foreground">Select a new date/time slot.</span>
          </button>
          <button
            type="button"
            onClick={() => handleStateChange('CANCEL')}
            className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/40 text-left transition-all group flex flex-col gap-1 cursor-pointer"
          >
            <XCircle className="size-5 text-destructive" />
            <span className="text-sm font-bold text-foreground group-hover:text-destructive">Cancel Appointment</span>
            <span className="text-[10px] text-muted-foreground">Request cancellation.</span>
          </button>
          <button
            type="button"
            onClick={() => handleStateChange('QUESTION')}
            className="p-4 rounded-xl border border-border bg-muted/40 hover:bg-muted/80 hover:border-border text-left transition-all group flex flex-col gap-1 cursor-pointer"
          >
            <HelpCircle className="size-5 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground group-hover:text-foreground">Ask Question</span>
            <span className="text-[10px] text-muted-foreground">Message clinic staff.</span>
          </button>
        </div>
      </div>
    );
  }

  if (activeWorkflow === 'RESCHEDULE') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="size-4" />
            Select New Date
          </h3>
          <Button variant="ghost" onClick={() => handleStateChange('SELECT_OPTION')} size="sm">
            <ArrowLeft className="size-3.5 mr-1" />
            Back
          </Button>
        </div>

        {intake.error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <XCircle className="size-3" />
            {intake.error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Calendar Day Picker */}
          <div className="p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-foreground">{monthLabel}</span>
              <div className="flex gap-1">
                <button type="button" onClick={handleMonthPrev} className="p-1 text-muted-foreground hover:text-foreground text-xs cursor-pointer">◀</button>
                <button type="button" onClick={handleMonthNext} className="p-1 text-muted-foreground hover:text-foreground text-xs cursor-pointer">▶</button>
              </div>
            </div>

            {scheduler.loadingKey === 'dates' ? (
              <div className="text-center text-[10px] text-muted-foreground py-10 flex items-center justify-center gap-1">
                <Loader2 className="size-3 animate-spin" />
                Scanning schedule...
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="font-bold text-muted-foreground py-1">{d}</div>
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
                          ? 'bg-primary text-primary-foreground'
                          : isAvailable
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'text-muted-foreground/30 cursor-not-allowed opacity-30'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Time Picker */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Preferred Time</span>
            {!intake.selectedDate ? (
              <div className="text-xs text-muted-foreground p-4 bg-card border border-border rounded-xl text-center">
                Please select a date on the calendar.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="time"
                  value={intake.selectedTime}
                  onChange={(e) => {
                    const timeVal = e.target.value;
                    intake.setSelectedTime(timeVal);
                    if (timeVal) {
                      const [h, m] = timeVal.split(':').map(Number);
                      const dateObj = new Date();
                      dateObj.setHours(h, m + 30, 0);
                      const endH = dateObj.getHours().toString().padStart(2, '0');
                      const endM = dateObj.getMinutes().toString().padStart(2, '0');
                      intake.setSelectedEndTime(`${endH}:${endM}`);
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-[10px] text-muted-foreground">
                  Select a convenient time for your reschedule request.
                </p>
              </div>
            )}

            {intake.selectedDate && intake.selectedTime && (
              <Button
                type="button"
                onClick={intake.submitReschedule}
                disabled={intake.isSubmitting}
                className="w-full mt-auto"
              >
                {intake.isSubmitting ? (
                  <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Requesting...</>
                ) : (
                  <><Check className="size-3.5 mr-1.5" />Confirm Reschedule Request</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeWorkflow === 'CANCEL') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <XCircle className="size-4 text-destructive" />
            Reason for Cancellation
          </h3>
          <Button variant="ghost" onClick={() => handleStateChange('SELECT_OPTION')} size="sm">
            <ArrowLeft className="size-3.5 mr-1" />
            Back
          </Button>
        </div>

        {intake.error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <XCircle className="size-3" />
            {intake.error}
          </p>
        )}

        <Textarea
          value={intake.reasonText}
          onChange={(e) => intake.setReasonText(e.target.value)}
          placeholder="Please tell us why you are canceling (optional)..."
          rows={3}
          className="min-h-[80px] resize-none"
        />

        <Button
          type="button"
          onClick={intake.submitCancellation}
          disabled={intake.isSubmitting}
          variant="destructive"
          className="w-full"
        >
          {intake.isSubmitting ? (
            <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Submitting...</>
          ) : (
            <><XCircle className="size-3.5 mr-1.5" />Submit Cancellation Request</>
          )}
        </Button>
      </div>
    );
  }

  if (activeWorkflow === 'QUESTION') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <HelpCircle className="size-4" />
            Ask a Question
          </h3>
          <Button variant="ghost" onClick={() => handleStateChange('SELECT_OPTION')} size="sm">
            <ArrowLeft className="size-3.5 mr-1" />
            Back
          </Button>
        </div>

        {intake.error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <XCircle className="size-3" />
            {intake.error}
          </p>
        )}

        <Textarea
          value={intake.questionText}
          onChange={(e) => intake.setQuestionText(e.target.value)}
          placeholder="Type your question for the clinic staff here..."
          rows={3}
          className="min-h-[80px] resize-none"
        />

        <Button
          type="button"
          onClick={intake.submitQuestion}
          disabled={intake.isSubmitting || !intake.questionText.trim()}
          className="w-full"
        >
          {intake.isSubmitting ? (
            <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Submitting...</>
          ) : (
            <><HelpCircle className="size-3.5 mr-1.5" />Submit Question</>
          )}
        </Button>
      </div>
    );
  }

  return null;
}
