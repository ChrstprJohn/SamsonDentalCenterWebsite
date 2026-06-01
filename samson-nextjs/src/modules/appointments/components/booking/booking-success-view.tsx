'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { BookingSlot } from '../../hooks/booking/use-user-booking';

interface BookingSuccessViewProps {
  service: ServiceResponseDto | null;
  slot: BookingSlot | null;
  date: string | null;
}

export function BookingSuccessView({ service, slot, date }: BookingSuccessViewProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-3xl text-emerald-600 dark:text-emerald-400">
        ✓
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Booking Confirmed!</h2>
        <p className="text-sm text-slate-500 max-w-md">
          Your appointment has been successfully scheduled. You can view, track, or reschedule this reservation inside your patient dashboard portal.
        </p>
      </div>

      <div className="w-full border border-slate-100 dark:border-white/5 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/30 text-xs flex flex-col gap-2 text-left">
        <div className="flex justify-between">
          <span className="text-slate-400">Treatment</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{service?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Practitioner</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{slot?.doctorName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Date & Time</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{date} at {slot?.time}</span>
        </div>
      </div>

      <Button onClick={() => router.push('/user')} className="mt-2 w-full sm:w-auto">
        Go to Dashboard
      </Button>
    </div>
  );
}
