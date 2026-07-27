'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, CalendarCheck2, ClipboardCheck } from 'lucide-react';
import { SidebarHeader, SidebarInput, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';
import { usePastAppointmentFollowUps } from '../../hooks/secretary/use-past-appointment-follow-ups';
import { NoShowResolutionModal } from './sub-components/no-show-resolution-modal';

function patientName(appointment: AppointmentDto) {
  if (appointment.dependent) return `${appointment.dependent.firstName} ${appointment.dependent.lastName}`;
  if (appointment.patient) return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  if (appointment.guestContact) return `${appointment.guestContact.firstName || ''} ${appointment.guestContact.lastName || ''}`.trim() || 'Guest Patient';
  return 'Guest Patient';
}

function daysWaiting(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const now = new Date();
  const days = Math.max(1, Math.floor((now.getTime() - start.getTime()) / 86_400_000));
  return `${days} day${days === 1 ? '' : 's'} waiting`;
}

export function SecretaryPastAppointmentFollowUpsView() {
  const view = usePastAppointmentFollowUps();
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const visibleAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return view.list;
    return view.list.filter((appointment) =>
      [patientName(appointment), appointment.service?.name, appointment.doctor ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : '']
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [search, view.list]);

  const colMobile = (mode: 'list' | 'detail') => mobileView === mode ? 'flex' : 'hidden';

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden">
      <section className={`lg:w-[350px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar min-h-0 overflow-hidden ${colMobile('list')} lg:flex`}>
        <SidebarHeader className="gap-3.5 border-b border-card-border/40 p-4 shrink-0">
          <div className="flex items-center gap-2 text-base font-medium text-foreground">
            <div className="lg:hidden"><SidebarTrigger /></div>
            <span>Past Follow-ups</span>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">Appointments that still need staff action.</p>
          <SidebarInput placeholder="Search patient or service..." value={search} onChange={(event) => setSearch(event.target.value)} className="rounded-md" />
          <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
            <button onClick={() => view.selectTab('missed-checkouts')} className={`flex-1 h-9 text-[11px] rounded-xl font-semibold ${view.activeTab === 'missed-checkouts' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Checkouts ({view.missedCheckouts.length})
            </button>
            <button onClick={() => view.selectTab('no-show-follow-ups')} className={`flex-1 h-9 text-[11px] rounded-xl font-semibold ${view.activeTab === 'no-show-follow-ups' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              No-shows ({view.unresolvedNoShows.length})
            </button>
          </div>
        </SidebarHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {view.isLoading ? <div className="p-6 text-center text-sm text-muted-foreground">Loading follow-ups…</div> : null}
          {view.error ? <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{view.error}</div> : null}
          {!view.isLoading && !view.error && visibleAppointments.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Nothing needs follow-up in this section.</div>
          ) : visibleAppointments.map((appointment) => (
            <button key={appointment.id} onClick={() => { view.setSelectedAppointmentId(appointment.id); setMobileView('detail'); }} className={`flex w-full flex-col gap-2 border-b border-card-border/40 p-4 text-left transition-colors hover:bg-sidebar-accent ${view.selectedAppointmentId === appointment.id ? 'bg-sidebar-accent' : ''}`}>
              <div className="flex items-center gap-2"><span className="font-medium text-sm truncate">{patientName(appointment)}</span><span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold ${appointment.status === 'CHECKED_IN' ? 'bg-cyan-500/10 text-cyan-700' : 'bg-amber-500/10 text-amber-700'}`}>{appointment.status === 'CHECKED_IN' ? 'CHECKED IN' : 'NO SHOW'}</span></div>
              <span className="text-xs font-medium">{appointment.service?.name || 'Treatment'}</span>
              <div className="flex justify-between gap-2 text-[11px] text-muted-foreground"><span>{formatShortDate(appointment.date)}</span><span>{daysWaiting(appointment.date)}</span></div>
            </button>
          ))}
        </div>
      </section>

      {view.selectedAppointment ? <FollowUpDetail appointment={view.selectedAppointment} view={view} onBack={() => setMobileView('list')} className={`${colMobile('detail')} lg:flex`} /> : (
        <div className="flex flex-1 flex-col items-center justify-center bg-muted/10 text-center max-lg:hidden"><ClipboardCheck className="size-8 text-muted-foreground/50 mb-3" /><p className="font-medium">No appointment selected</p><p className="mt-1 text-sm text-muted-foreground">Select a past appointment to finish its follow-up.</p></div>
      )}
      <NoShowResolutionModal view={view} />
    </div>
  );
}

function FollowUpDetail({ appointment, view, onBack, className }: { appointment: AppointmentDto; view: ReturnType<typeof usePastAppointmentFollowUps>; onBack: () => void; className: string }) {
  const isMissedCheckout = appointment.status === 'CHECKED_IN';
  return <section className={`flex flex-1 min-w-0 flex-col min-h-0 ${className}`}>
    <header className="border-b border-card-border/40 p-4"><div className="flex items-center gap-2"><button onClick={onBack} className="lg:hidden text-muted-foreground"><ArrowLeft className="size-5" /></button><div><p className="text-base font-medium">{isMissedCheckout ? 'Missed Checkout' : 'No-show Follow-up'}</p><p className="text-xs text-muted-foreground">Ref #{appointment.id.slice(0, 8)}</p></div></div></header>
    <main className="flex-1 overflow-y-auto p-5 max-w-2xl w-full">
      <div className="rounded-xl border border-card-border/50 bg-card p-5 space-y-5">
        <div><p className="text-lg font-semibold">{patientName(appointment)}</p><p className="text-sm text-muted-foreground mt-1">{appointment.service?.name || 'Treatment'}{appointment.doctor ? ` · Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : ''}</p></div>
        <div className="grid gap-3 sm:grid-cols-2"><Info label="Appointment date" value={formatShortDate(appointment.date)} /><Info label="Scheduled time" value={appointment.startTime ? formatClinicTime(appointment.startTime) : 'Not recorded'} /><Info label="Waiting" value={daysWaiting(appointment.date)} /><Info label="Current status" value={isMissedCheckout ? 'Checked in, not checked out' : 'No-show awaiting follow-up'} /></div>
        {appointment.statusReason ? <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">Latest note: </span>{appointment.statusReason}</div> : null}
        <div className="border-t border-card-border/40 pt-5"><p className="text-sm font-medium mb-3">Action</p>{isMissedCheckout ? <Button onClick={() => view.completeMissedCheckout(appointment)} disabled={view.isPending} className="gap-2"><CalendarCheck2 className="size-4" />{view.isPending ? 'Checking out…' : 'Check Out Appointment'}</Button> : <Button onClick={() => view.setResolveAppt(appointment)} disabled={view.isPending} variant="outline" className="gap-2"><AlertCircle className="size-4" />Resolve No-show</Button>}</div>
      </div>
    </main>
  </section>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-card-border/40 p-3"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>; }
