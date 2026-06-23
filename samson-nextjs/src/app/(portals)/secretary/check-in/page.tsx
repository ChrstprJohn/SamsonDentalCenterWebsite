// src/app/(portals)/secretary/check-in/page.tsx
'use client';

import React from 'react';
import { useSecretary } from '@/modules/staff/hooks/use-secretary.hook';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function CheckInOutTrackerPage() {
  const {
    appointments,
    invoices,
    handleCheckInToggle,
    selectedInvoice,
    setSelectedInvoice,
    discountPercent,
    setDiscountPercent,
    paymentMethod,
    setPaymentMethod,
    handleCheckoutComplete,
    isSubmitting,
  } = useSecretary();

  const todayApproved = appointments.filter((a) => a.date === '2026-06-23' && ['APPROVED', 'CHECKED_IN'].includes(a.status));
  const draftInvoices = invoices.filter((inv) => inv.status === 'DRAFT');

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Check-In / Out Tracker</h1>
        <p className="text-xs text-text-muted">
          Manage physical arrivals and checkout completed treatments to finalize invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left: Check-In Queue */}
        <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-0.5 border-b border-card-border pb-3">
            <h2 className="text-sm font-bold text-text-primary">Daily Arrivals (June 23)</h2>
            <p className="text-[11px] text-text-muted">Log physical arrival at reception</p>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh]">
            {todayApproved.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted">No scheduled arrivals for today.</div>
            ) : (
              todayApproved.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3.5 border border-card-border/40 rounded-xl bg-secondary-bg/10 hover:bg-secondary-bg/20 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span className="font-semibold text-text-primary">{app.patientName}</span>
                    <span className="text-text-muted">
                      {app.startTime} • {app.doctorName} • <span className="italic">{app.serviceName}</span>
                    </span>
                  </div>

                  <Button
                    onClick={() => handleCheckInToggle(app.id, app.status)}
                    variant={app.status === 'CHECKED_IN' ? 'secondary' : 'default'}
                    size="sm"
                    className="text-[10px] font-bold uppercase tracking-wider py-1.5 px-3"
                  >
                    {app.status === 'CHECKED_IN' ? 'Undo Check-In' : 'Mark Checked-In'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Checkout Queue */}
        <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-5 shadow-md flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5 border-b border-card-border pb-3">
              <h2 className="text-sm font-bold text-text-primary">Checkout Drafts Queue</h2>
              <p className="text-[11px] text-text-muted">Finalize doctor-rendered draft invoices</p>
            </div>

            <div className="flex flex-col gap-3 max-h-[35vh] overflow-y-auto">
              {draftInvoices.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted">No draft checkouts waiting.</div>
              ) : (
                draftInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`flex items-center justify-between p-3 border border-card-border/40 rounded-xl cursor-pointer hover:bg-secondary-bg/20 transition-all ${
                      selectedInvoice?.id === inv.id ? 'bg-secondary-bg/50 border-primary-start/40' : 'bg-secondary-bg/10'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="font-semibold text-text-primary">{inv.patientName}</span>
                      <span className="text-[10px] text-text-muted">{inv.serviceName}</span>
                    </div>
                    <span className="text-xs font-bold text-text-secondary">₱{inv.basePrice}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Staged Checkout Finalizer Form */}
          {selectedInvoice && (
            <div className="border-t border-card-border/80 pt-4 flex flex-col gap-3 mt-auto">
              <div className="text-xs font-bold text-text-primary">Checkout Invoicing Form</div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-secondary uppercase">Discount %</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-secondary uppercase">Method</label>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="text-xs"
                    options={[
                      { value: 'CASH', label: 'Cash' },
                      { value: 'CARD', label: 'Card' },
                      { value: 'HMO', label: 'HMO / Insurance' }
                    ]}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-text-secondary mt-2 bg-secondary-bg/30 p-2.5 rounded-lg border border-card-border/40">
                <span>Final Price Due:</span>
                <span className="text-sm font-black text-primary-start">
                  ₱{selectedInvoice.basePrice * (1 - discountPercent / 100)}
                </span>
              </div>

              <Button
                onClick={handleCheckoutComplete}
                disabled={isSubmitting}
                variant="primary"
                className="w-full text-xs font-bold py-3 mt-1"
              >
                {isSubmitting ? 'Locking Invoice Receipt...' : 'Complete Checkout & Lock Invoice'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
