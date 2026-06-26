// src/app/(portals)/secretary/check-in/page.tsx
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { checkInAction } from '@/modules/appointments/actions/status/check-in.action';
import { undoCheckInAction } from '@/modules/appointments/actions/status/undo-check-in.action';
import { markNoShowAction } from '@/modules/appointments/actions/status/mark-no-show.action';
import { checkoutAction } from '@/modules/billing/actions/invoicing/checkout.action';
import { getInvoicesAction } from '@/modules/billing/actions/invoicing/get-invoices.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { createClient } from '@/shared/database/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AppointmentDto } from '@/modules/appointments/dtos/exports';
import { InvoiceResponseDto } from '@/modules/billing/dtos/exports';
import { formatClinicTime, getTodayLocalDateStr } from '@/shared/utils/date.util';

export default function CheckInOutTrackerPage() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponseDto[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Modals state
  const [checkoutInvoice, setCheckoutInvoice] = useState<InvoiceResponseDto | null>(null);
  const [checkoutAppt, setCheckoutAppt] = useState<AppointmentDto | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [priceOverride, setPriceOverride] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'HMO'>('CASH');

  const [viewAppt, setViewAppt] = useState<AppointmentDto | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<AppointmentDto | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleDoctor, setRescheduleDoctor] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();
  const todayStr = getTodayLocalDateStr();

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const apptRes = await getClinicAppointmentsAction({ date: todayStr });
      if (apptRes.success && apptRes.data) {
        setAppointments(apptRes.data);
      } else {
        setErrorMessage(apptRes.error || 'Failed to load appointments');
      }

      const invRes = await getInvoicesAction();
      if (invRes.success && invRes.data) {
        setInvoices(invRes.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Clock ticker for time-gated buttons
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Supabase Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('check-in-out-tracker')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Helper check-in time window validation
  const getCheckInStatus = (appointment: AppointmentDto) => {
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    const windowStart = new Date(startTime.getTime() - 30 * 60 * 1000);

    if (currentTime < windowStart) {
      const minutesLeft = Math.ceil((windowStart.getTime() - currentTime.getTime()) / 60000);
      return {
        enabled: false,
        message: `Too early. Active in ${minutesLeft} mins.`,
      };
    }

    if (currentTime > endTime) {
      return {
        enabled: false,
        message: 'Slot expired.',
      };
    }

    return { enabled: true, message: 'Check In' };
  };

  // Actions
  const handleCheckIn = (appointmentId: string) => {
    startTransition(async () => {
      const res = await checkInAction({ appointmentId });
      if (!res.success) {
        alert(res.error || 'Failed to check in');
      } else {
        fetchData();
      }
    });
  };

  const handleUndoCheckIn = (appointmentId: string) => {
    if (!confirm('Are you sure you want to undo this check-in?')) return;
    startTransition(async () => {
      const res = await undoCheckInAction({ appointmentId });
      if (!res.success) {
        alert(res.error || 'Failed to undo check-in');
      } else {
        fetchData();
      }
    });
  };

  const handleMarkNoShow = (appointmentId: string) => {
    startTransition(async () => {
      const res = await markNoShowAction({ appointmentId });
      if (!res.success) {
        alert(res.error || 'Failed to mark no-show');
      } else {
        fetchData();
      }
    });
  };

  const handleCheckoutComplete = () => {
    if (!checkoutInvoice || !checkoutAppt) return;
    startTransition(async () => {
      const res = await checkoutAction({
        invoiceId: checkoutInvoice.id,
        paymentMethod,
        discountApplied: discountPercent || undefined,
        amount: priceOverride ? parseFloat(priceOverride) : undefined,
      });

      if (!res.success) {
        alert(res.error || 'Failed to complete checkout');
      } else {
        setCheckoutInvoice(null);
        setCheckoutAppt(null);
        setDiscountPercent(0);
        setPriceOverride('');
        fetchData();
      }
    });
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleAppt || !rescheduleDate || !rescheduleTime || !rescheduleDoctor) return;
    startTransition(async () => {
      // Form ISO start/end times
      const startIso = new Date(`${rescheduleDate}T${rescheduleTime}:00`).toISOString();
      const endIso = new Date(new Date(startIso).getTime() + 30 * 60 * 1000).toISOString();

      const res = await updateAppointmentStatusAction({
        appointmentId: rescheduleAppt.id,
        status: 'APPROVED',
        statusReason: 'Rescheduling past no-show appointment',
        newDate: rescheduleDate,
        newStartTime: startIso,
        newEndTime: endIso,
        newDoctorId: rescheduleDoctor,
      });

      if (!res.success) {
        alert(res.error || 'Failed to reschedule');
      } else {
        setRescheduleAppt(null);
        fetchData();
      }
    });
  };

  // Pricing calculations
  const calculateFinalPrice = () => {
    if (!checkoutInvoice) return 0;
    const base = priceOverride ? parseFloat(priceOverride) : checkoutInvoice.amount;
    if (isNaN(base)) return 0;
    const final = base - base * (discountPercent / 100);
    return Math.max(0, final);
  };

  // Kanban Column filters (today's date only)
  const colApproved = appointments.filter((a) => a.status === 'APPROVED');
  const colNoShow = appointments.filter((a) => a.status === 'NO_SHOW');
  const colCheckedIn = appointments.filter((a) => a.status === 'CHECKED_IN');
  const colReadyCheckout = appointments.filter((a) => a.status === 'TREATMENT_RENDERED');
  const colCompleted = appointments.filter((a) => a.status === 'COMPLETED');

  // Find draft invoice for a given appointment ID
  const getDraftInvoiceForAppt = (apptId: string) => {
    return invoices.find((inv) => inv.appointmentId === apptId && inv.status === 'DRAFT') || null;
  };

  // Find finalized invoice for a given appointment ID
  const getFinalizedInvoiceForAppt = (apptId: string) => {
    return invoices.find((inv) => inv.appointmentId === apptId && inv.status === 'FINALIZED') || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-xs text-text-muted">Loading Kanban Board...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Daily Check-In & Checkout Tracker</h1>
        <p className="text-xs text-text-muted">
          Manage patient workflow from arrival through treatment to checkout and invoicing for today.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* 5-Column Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch flex-1 overflow-x-auto pb-4">
        {/* Column 1: APPROVED */}
        <div className="bg-secondary-bg/20 border border-card-border/40 rounded-2xl p-3 flex flex-col gap-3 min-w-[220px]">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Approved ({colApproved.length})</span>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
            {colApproved.map((appt) => {
              const checkInGate = getCheckInStatus(appt);
              const isPastEnd = currentTime > new Date(appt.endTime);
              return (
                <div key={appt.id} className="p-3 border border-card-border bg-card rounded-xl shadow-xs flex flex-col gap-2.5">
                  <div className="flex flex-col text-xs gap-0.5">
                    <span className="font-bold text-text-primary">{appt.patient?.firstName} {appt.patient?.lastName}</span>
                    <span className="text-[10px] text-text-muted">{formatClinicTime(appt.startTime)} • {appt.doctor?.firstName} {appt.doctor?.lastName}</span>
                    <span className="text-[10px] italic text-text-secondary">{appt.service?.name}</span>
                  </div>
                  <div className="flex gap-2.5">
                    <Button
                      onClick={() => handleCheckIn(appt.id)}
                      disabled={!checkInGate.enabled || isPending}
                      className="w-full text-[10px] py-1 h-7 font-bold"
                    >
                      {checkInGate.enabled ? 'Check In' : checkInGate.message}
                    </Button>
                    {isPastEnd && (
                      <Button
                        onClick={() => handleMarkNoShow(appt.id)}
                        disabled={isPending}
                        variant="secondary"
                        className="text-[10px] py-1 h-7 text-red-500 hover:text-red-600 font-bold"
                      >
                        No-Show
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: NO-SHOW */}
        <div className="bg-secondary-bg/20 border border-card-border/40 rounded-2xl p-3 flex flex-col gap-3 min-w-[220px]">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">No-Show ({colNoShow.length})</span>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
            {colNoShow.map((appt) => (
              <div key={appt.id} className="p-3 border border-red-500/10 bg-card rounded-xl shadow-xs flex flex-col gap-2.5">
                <div className="flex flex-col text-xs gap-0.5">
                  <span className="font-bold text-text-primary">{appt.patient?.firstName} {appt.patient?.lastName}</span>
                  <span className="text-[10px] text-text-muted">{appt.doctor?.firstName} {appt.doctor?.lastName}</span>
                  <span className="text-[10px] italic text-text-secondary">{appt.service?.name}</span>
                </div>
                <Button
                  onClick={() => {
                    setRescheduleAppt(appt);
                    setRescheduleDoctor(appt.doctorId);
                  }}
                  variant="secondary"
                  className="w-full text-[10px] py-1 h-7 font-bold"
                >
                  Reschedule
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: CHECKED IN */}
        <div className="bg-secondary-bg/20 border border-card-border/40 rounded-2xl p-3 flex flex-col gap-3 min-w-[220px]">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Checked In ({colCheckedIn.length})</span>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
            {colCheckedIn.map((appt) => (
              <div key={appt.id} className="p-3 border border-card-border bg-card rounded-xl shadow-xs flex flex-col gap-2.5">
                <div className="flex flex-col text-xs gap-0.5">
                  <span className="font-bold text-text-primary">{appt.patient?.firstName} {appt.patient?.lastName}</span>
                  <span className="text-[10px] text-text-muted">{appt.doctor?.firstName} {appt.doctor?.lastName}</span>
                  <span className="text-[10px] italic text-text-secondary">{appt.service?.name}</span>
                </div>
                <Button
                  onClick={() => handleUndoCheckIn(appt.id)}
                  disabled={isPending}
                  variant="secondary"
                  className="w-full text-[10px] py-1 h-7 text-text-muted font-bold"
                >
                  Undo Check-In
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: READY FOR CHECKOUT */}
        <div className="bg-secondary-bg/20 border border-card-border/40 rounded-2xl p-3 flex flex-col gap-3 min-w-[220px]">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Ready Checkout ({colReadyCheckout.length})</span>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
            {colReadyCheckout.map((appt) => {
              const draftInvoice = getDraftInvoiceForAppt(appt.id);
              return (
                <div key={appt.id} className="p-3 border border-yellow-500/20 bg-card rounded-xl shadow-xs flex flex-col gap-2.5">
                  <div className="flex flex-col text-xs gap-0.5">
                    <span className="font-bold text-text-primary">{appt.patient?.firstName} {appt.patient?.lastName}</span>
                    <span className="text-[10px] text-text-muted">{appt.service?.name}</span>
                    {draftInvoice && <span className="text-[10px] font-bold text-primary-start">₱{draftInvoice.amount} (Draft)</span>}
                  </div>
                  {draftInvoice && (
                    <Button
                      onClick={() => {
                        setCheckoutInvoice(draftInvoice);
                        setCheckoutAppt(appt);
                      }}
                      className="w-full text-[10px] py-1 h-7 font-bold bg-primary-start hover:bg-primary-end"
                    >
                      Checkout
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 5: COMPLETED */}
        <div className="bg-secondary-bg/20 border border-card-border/40 rounded-2xl p-3 flex flex-col gap-3 min-w-[220px]">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Completed ({colCompleted.length})</span>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
            {colCompleted.map((appt) => (
              <div key={appt.id} className="p-3 border border-green-500/10 bg-card rounded-xl shadow-xs flex flex-col gap-2.5">
                <div className="flex flex-col text-xs gap-0.5">
                  <span className="font-bold text-text-primary">{appt.patient?.firstName} {appt.patient?.lastName}</span>
                  <span className="text-[10px] text-text-muted">{appt.service?.name}</span>
                </div>
                <Button
                  onClick={() => setViewAppt(appt)}
                  variant="secondary"
                  className="w-full text-[10px] py-1 h-7 font-bold"
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: CHECKOUT & INVOICING PANEL */}
      {checkoutInvoice && checkoutAppt && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-card border border-card-border rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col gap-0.5 border-b border-card-border pb-3">
              <h2 className="text-sm font-bold text-text-primary">Checkout & Invoicing</h2>
              <p className="text-[11px] text-text-muted">Finalize visit record for {checkoutAppt.patient?.firstName} {checkoutAppt.patient?.lastName}</p>
            </div>

            <div className="flex flex-col gap-3 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Service:</span>
                <span className="font-bold">{checkoutAppt.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Doctor:</span>
                <span className="font-bold">{checkoutAppt.doctor?.firstName} {checkoutAppt.doctor?.lastName}</span>
              </div>
              <div className="flex justify-between border-t border-card-border/40 pt-2">
                <span>Original Base Price:</span>
                <span className="font-bold">₱{checkoutInvoice.amount}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">Price Override (₱)</label>
                <Input
                  type="number"
                  placeholder="₱"
                  value={priceOverride}
                  onChange={(e) => setPriceOverride(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">Discount %</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent || ''}
                  onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[9px] font-bold text-text-secondary uppercase">Payment Method</label>
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

            <div className="flex justify-between items-center text-xs font-bold text-text-secondary mt-2 bg-secondary-bg/30 p-3 rounded-xl border border-card-border/40">
              <span>Final Price Due:</span>
              <span className="text-sm font-black text-primary-start">₱{calculateFinalPrice().toFixed(2)}</span>
            </div>

            <div className="flex gap-3 border-t border-card-border/40 pt-4">
              <Button
                onClick={() => {
                  setCheckoutInvoice(null);
                  setCheckoutAppt(null);
                }}
                variant="secondary"
                className="w-full text-xs font-bold py-2.5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckoutComplete}
                disabled={isPending}
                className="w-full text-xs font-bold py-2.5 bg-primary-start hover:bg-primary-end"
              >
                Complete Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESCHEDULE PLAN */}
      {rescheduleAppt && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-card border border-card-border rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col gap-0.5 border-b border-card-border pb-3">
              <h2 className="text-sm font-bold text-text-primary">Reschedule Appointment</h2>
              <p className="text-[11px] text-text-muted">Move {rescheduleAppt.patient?.firstName}'s slot to a new date/time</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">New Date</label>
                <Input
                  type="date"
                  value={rescheduleDate}
                  min={todayStr}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">New Start Time</label>
                <Input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">Assign Doctor</label>
                <Select
                  value={rescheduleDoctor}
                  onChange={(e) => setRescheduleDoctor(e.target.value)}
                  className="text-xs"
                  options={[
                    { value: rescheduleAppt.doctorId, label: `Keep Original Doctor` }
                  ]}
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-card-border/40 pt-4 mt-2">
              <Button
                onClick={() => setRescheduleAppt(null)}
                variant="secondary"
                className="w-full text-xs font-bold py-2.5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRescheduleSubmit}
                disabled={isPending || !rescheduleDate || !rescheduleTime}
                className="w-full text-xs font-bold py-2.5"
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW COMPLETED DETAILS */}
      {viewAppt && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-card border border-card-border rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col gap-0.5 border-b border-card-border pb-3">
              <h2 className="text-sm font-bold text-text-primary">Completed Visit Log</h2>
              <p className="text-[11px] text-text-muted">Review checkout records</p>
            </div>

            <div className="flex flex-col gap-3 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Patient:</span>
                <span className="font-bold text-text-primary">{viewAppt.patient?.firstName} {viewAppt.patient?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span>Service:</span>
                <span className="font-bold">{viewAppt.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Doctor:</span>
                <span className="font-bold">{viewAppt.doctor?.firstName} {viewAppt.doctor?.lastName}</span>
              </div>
              {getFinalizedInvoiceForAppt(viewAppt.id) && (
                <div className="border-t border-card-border/40 pt-2 flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-bold text-green-600">{getFinalizedInvoiceForAppt(viewAppt.id)?.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount Applied:</span>
                    <span>{getFinalizedInvoiceForAppt(viewAppt.id)?.discountApplied || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Amount:</span>
                    <span className="font-black text-primary-start">₱{getFinalizedInvoiceForAppt(viewAppt.id)?.amount?.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => setViewAppt(null)}
              variant="secondary"
              className="w-full text-xs font-bold py-2.5 mt-2"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
