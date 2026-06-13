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
}

export function BookingSuccessView({ appointmentId, service, slot, date }: BookingSuccessViewProps) {
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
          Your appointment request has been securely sent to our clinic routing desk. Our medical staff is currently reviewing your chosen timeline window against the doctor’s schedule.
        </p>
      </div>

      <div className="w-full border border-slate-100 dark:border-white/5 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/30 text-xs flex flex-col gap-2.5 text-left">
        {appointmentId && (
          <div className="flex justify-between">
            <span className="text-slate-400">Appointment ID</span>
            <span className="font-semibold text-slate-500 select-all font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-white/5">
              {appointmentId}
            </span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-white/5 mt-1">
          <span className="text-slate-400">Service</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{service?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Doctor</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{slot?.doctorName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Date</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{date ? formatShortDate(date) : ''}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Time</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{getSlotRange()}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5 mt-1">
          <span className="text-slate-400">Status</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
            Pending Approval
          </span>
        </div>
      </div>

      <Button onClick={() => router.push('/user')} className="mt-2 w-full sm:w-auto">
        Go to Dashboard
      </Button>
    </div>
  );
}
