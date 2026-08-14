'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { getClinicAppointmentsPageAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments-page.action';
import { getInquiriesPageAction } from '@/modules/appointments/actions/booking/get-inquiries-page.action';
import { getNotificationsPageAction } from '@/modules/notifications/actions/management/list-notifications-page.action';
import { createClient } from '@/shared/database/client';
import { getTodayLocalDateStr } from '@/shared/utils/date.util';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  RefreshCw,
  ChevronRight,
  Loader2,
  Clock,
  ArrowUpRight,
  Settings,
  Mail,
  Stethoscope,
  Layers,
  FileText,
  ShieldCheck,
  User,
  CheckCircle2,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtTime(t: string | null | undefined) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function fmtDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function fmtShortDate(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getInitials(name: string) {
  if (!name) return 'P';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtClock(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getPatientName(appt: AppointmentDto) {
  const patient = appt.patient;
  const dep = appt.dependent;
  const guest = appt.guestContact;
  if (dep) return `${dep.firstName} ${dep.lastName}`;
  if (patient) return `${patient.firstName} ${patient.lastName}`;
  if (guest) return `${guest.firstName} ${guest.lastName}`;
  return 'Unknown Patient';
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  APPROVED:           { label: 'Scheduled',         color: 'text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400' },
  CHECKED_IN:         { label: 'Checked In',        color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20 dark:text-cyan-400' },
  TREATMENT_RENDERED: { label: 'Awaiting Checkout', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400' },
  COMPLETED:          { label: 'Completed',          color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400' },
  NO_SHOW:            { label: 'No-Show',            color: 'text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400' },
  CANCELLED:          { label: 'Cancelled',          color: 'text-slate-500 bg-slate-500/10 border-slate-500/20 dark:text-slate-400' },
  REJECTED:           { label: 'Rejected',           color: 'text-slate-500 bg-slate-500/10 border-slate-500/20 dark:text-slate-400' },
  RESCHEDULE_REQUESTED: { label: 'Reschedule Req',   color: 'text-purple-600 bg-purple-500/10 border-purple-500/20 dark:text-purple-400' },
};

// ─── Compact Quick Links Data ────────────────────────────────────────────────

const COMPACT_QUICK_LINKS = [
  {
    id: 'email-designs',
    title: 'Email Templates',
    category: 'Templates',
    href: '/secretary-v2/email-designs',
    icon: Mail,
  },
  {
    id: 'clinic-settings',
    title: 'Clinic Settings',
    category: 'Hours & Config',
    href: '/secretary-v2/clinic-settings',
    icon: Settings,
  },
  {
    id: 'doctors',
    title: 'Dentist Roster',
    category: 'Staff & Schedules',
    href: '/secretary-v2/doctors',
    icon: Stethoscope,
  },
  {
    id: 'services',
    title: 'Service Catalog',
    category: 'Procedures & Rates',
    href: '/secretary-v2/services',
    icon: Layers,
  },
  {
    id: 'delivery-logs',
    title: 'Delivery Logs',
    category: 'Email Dispatch',
    href: '/secretary-v2/delivery-logs',
    icon: FileText,
  },
  {
    id: 'audits',
    title: 'Audit Trail',
    category: 'Activity Logs',
    href: '/secretary-v2/audits',
    icon: ShieldCheck,
  },
  {
    id: 'profile',
    title: 'My Profile',
    category: 'Account Details',
    href: '/secretary-v2/profile',
    icon: User,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function SecretaryOverviewView() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const todayStr = getTodayLocalDateStr();

  // ── State ──────────────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unresolvedPastCount, setUnresolvedPastCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);

  const realtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // ── Data Fetch ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    const requestId = ++requestIdRef.current;
    if (!silent) setIsLoading(true);
    try {
      const [apptRes, inqRes, notifRes, unresolvedRes] = await Promise.all([
        getClinicAppointmentsAction({ date: todayStr }),
        getInquiriesPageAction({ status: 'NEW', countOnly: true, limit: 1, sortDirection: 'desc' }),
        getNotificationsPageAction({ status: 'UNREAD', limit: 1 }),
        getClinicAppointmentsPageAction({
          limit: 1,
          dateBefore: todayStr,
          statuses: ['CHECKED_IN', 'NO_SHOW'],
          noShowUnresolvedOnly: true,
          countOnly: true,
        }),
      ]);
      if (requestId !== requestIdRef.current) return;
      if (apptRes.success && apptRes.data) setAppointments(apptRes.data);
      if (inqRes.success && inqRes.data) {
        setPendingRequestsCount(inqRes.data.total ?? 0);
      }
      if (notifRes.success && notifRes.data) {
        setUnreadNotificationsCount(notifRes.data.total ?? 0);
      }
      if (unresolvedRes.success && unresolvedRes.data) {
        setUnresolvedPastCount(unresolvedRes.data.total ?? 0);
      }
    } catch {
      // silent fail — non-blocking dashboard
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [todayStr]);

  // ── Realtime ───────────────────────────────────────────────────────────────
  const scheduleRealtimeRefresh = useCallback(() => {
    if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
    realtimeTimerRef.current = setTimeout(() => {
      realtimeTimerRef.current = null;
      void fetchData(true);
    }, 400);
  }, [fetchData]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  useEffect(() => {
    const channel = supabase
      .channel('overview-tracker')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, scheduleRealtimeRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointment_inquiries' }, scheduleRealtimeRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, scheduleRealtimeRefresh)
      .subscribe();
    return () => {
      if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, scheduleRealtimeRefresh]);

  // ── Clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // ── Derived Counts ─────────────────────────────────────────────────────────
  const toNaiveLocal = (date: string, time: string | null) => {
    if (!time) return null;
    return new Date(`${date}T${time.substring(0, 5)}:00`);
  };
  const isPastEnd = (appt: AppointmentDto) => {
    if (!now || !appt.endTime) return false;
    const end = toNaiveLocal(appt.date, appt.endTime);
    return end ? now > end : false;
  };

  const checkedInToday   = appointments.filter(a => a.status === 'CHECKED_IN');
  const noShowToday      = appointments.filter(a => a.status === 'NO_SHOW' || (a.status === 'APPROVED' && isPastEnd(a)));

  // Today's full sorted timeline (all active statuses)
  const timeline = useMemo(() => {
    return [...appointments]
      .filter(a => !['CANCELLED', 'REJECTED'].includes(a.status))
      .sort((a, b) => {
        const ta = a.startTime ?? '';
        const tb = b.startTime ?? '';
        return ta.localeCompare(tb);
      });
  }, [appointments]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const greeting = (() => {
    if (!now) return 'Welcome back';
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div
      className="flex flex-col h-full min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      {/* ── Top Clean Header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-border/80 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-base font-semibold tracking-tight text-foreground leading-tight">{greeting}</h1>
              <p className="text-xs text-muted-foreground">{fmtDate(todayStr)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {now && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono tabular-nums select-none bg-muted/50 px-2.5 py-1 rounded-md border border-border/60">
                <Clock className="size-3.5 shrink-0 opacity-70" />
                <span>{fmtClock(now)}</span>
              </div>
            )}
            <button
              onClick={() => void fetchData(true)}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 px-2.5 py-1 rounded-md border border-border/60 bg-muted/30 hover:bg-muted cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Scrollable Content ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 px-4 sm:px-6 pt-5 pb-24 sm:pb-32 max-w-7xl mx-auto w-full flex flex-col gap-6">

        {/* ── High-Level Clinic Pulse Metrics Row (Requested 4 KPI Pillars) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Appointments Today */}
          <BentoMetric
            label="Total Appointments"
            value={isLoading ? null : timeline.length}
            sub="Open Schedule"
            badge={timeline.length > 0 ? `${timeline.length} Scheduled` : 'No Appts'}
            badgeColor="text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400"
            href="/secretary-v2/appointments"
            router={router}
          />

          {/* Card 2: Appointment Requests */}
          <BentoMetric
            label="Appointment Requests"
            value={isLoading ? null : pendingRequestsCount}
            sub="Open Requests Queue"
            badge={pendingRequestsCount > 0 ? `${pendingRequestsCount} Pending` : 'All Clear'}
            badgeColor={pendingRequestsCount > 0 ? 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400' : 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400'}
            href="/secretary-v2/pending"
            router={router}
          />

          {/* Card 3: Notifications */}
          <BentoMetric
            label="Notifications"
            value={isLoading ? null : unreadNotificationsCount}
            sub="Open Notifications"
            badge={unreadNotificationsCount > 0 ? `${unreadNotificationsCount} Unread` : 'All Read'}
            badgeColor={unreadNotificationsCount > 0 ? 'text-violet-600 bg-violet-500/10 border-violet-500/20 dark:text-violet-400' : 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400'}
            href="/secretary-v2/notifications"
            router={router}
          />

          {/* Card 4: Unresolved Past Appointments */}
          <BentoMetric
            label="Unresolved Appointments"
            value={isLoading ? null : unresolvedPastCount}
            sub="Open Directory Resolution"
            badge={unresolvedPastCount > 0 ? `${unresolvedPastCount} Action Req` : 'All Clear'}
            badgeColor={unresolvedPastCount > 0 ? 'text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400' : 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400'}
            href="/secretary-v2/appointments?tab=needs-attention"
            router={router}
          />
        </div>

        {/* ── Core Bento Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">

          {/* Left Column: Today's Timeline (5 cols) */}
          <div className="xl:col-span-5 flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground">Today's Schedule</h2>
                <p className="text-[11px] text-muted-foreground">Chronological appointment agenda</p>
              </div>
              <button
                onClick={() => router.push('/secretary-v2/appointments')}
                className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
              >
                View all
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            <div className="border border-border/80 rounded-xl overflow-hidden bg-card shadow-xs flex-1 flex flex-col min-h-[460px]">
              {isLoading ? (
                <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground gap-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-xs">Loading appointments…</span>
                </div>
              ) : timeline.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-20 text-center text-xs text-muted-foreground px-4">
                  No appointments scheduled for today.
                </div>
              ) : (
                <div className="divide-y divide-border/60 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                  {timeline.map((appt) => {
                    const meta = STATUS_META[appt.status] ?? { label: appt.status, color: 'text-muted-foreground bg-muted border-border' };
                    const name = getPatientName(appt);
                    const doctorName = appt.doctor
                      ? `Dr. ${appt.doctor.lastName}`
                      : 'Unassigned';
                    const serviceName = appt.service?.name ?? 'General Consultation';

                    return (
                      <button
                        key={appt.id}
                        onClick={() => router.push(`/secretary-v2/appointments?appointmentId=${appt.id}`)}
                        className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-muted/40 transition-colors text-left group cursor-pointer"
                      >
                        {/* Time block */}
                        <div className="shrink-0 w-16 text-left">
                          <span className="text-xs font-mono font-medium text-muted-foreground tabular-nums leading-tight">
                            {fmtTime(appt.startTime)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                            {name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate leading-snug mt-0.5">
                            {doctorName} · <span className="text-foreground/75 font-medium">{serviceName}</span>
                          </p>
                        </div>

                        {/* Status badge */}
                        <span className={`shrink-0 text-[11px] font-medium px-2.5 py-0.5 rounded-full border leading-tight ${meta.color}`}>
                          {meta.label}
                        </span>

                        <ChevronRight className="size-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Operations Hub (7 cols) */}
          <div className="xl:col-span-7 flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground">Operations Hub</h2>
                <p className="text-[11px] text-muted-foreground">Live clinic floor & active check-in queues</p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">Realtime</span>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              {/* ── Active Checked-In & Needs Attention (No-Shows) Side-by-Side ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 h-full">

                {/* Left Card: Active Checked-In Patients */}
                <div className="p-4 rounded-xl border border-border/80 bg-card shadow-2xs flex flex-col justify-between h-full min-h-[460px]">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-xs sm:text-sm font-semibold text-foreground">Checked In</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border leading-tight ${checkedInToday.length > 0 ? 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20 dark:text-cyan-400' : 'text-muted-foreground bg-muted border-border'}`}>
                          {checkedInToday.length > 0 ? `${checkedInToday.length} In Clinic` : 'Clear'}
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 flex flex-col justify-start">
                      {isLoading ? (
                        <div className="py-16 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Checking queue…</span>
                        </div>
                      ) : checkedInToday.length === 0 ? (
                        <div className="py-16 text-center flex flex-col items-center justify-center gap-1 text-muted-foreground">
                          <CheckCircle2 className="size-5 text-emerald-500/70" />
                          <p className="text-xs font-medium text-foreground/80">No patients checked in</p>
                          <p className="text-[11px] text-muted-foreground">Lobby & operatories are currently clear.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 w-full">
                          {checkedInToday.map((appt) => (
                            <button
                              key={appt.id}
                              onClick={() => router.push(`/secretary-v2/check-in?openCheckout=${appt.id}`)}
                              className="w-full text-left p-2.5 rounded-lg border border-border/60 hover:border-cyan-500/40 bg-muted/20 hover:bg-cyan-500/5 transition-all flex items-center justify-between gap-2 cursor-pointer group"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-foreground truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                  {getPatientName(appt)}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                  {appt.doctor ? `Dr. ${appt.doctor.lastName}` : 'Unassigned'} · {appt.service?.name || 'Treatment'}
                                </p>
                              </div>
                              <div className="flex flex-col items-end shrink-0 gap-0.5">
                                <span className="text-[10px] font-mono text-muted-foreground">{fmtTime(appt.startTime)}</span>
                                <span className="text-[9px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                                  In Clinic
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/secretary-v2/check-in')}
                    className="w-full pt-2.5 border-t border-border/40 flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                  >
                    <span>Open Check-In Board</span>
                    <ArrowUpRight className="size-3.5 text-muted-foreground/60 group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>

                {/* Right Card: Needs Attention (Today's No-Shows to Resolve) */}
                <div className="p-4 rounded-xl border border-border/80 bg-card shadow-2xs flex flex-col justify-between h-full min-h-[460px]">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${noShowToday.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-xs sm:text-sm font-semibold text-foreground">Needs Attention</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border leading-tight ${noShowToday.length > 0 ? 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400' : 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400'}`}>
                          {noShowToday.length > 0 ? `${noShowToday.length} No-Show` : 'All Clear'}
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 flex flex-col justify-start">
                      {isLoading ? (
                        <div className="py-16 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Checking slots…</span>
                        </div>
                      ) : noShowToday.length === 0 ? (
                        <div className="py-16 text-center flex flex-col items-center justify-center gap-1 text-muted-foreground">
                          <CheckCircle2 className="size-5 text-emerald-500/70" />
                          <p className="text-xs font-medium text-foreground/80">No missed slots today</p>
                          <p className="text-[11px] text-muted-foreground">All appointments on time or resolved.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 w-full">
                          {noShowToday.map((appt) => {
                            const isResolved = !!appt.noShowResolvedAt;
                            return (
                              <button
                                key={appt.id}
                                onClick={() => router.push('/secretary-v2/check-in')}
                                className="w-full text-left p-2.5 rounded-lg border border-border/60 hover:border-amber-500/40 bg-muted/20 hover:bg-amber-500/5 transition-all flex items-center justify-between gap-2 cursor-pointer group"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {getPatientName(appt)}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                    {appt.doctor ? `Dr. ${appt.doctor.lastName}` : 'Unassigned'} · {appt.service?.name || 'Treatment'}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end shrink-0 gap-0.5">
                                  <span className="text-[10px] font-mono text-muted-foreground">{fmtTime(appt.startTime)}</span>
                                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${isResolved ? 'text-emerald-700 bg-emerald-500/10' : 'text-amber-700 bg-amber-500/10'}`}>
                                    {isResolved ? 'Resolved' : 'No-Show'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/secretary-v2/check-in')}
                    className="w-full pt-2.5 border-t border-border/40 flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                  >
                    <span>Resolve in Check-In</span>
                    <ArrowUpRight className="size-3.5 text-muted-foreground/60 group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* ── Compact Quick Navigation Section ─────────────────────────────────── */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Quick Navigation</h2>
            <span className="text-xs text-muted-foreground font-medium">Clinic Management & Tools</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {COMPACT_QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => router.push(link.href)}
                  className="group flex flex-col justify-between p-3.5 rounded-xl border border-border/75 bg-card hover:bg-muted/40 hover:border-border hover:shadow-xs transition-all text-left relative overflow-hidden h-full min-h-[88px] cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-1 w-full mb-1.5">
                    <div className="w-7.5 h-7.5 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-muted transition-colors">
                      <Icon className="size-4" />
                    </div>
                    <ArrowUpRight className="size-3 text-muted-foreground/40 group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
                      {link.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate mt-0.5 font-medium">
                      {link.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generous bottom scroll buffer */}
        <div className="h-10 shrink-0 select-none" aria-hidden="true" />

      </div>
    </div>
  );
}

// ─── Bento KPI Metric Component ───────────────────────────────────────────────

function BentoMetric({
  label,
  value,
  sub,
  badge,
  badgeColor,
  urgent,
  href,
  router,
}: {
  label: string;
  value: number | null;
  sub: string;
  badge: string;
  badgeColor: string;
  urgent?: boolean;
  href: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <button
      onClick={() => router.push(href)}
      className="group flex flex-col justify-between p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/30 hover:border-border hover:shadow-xs transition-all text-left relative overflow-hidden shadow-2xs h-full cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2 w-full mb-2">
        <span className="text-xs sm:text-[13px] text-muted-foreground font-medium truncate">{label}</span>
        <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border leading-tight ${badgeColor}`}>
          {badge}
        </span>
      </div>

      <div className="my-1">
        {value === null ? (
          <div className="h-7 w-12 bg-muted animate-pulse rounded" />
        ) : (
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums leading-none">
            {value}
          </span>
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-border/40 w-full flex items-center justify-between">
        <span className="text-xs font-medium truncate text-muted-foreground group-hover:text-foreground transition-colors">
          {sub}
        </span>
        <ArrowUpRight className="size-3.5 text-muted-foreground/60 group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </button>
  );
}


