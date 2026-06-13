import React from 'react';

interface AdminAnalyticsSummaryProps {
  passedBookingsCount: number;
  activeServicesCount: number;
  rosteredDoctorsCount: number;
}

export function AdminAnalyticsSummary({
  passedBookingsCount,
  activeServicesCount,
  rosteredDoctorsCount,
}: AdminAnalyticsSummaryProps) {
  return (
    <section className="grid grid-cols-3 gap-6">
      <div className="p-5 rounded-2xl border border-card-border bg-card flex flex-col gap-1">
        <span className="text-3xl font-extrabold text-primary-start">{passedBookingsCount}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Bookings Passed</span>
      </div>
      <div className="p-5 rounded-2xl border border-card-border bg-card flex flex-col gap-1">
        <span className="text-3xl font-extrabold text-primary-start">{activeServicesCount}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Active Services</span>
      </div>
      <div className="p-5 rounded-2xl border border-card-border bg-card flex flex-col gap-1">
        <span className="text-3xl font-extrabold text-primary-start">{rosteredDoctorsCount}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Rostered Doctors</span>
      </div>
    </section>
  );
}
