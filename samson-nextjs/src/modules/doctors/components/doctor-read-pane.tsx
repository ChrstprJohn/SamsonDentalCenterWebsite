'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Doctor } from '../hooks/use-doctor-management';

interface DoctorReadPaneProps {
  doctor: Doctor | null;
}

export function DoctorReadPane({ doctor }: DoctorReadPaneProps) {
  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-text-muted h-full">
        Select a doctor to view their schedules and details.
      </div>
    );
  }

  const initials = `${doctor.firstName[0] || ''}${doctor.lastName[0] || ''}`.toUpperCase();

  return (
    <div className="flex flex-col gap-5 p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-card-border/50 h-full">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg border border-blue-500/20">
          {initials}
        </div>
        <div>
          <h3 className="font-bold text-sm text-text-primary">
            Dr. {doctor.firstName} {doctor.lastName}
          </h3>
          <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
            {doctor.specialization || 'General Dentist'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 text-xs">
        <div>
          <span className="font-bold text-text-secondary block mb-0.5">Email</span>
          <span className="text-text-primary block break-all">{doctor.email}</span>
        </div>
        <div>
          <span className="font-bold text-text-secondary block mb-0.5">Phone Number</span>
          <span className="text-text-primary block">{doctor.phoneNumber || 'N/A'}</span>
        </div>
        <div>
          <span className="font-bold text-text-secondary block mb-0.5">Operational Status</span>
          <span className="text-text-primary block font-medium">
            {doctor.isActive ? '🟢 Active clear' : '🔴 Inactive'}
          </span>
        </div>
      </div>

      <div className="border-t border-card-border/50 pt-4 flex flex-col gap-3">
        <h4 className="font-bold text-xs text-text-secondary uppercase tracking-wider">
          Clinician Shifts
        </h4>
        <div className="flex flex-col gap-1.5 text-[11px] text-text-muted">
          {(() => {
            const formatTime = (timeStr: string) => {
              if (!timeStr) return '';
              const [hoursStr, minutesStr] = timeStr.split(':');
              const hours = parseInt(hoursStr, 10);
              const ampm = hours >= 12 ? 'PM' : 'AM';
              const displayHours = hours % 12 === 0 ? 12 : hours % 12;
              return `${displayHours}:${minutesStr} ${ampm}`;
            };

            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            // If doctor has dynamic schedules defined, render them
            if (doctor.schedules && doctor.schedules.length > 0) {
              // Sort by dayOfWeek
              const sortedSchedules = [...doctor.schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
              return (
                <>
                  {sortedSchedules.map((sched) => (
                    <div key={sched.dayOfWeek} className="flex justify-between py-1 border-b border-card-border/20 last:border-b-0">
                      <span className="font-medium text-text-secondary">{dayNames[sched.dayOfWeek]}</span>
                      {sched.isOpen ? (
                        <span>
                          {formatTime(sched.startTime)} - {formatTime(sched.endTime)}
                        </span>
                      ) : (
                        <span className="text-red-500/75 font-medium">Off-Duty</span>
                      )}
                    </div>
                  ))}
                </>
              );
            }

            // Fallback default schedules (Mon-Fri 9:00 AM - 5:00 PM)
            return (
              <>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <div key={day} className="flex justify-between py-1 border-b border-card-border/20 last:border-b-0">
                    <span className="font-medium text-text-secondary">{day}</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 text-red-500/75">
                  <span className="font-medium">Saturday & Sunday</span>
                  <span>Off-Duty</span>
                </div>
              </>
            );
          })()}
        </div>
        <Link href="/secretary" className="mt-2">
          <Button variant="secondary" className="w-full text-[10px] h-8 rounded-xl font-bold">
            Edit Doctor Schedule
          </Button>
        </Link>
      </div>
    </div>
  );
}
