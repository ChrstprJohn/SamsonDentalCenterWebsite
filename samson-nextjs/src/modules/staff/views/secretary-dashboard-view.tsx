// src/modules/staff/views/secretary-dashboard-view.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSecretary } from '../hooks/use-secretary.hook';
import { Button } from '@/components/ui/button';

export function SecretaryDashboardView() {
  const { appointments, inquiries, invoices } = useSecretary();

  // Metrics calculations
  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const rescheduleCount = appointments.filter((a) => a.status === 'RESCHEDULE_REQUESTED').length;
  const inquiriesCount = inquiries.filter((i) => i.status === 'NEW').length;
  const arrivalsCount = appointments.filter((a) => a.date === '2026-06-23' && a.status === 'APPROVED').length;
  const checkoutCount = appointments.filter((a) => a.status === 'TREATMENT_RENDERED').length;

  const todayApproved = appointments.filter((a) => a.date === '2026-06-23' && ['APPROVED', 'CHECKED_IN', 'COMPLETED'].includes(a.status));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Secretary Dashboard</h1>
        <p className="text-xs text-text-muted">
          Operational summary, today's schedule flow, and quick system actions.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="border border-card-border/60 bg-card rounded-2xl p-5 shadow-sm flex flex-col gap-1 hover:border-primary-start/40 transition-colors">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Arrivals Today</span>
          <span className="text-3xl font-black text-text-primary mt-1">{arrivalsCount}</span>
          <p className="text-[10px] text-emerald-500 mt-2">Active scheduled slots</p>
        </div>

        <div className="border border-card-border/60 bg-card rounded-2xl p-5 shadow-sm flex flex-col gap-1 hover:border-primary-start/40 transition-colors">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Pending Bookings</span>
          <span className="text-3xl font-black text-text-primary mt-1">{pendingCount}</span>
          <p className="text-[10px] text-text-muted mt-2">Awaiting decision review</p>
        </div>

        <div className="border border-card-border/60 bg-card rounded-2xl p-5 shadow-sm flex flex-col gap-1 hover:border-primary-start/40 transition-colors">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Reschedules</span>
          <span className="text-3xl font-black text-text-primary mt-1">{rescheduleCount}</span>
          <p className="text-[10px] text-rose-500 mt-2">Patient change requests</p>
        </div>

        <div className="border border-card-border/60 bg-card rounded-2xl p-5 shadow-sm flex flex-col gap-1 hover:border-primary-start/40 transition-colors">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">New Inquiries</span>
          <span className="text-3xl font-black text-text-primary mt-1">{inquiriesCount}</span>
          <p className="text-[10px] text-text-muted mt-2">Leads from contact form</p>
        </div>

        <div className="border border-card-border/60 bg-card rounded-2xl p-5 shadow-sm flex flex-col gap-1 hover:border-primary-start/40 transition-colors">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Checkouts Waiting</span>
          <span className="text-3xl font-black text-text-primary mt-1">{checkoutCount}</span>
          <p className="text-[10px] text-amber-500 mt-2">Treatment rendered by doctors</p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Today's Timeline Schedule */}
        <div className="lg:col-span-8 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b border-card-border pb-4">
            <h2 className="text-lg font-bold text-text-primary">Today's Timeline</h2>
            <p className="text-xs text-text-muted">Chronological patient tracking for June 23, 2026</p>
          </div>

          {todayApproved.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted border border-dashed border-card-border rounded-2xl">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {todayApproved.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border border-card-border/40 rounded-xl bg-secondary-bg/20 hover:bg-secondary-bg/40 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-text-primary">{app.patientName}</span>
                    <span className="text-[11px] text-text-muted">
                      {app.startTime} - {app.endTime} • {app.doctorName} • <span className="italic text-primary-start">{app.serviceName}</span>
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase border ${
                      app.status === 'CHECKED_IN'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : app.status === 'COMPLETED'
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        : 'bg-card border-card-border text-text-secondary'
                    }`}
                  >
                    {app.status === 'APPROVED' ? 'Scheduled' : app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Panel */}
        <div className="lg:col-span-4 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4">
          <h2 className="text-base font-bold text-text-primary border-b border-card-border pb-3">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Link href="/secretary/book" className="w-full">
              <Button className="w-full justify-start text-xs font-semibold py-3 gap-2" variant="primary">
                <span>📅</span> Book New Walk-In
              </Button>
            </Link>
            <Link href="/secretary/pending" className="w-full">
              <Button className="w-full justify-start text-xs font-semibold py-3 gap-2" variant="secondary">
                <span>📋</span> Review Request Queue
              </Button>
            </Link>
            <Link href="/secretary/reschedule-requests" className="w-full">
              <Button className="w-full justify-start text-xs font-semibold py-3 gap-2" variant="secondary">
                <span>🔄</span> Reschedule Requests Queue
              </Button>
            </Link>
            <Link href="/secretary/inquiries" className="w-full">
              <Button className="w-full justify-start text-xs font-semibold py-3 gap-2" variant="secondary">
                <span>💬</span> Convert Guest Inquiries
              </Button>
            </Link>
            <Link href="/secretary/check-in" className="w-full">
              <Button className="w-full justify-start text-xs font-semibold py-3 gap-2" variant="secondary">
                <span>🚀</span> Run Checkout Tracker
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
