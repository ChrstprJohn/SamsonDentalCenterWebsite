'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { UpcomingAppointment } from '../../hooks/use-secretary-dashboard';

interface CheckInTrackerProps {
  upcomingList: UpcomingAppointment[];
  handleCheckIn: (id: string) => void;
}

export function CheckInTracker({ upcomingList, handleCheckIn }: CheckInTrackerProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Check-In Tracker</h3>
      <div className="flex flex-col gap-4">
        {upcomingList.map((ua) => (
          <div
            key={ua.id}
            className="p-5 rounded-2xl border border-card-border bg-card flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-1">
              <span className={`inline-flex self-start px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                ua.status === 'CHECKED_IN'
                  ? 'bg-accent-blue-bg text-accent-blue-text'
                  : 'bg-secondary-bg text-text-secondary'
              }`}>
                {ua.status === 'CHECKED_IN' ? 'Checked In' : 'Scheduled'}
              </span>
              <h4 className="text-base font-bold text-text-primary mt-1">{ua.patientName}</h4>
              <p className="text-xs text-text-muted">📅 {ua.date} at {ua.time} | 👨‍⚕️ {ua.doctorName}</p>
            </div>
            <Button
              variant={ua.status === 'CHECKED_IN' ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => handleCheckIn(ua.id)}
            >
              {ua.status === 'CHECKED_IN' ? 'Undo Check-In' : 'Mark Checked-In'}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
