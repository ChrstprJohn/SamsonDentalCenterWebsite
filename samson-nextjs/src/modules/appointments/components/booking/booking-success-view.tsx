'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { BookingSlot } from '../../hooks/booking/use-user-booking';

import { formatShortDate, formatClinicTime, calculateEndTimeFromIso } from '@/shared/utils/date.util';

interface BookingSuccessViewProps {
  appointmentId: string | null;
  service: ServiceResponseDto | null;
  slot: BookingSlot | null;
  date: string | null;
  patientName: string;
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  relationship?: string | null;
}

export function BookingSuccessView({ appointmentId, service, slot, date, patientName, patientType, relationship }: BookingSuccessViewProps) {
  const router = useRouter();

  const getSlotRange = () => {
    if (!date || !slot || !service) return '';
    const start = new Date(slot.originalStartTime);
    const end = calculateEndTimeFromIso(slot.originalStartTime, service.durationMinutes);
    return `${formatClinicTime(start)} - ${formatClinicTime(end)}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-3xl text-amber-600 dark:text-amber-400">
        ⏳
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Request Submitted Successfully!</h2>
        <p className="text-sm text-slate-500 max-w-md">
          Your appointment request has been routed to our clinic desk. Our administration team is currently verifying the details against the doctor’s real-time schedule.
        </p>
      </div>

      <div className="w-full border border-slate-100 dark:border-white/5 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/30 text-xs flex flex-col gap-2.5 text-left">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Patient Name</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            {patientName}
            {patientType !== 'SELF' && (
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/30">
                {relationship || 'Dependent'}
              </span>
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Treatment Service</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{service?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Assigned Doctor</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{slot?.doctorName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Date</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{date ? formatShortDate(date) : ''}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Requested Window</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{getSlotRange()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Current Status</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1">
            <span>⏳</span> Pending Staff Review
          </span>
        </div>
        {appointmentId && (
          <div className="flex justify-between pt-2.5 border-t border-slate-100 dark:border-white/5 mt-1 items-center">
            <span className="text-slate-400">Appointment ID</span>
            <span className="font-semibold text-slate-500 select-all font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-white/5">
              {appointmentId}
            </span>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-4 text-left border border-slate-100 dark:border-white/5 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/20 text-xs">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">What happens next?</h3>
        
        <div className="flex gap-3 items-start">
          <span className="text-base leading-none">🔍</span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">Staff Review</strong>
            <span className="text-slate-500 leading-relaxed">Our clinic secretary will verify the slot (usually takes less than 2 hours during regular operational hours).</span>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <span className="text-base leading-none">📧</span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">Notification</strong>
            <span className="text-slate-500 leading-relaxed">You will receive a final confirmation email the moment your status updates to active.</span>
          </div>
        </div>
      </div>

      <Button onClick={() => router.push('/user')} className="mt-2 w-full sm:w-auto">
        Go to Dashboard
      </Button>
    </div>
  );
}
