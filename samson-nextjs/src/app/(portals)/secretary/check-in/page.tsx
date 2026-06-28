// src/app/(portals)/secretary/check-in/page.tsx
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  Undo2,
  Check,
  Search,
  Sparkles,
  RefreshCw,
  FileText,
  X,
  CreditCard,
  Percent,
} from 'lucide-react';
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
  
  // Times in DB are stored as naive-UTC (e.g. 09:00:00Z = "9 AM clinic local", not real UTC).
  // To compare correctly, shift real UTC by the local TZ offset -> naive-UTC epoch.
  const toNaiveUtc = (d: Date) => new Date(d.getTime() + (-d.getTimezoneOffset()) * 60000);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  
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

  // Set currentTime client-side only (avoids SSR mismatch) and tick every minute.
  useEffect(() => {
    setCurrentTime(toNaiveUtc(new Date()));
    const tick = setInterval(() => setCurrentTime(toNaiveUtc(new Date())), 60_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    fetchData();
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
    if (!currentTime) return { enabled: false, message: 'Check In' };
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    const windowStart = new Date(startTime.getTime() - 30 * 60 * 1000);

    if (currentTime < windowStart) {
      const minutesLeft = Math.ceil((windowStart.getTime() - currentTime.getTime()) / 60000);
      return {
        enabled: false,
        message: `In ${minutesLeft}m`,
      };
    }

    if (currentTime > endTime) {
      return {
        enabled: false,
        message: 'Expired',
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

  // Kanban Column filters
  const colApproved = appointments.filter((a) => a.status === 'APPROVED');
  const colNoShow = appointments.filter((a) => a.status === 'NO_SHOW');
  const colCheckedIn = appointments.filter((a) => a.status === 'CHECKED_IN');
  const colReadyCheckout = appointments.filter((a) => a.status === 'TREATMENT_RENDERED');
  const colCompleted = appointments.filter((a) => a.status === 'COMPLETED');

  // Find draft/finalized invoices for appointments
  const getDraftInvoiceForAppt = (apptId: string) => {
    return invoices.find((inv) => inv.appointmentId === apptId && inv.status === 'DRAFT') || null;
  };

  const getFinalizedInvoiceForAppt = (apptId: string) => {
    return invoices.find((inv) => inv.appointmentId === apptId && inv.status === 'FINALIZED') || null;
  };

  // Dynamic statistics calculations
  const totalCheckedInToday = appointments.filter((a) => ['CHECKED_IN', 'TREATMENT_RENDERED', 'COMPLETED'].includes(a.status)).length;
  const completedToday = colCompleted.length;
  const pendingCheckout = colReadyCheckout.length;
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'FINALIZED' && appointments.some((a) => a.id === inv.appointmentId))
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <div className="text-sm font-medium text-text-muted">Loading Patient Visits Board...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-[1600px] mx-auto p-4 md:p-6">
      {/* Header section with glass background */}
      <div className="relative overflow-hidden bg-card/65 backdrop-blur-md border border-card-border/60 rounded-3xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Patient Flows</h1>
          </div>
          <p className="text-xs text-text-muted">
            Operation desk & invoicing board for today: <strong className="text-text-secondary">{todayStr}</strong>
          </p>
        </div>

        {/* Real-time stats panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
          <div className="bg-secondary-bg/40 border border-card-border/30 rounded-2xl px-4 py-2.5 flex flex-col gap-0.5">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Checked In</span>
            <span className="text-lg font-black text-indigo-500">{totalCheckedInToday}</span>
          </div>
          <div className="bg-secondary-bg/40 border border-card-border/30 rounded-2xl px-4 py-2.5 flex flex-col gap-0.5">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Pending Out</span>
            <span className="text-lg font-black text-amber-500">{pendingCheckout}</span>
          </div>
          <div className="bg-secondary-bg/40 border border-card-border/30 rounded-2xl px-4 py-2.5 flex flex-col gap-0.5">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Completed</span>
            <span className="text-lg font-black text-emerald-500">{completedToday}</span>
          </div>
          <div className="bg-secondary-bg/40 border border-card-border/30 rounded-2xl px-4 py-2.5 flex flex-col gap-0.5">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Revenue Today</span>
            <span className="text-lg font-black text-primary-start">₱{totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 5-Column Kanban Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch flex-1 min-h-[500px]">
        {/* Column 1: APPROVED */}
        <div className="bg-card/40 backdrop-blur-xs border border-card-border/50 rounded-3xl p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-500" />
              <span className="text-xs font-black text-text-primary uppercase tracking-wider">Approved</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 font-bold">{colApproved.length}</span>
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1">
            <AnimatePresence mode="popLayout">
              {colApproved.map((appt) => {
                const checkInGate = getCheckInStatus(appt);
                const isPastEnd = !!currentTime && currentTime > new Date(appt.endTime);
                return (
                  <motion.div
                    key={appt.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group relative p-4 border border-card-border bg-card hover:border-cyan-500/40 rounded-2xl shadow-xs hover:shadow-md transition-all duration-250 flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-extrabold text-text-primary group-hover:text-cyan-500 transition-colors">
                        {appt.patient?.firstName} {appt.patient?.lastName}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                        <Clock className="h-3 w-3 text-cyan-500/80" />
                        <span>{formatClinicTime(appt.startTime)}</span>
                      </div>
                      <div className="text-[10px] text-text-secondary mt-0.5">
                        Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                      </div>
                      <span className="inline-block self-start text-[9px] font-bold px-2 py-0.5 rounded-md bg-secondary-bg text-text-secondary mt-1">
                        {appt.service?.name}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCheckIn(appt.id)}
                        disabled={!checkInGate.enabled || isPending}
                        className="w-full text-[10px] h-8 font-bold bg-cyan-500 hover:bg-cyan-600 border-none rounded-xl"
                      >
                        {checkInGate.enabled ? 'Check In' : checkInGate.message}
                      </Button>
                      {isPastEnd && (
                        <Button
                          onClick={() => handleMarkNoShow(appt.id)}
                          disabled={isPending}
                          variant="secondary"
                          className="text-[10px] px-3 h-8 text-red-500 hover:text-red-600 bg-red-500/5 hover:bg-red-500/10 border-none rounded-xl font-bold"
                        >
                          No-Show
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {colApproved.length === 0 && (
              <div className="text-center py-8 text-[10px] text-text-muted">No arrivals expected.</div>
            )}
          </div>
        </div>

        {/* Column 2: NO-SHOW */}
        <div className="bg-card/40 backdrop-blur-xs border border-card-border/50 rounded-3xl p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs font-black text-text-primary uppercase tracking-wider">No-Show</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-bold">{colNoShow.length}</span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1">
            <AnimatePresence mode="popLayout">
              {colNoShow.map((appt) => (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 border border-red-500/10 hover:border-red-500/30 bg-card rounded-2xl shadow-xs transition-all flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-extrabold text-text-primary">{appt.patient?.firstName} {appt.patient?.lastName}</span>
                    <span className="text-[10px] text-text-muted">Missed slot: {formatClinicTime(appt.startTime)}</span>
                    <span className="text-[10px] text-text-secondary">Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</span>
                  </div>
                  <Button
                    onClick={() => {
                      setRescheduleAppt(appt);
                      setRescheduleDoctor(appt.doctorId);
                    }}
                    variant="secondary"
                    className="w-full text-[10px] h-8 font-bold bg-secondary-bg hover:bg-secondary-bg/80 border-none rounded-xl"
                  >
                    Reschedule
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {colNoShow.length === 0 && (
              <div className="text-center py-8 text-[10px] text-text-muted">No missed slots today.</div>
            )}
          </div>
        </div>

        {/* Column 3: CHECKED IN */}
        <div className="bg-card/40 backdrop-blur-xs border border-card-border/50 rounded-3xl p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-black text-text-primary uppercase tracking-wider">Checked In</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold">{colCheckedIn.length}</span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1">
            <AnimatePresence mode="popLayout">
              {colCheckedIn.map((appt) => (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 border border-card-border hover:border-indigo-500/40 bg-card rounded-2xl shadow-xs transition-all flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-extrabold text-text-primary">{appt.patient?.firstName} {appt.patient?.lastName}</span>
                    <span className="text-[10px] text-indigo-500 font-medium">Currently in Treatment Room</span>
                    <span className="text-[10px] text-text-secondary">Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</span>
                  </div>
                  <Button
                    onClick={() => handleUndoCheckIn(appt.id)}
                    disabled={isPending}
                    variant="secondary"
                    className="w-full text-[10px] h-8 font-bold text-text-muted hover:text-text-secondary bg-secondary-bg hover:bg-secondary-bg/85 border-none rounded-xl"
                  >
                    <Undo2 className="h-3 w-3 mr-1" />
                    Undo Check-In
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {colCheckedIn.length === 0 && (
              <div className="text-center py-8 text-[10px] text-text-muted">No patients in rooms.</div>
            )}
          </div>
        </div>

        {/* Column 4: READY FOR CHECKOUT */}
        <div className="bg-card/40 backdrop-blur-xs border border-card-border/50 rounded-3xl p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-black text-text-primary uppercase tracking-wider">Ready Checkout</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold">{colReadyCheckout.length}</span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1">
            <AnimatePresence mode="popLayout">
              {colReadyCheckout.map((appt) => {
                const draftInvoice = getDraftInvoiceForAppt(appt.id);
                return (
                  <motion.div
                    key={appt.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 border border-amber-500/20 hover:border-amber-500/40 bg-card rounded-2xl shadow-xs transition-all flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-extrabold text-text-primary">{appt.patient?.firstName} {appt.patient?.lastName}</span>
                      <span className="text-[10px] text-text-secondary">{appt.service?.name}</span>
                      {draftInvoice && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-bold">
                          <DollarSign className="h-3 w-3 shrink-0" />
                          <span>₱{draftInvoice.amount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    {draftInvoice && (
                      <Button
                        onClick={() => {
                          setCheckoutInvoice(draftInvoice);
                          setCheckoutAppt(appt);
                        }}
                        className="w-full text-[10px] h-8 font-bold bg-amber-500 hover:bg-amber-600 border-none rounded-xl"
                      >
                        Checkout
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {colReadyCheckout.length === 0 && (
              <div className="text-center py-8 text-[10px] text-text-muted">No pending billing checks.</div>
            )}
          </div>
        </div>

        {/* Column 5: COMPLETED */}
        <div className="bg-card/40 backdrop-blur-xs border border-card-border/50 rounded-3xl p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-black text-text-primary uppercase tracking-wider">Completed</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">{colCompleted.length}</span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1">
            <AnimatePresence mode="popLayout">
              {colCompleted.map((appt) => (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 border border-emerald-500/10 hover:border-emerald-500/30 bg-card rounded-2xl shadow-xs transition-all flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-extrabold text-text-primary">{appt.patient?.firstName} {appt.patient?.lastName}</span>
                    <span className="text-[10px] text-text-secondary">{appt.service?.name}</span>
                    <span className="inline-flex self-start items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/5 text-emerald-600 mt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </span>
                  </div>
                  <Button
                    onClick={() => setViewAppt(appt)}
                    variant="secondary"
                    className="w-full text-[10px] h-8 font-bold bg-secondary-bg hover:bg-secondary-bg/80 border-none rounded-xl"
                  >
                    View Details
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {colCompleted.length === 0 && (
              <div className="text-center py-8 text-[10px] text-text-muted">No completed visits today.</div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: CHECKOUT & INVOICING PANEL */}
      <AnimatePresence>
        {checkoutInvoice && checkoutAppt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-card-border rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setCheckoutInvoice(null);
                  setCheckoutAppt(null);
                }}
                className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary bg-secondary-bg/30 hover:bg-secondary-bg/50 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col gap-1 border-b border-card-border/50 pb-3 pr-6">
                <h2 className="text-base font-black text-text-primary">Checkout & Invoicing</h2>
                <p className="text-xs text-text-muted">Finalize visit record for {checkoutAppt.patient?.firstName} {checkoutAppt.patient?.lastName}</p>
              </div>

              <div className="flex flex-col gap-3 text-xs bg-secondary-bg/25 border border-card-border/30 p-4 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Service:</span>
                  <span className="font-extrabold text-text-primary">{checkoutAppt.service?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Assigned Doctor:</span>
                  <span className="font-extrabold text-text-primary">Dr. {checkoutAppt.doctor?.firstName} {checkoutAppt.doctor?.lastName}</span>
                </div>
                <div className="flex justify-between items-center border-t border-card-border/30 pt-2.5">
                  <span className="text-text-muted">Base Price:</span>
                  <span className="font-black text-text-primary">₱{checkoutInvoice.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-primary-start" />
                    Price Override
                  </label>
                  <Input
                    type="number"
                    placeholder="Override value"
                    value={priceOverride}
                    onChange={(e) => setPriceOverride(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1">
                    <Percent className="h-3 w-3 text-primary-start" />
                    Discount %
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0"
                    value={discountPercent || ''}
                    onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-primary-start" />
                  Payment Method
                </label>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="text-xs rounded-xl bg-card border border-card-border"
                  options={[
                    { value: 'CASH', label: 'Cash Payment' },
                    { value: 'CARD', label: 'Credit/Debit Card' },
                    { value: 'HMO', label: 'HMO / Insurance Carrier' }
                  ]}
                />
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-text-secondary bg-primary-start/5 border border-primary-start/15 p-4 rounded-2xl">
                <span>Final Billing Total:</span>
                <span className="text-lg font-black text-primary-start">₱{calculateFinalPrice().toFixed(2)}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setCheckoutInvoice(null);
                    setCheckoutAppt(null);
                  }}
                  variant="secondary"
                  className="w-full text-xs font-bold h-10 border-none rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckoutComplete}
                  disabled={isPending}
                  className="w-full text-xs font-bold h-10 bg-primary-start hover:bg-primary-end border-none rounded-xl shadow-sm"
                >
                  Complete Checkout
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: RESCHEDULE */}
      <AnimatePresence>
        {rescheduleAppt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-card border border-card-border rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl relative"
            >
              <button 
                onClick={() => setRescheduleAppt(null)}
                className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary bg-secondary-bg/30 hover:bg-secondary-bg/50 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col gap-0.5 border-b border-card-border/50 pb-3">
                <h2 className="text-sm font-black text-text-primary">Reschedule Appointment</h2>
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
                    className="text-xs rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-secondary uppercase">New Start Time</label>
                  <Input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-secondary uppercase">Assign Doctor</label>
                  <Select
                    value={rescheduleDoctor}
                    onChange={(e) => setRescheduleDoctor(e.target.value)}
                    className="text-xs rounded-xl bg-card border border-card-border"
                    options={[
                      { value: rescheduleAppt.doctorId, label: `Keep Original Doctor` }
                    ]}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 mt-1">
                <Button
                  onClick={() => setRescheduleAppt(null)}
                  variant="secondary"
                  className="w-full text-xs font-bold h-9 border-none rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRescheduleSubmit}
                  disabled={isPending || !rescheduleDate || !rescheduleTime}
                  className="w-full text-xs font-bold h-9 bg-primary-start hover:bg-primary-end border-none rounded-xl"
                >
                  Save Schedule
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: VIEW COMPLETED DETAILS */}
      <AnimatePresence>
        {viewAppt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-card border border-card-border rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl relative"
            >
              <button 
                onClick={() => setViewAppt(null)}
                className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary bg-secondary-bg/30 hover:bg-secondary-bg/50 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col gap-0.5 border-b border-card-border/50 pb-3">
                <h2 className="text-sm font-black text-text-primary">Completed Visit Log</h2>
                <p className="text-[11px] text-text-muted">Review checkout records</p>
              </div>

              <div className="flex flex-col gap-3.5 text-xs text-text-secondary bg-secondary-bg/30 p-4 rounded-2xl border border-card-border/30">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Patient:</span>
                  <span className="font-extrabold text-text-primary">{viewAppt.patient?.firstName} {viewAppt.patient?.lastName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Service Rendered:</span>
                  <span className="font-extrabold text-text-primary">{viewAppt.service?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Attending Doctor:</span>
                  <span className="font-extrabold text-text-primary">Dr. {viewAppt.doctor?.firstName} {viewAppt.doctor?.lastName}</span>
                </div>
                {getFinalizedInvoiceForAppt(viewAppt.id) && (
                  <div className="border-t border-card-border/40 pt-3 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Payment Mode:</span>
                      <span className="font-extrabold text-emerald-600 bg-emerald-500/5 px-2.5 py-0.5 rounded-md border border-emerald-500/10">
                        {getFinalizedInvoiceForAppt(viewAppt.id)?.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Discount Applied:</span>
                      <span className="font-extrabold text-text-primary">{getFinalizedInvoiceForAppt(viewAppt.id)?.discountApplied || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Paid Amount:</span>
                      <span className="text-sm font-black text-primary-start">₱{getFinalizedInvoiceForAppt(viewAppt.id)?.amount?.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setViewAppt(null)}
                variant="secondary"
                className="w-full text-xs font-bold h-10 border-none rounded-xl mt-1"
              >
                Close Log
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
