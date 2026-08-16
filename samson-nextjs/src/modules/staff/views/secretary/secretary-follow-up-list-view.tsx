import React from 'react';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { formatTimeAgo, formatShortDate } from '@/shared/utils/date.util';
import { HeartHandshake, Send } from 'lucide-react';
import { FollowUpResponsesPanel } from './sub-components/follow-up-responses-panel';

type FollowUpRow = {
  id: string;
  eventType: string;
  payload: Record<string, any>;
  status: string;
  createdAt: string;
  appointment?: {
    date: string;
    patientName: string;
    serviceName: string | null;
  } | null;
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PROCESSED: { label: 'SENT', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  PENDING: { label: 'PENDING', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  PROCESSING: { label: 'PENDING', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  FAILED: { label: 'FAILED', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' },
};

async function loadFollowUps(): Promise<FollowUpRow[]> {
  const supabase = await createAdminClient();

  const { data: events } = await supabase
    .from('outbox')
    .select('id, event_type, payload, status, created_at')
    .eq('event_type', 'APPOINTMENT_CHECKOUT_FOLLOW_UP')
    .order('created_at', { ascending: false })
    .limit(100);

  if (!events || events.length === 0) return [];

  const rows: FollowUpRow[] = events.map((e: any) => ({
    id: e.id,
    eventType: e.event_type,
    payload: (e.payload || {}) as Record<string, any>,
    status: e.status as string,
    createdAt: e.created_at as string,
    appointment: null,
  }));

  const appointmentIds = rows
    .map((r) => (typeof r.payload.appointmentId === 'string' ? r.payload.appointmentId : null))
    .filter((id): id is string => Boolean(id));

  const { data: appointments } = appointmentIds.length > 0
    ? await supabase
        .from('appointments')
        .select(`
          id,
          date,
          service:services(name),
          patient:users!appointments_patient_id_fkey(first_name, last_name),
          guest_contacts!guest_contacts_appointment_id_fkey(first_name, last_name)
        `)
        .in('id', appointmentIds)
    : { data: [] };

  const byId: Map<string, NonNullable<FollowUpRow['appointment']>> = new Map(
  (appointments || []).map((a: any) => {
    const gc = Array.isArray(a.guest_contacts) ? a.guest_contacts[0] : a.guest_contacts;
    return [
      a.id,
      {
        date: a.date,
        patientName: gc
          ? `${gc.first_name} ${gc.last_name}`
          : a.patient
            ? `${a.patient.first_name} ${a.patient.last_name}`
            : 'Patient',
        serviceName: (a.service as any)?.name ?? null,
      },
    ] as const;
  }));

  return rows.map((r) => ({ ...r, appointment: byId.get(r.payload.appointmentId as string) || null }));
}

type ResponseRow = {
  id: string;
  feeling: string | null;
  note: string | null;
  details: Record<string, any> | null;
  createdAt: string;
  status: string;
  source: string;
  updatedAt: string | null;
  patientName: string;
  appointment?: {
    date: string;
    patientName: string;
    serviceName: string | null;
  } | null;
};

async function loadResponses(): Promise<ResponseRow[]> {
  const supabase = await createAdminClient();

  const { data: responses } = await supabase
    .from('checkout_follow_up_responses')
    .select(`
      id,
      feeling,
      note,
      details,
      status,
      source,
      updated_at,
      created_at,
      appointment:appointments(
        date,
        service:services(name),
        patient:users!appointments_patient_id_fkey(first_name, last_name),
        guest_contacts!guest_contacts_appointment_id_fkey(first_name, last_name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return (responses || []).map((r: any) => {
    const a = r.appointment;
    const gc = Array.isArray(a?.guest_contacts) ? a.guest_contacts[0] : a?.guest_contacts;
    const patientName = gc
      ? `${gc.first_name} ${gc.last_name}`
      : a?.patient
        ? `${a.patient.first_name} ${a.patient.last_name}`
        : 'Patient';
    return {
      id: r.id,
      feeling: r.feeling ?? null,
      note: r.note ?? null,
      details: r.details ?? null,
      createdAt: r.created_at as string,
      status: (r as any).status || 'UNRESOLVED',
      source: (r as any).source || 'FORM',
      updatedAt: (r as any).updated_at || null,
      patientName,
      appointment: a
        ? { date: a.date, patientName, serviceName: (a.service as any)?.name ?? null }
        : null,
    };
  });
}

type AppointmentOption = { id: string; label: string };

async function loadManualEntryAppointments(): Promise<AppointmentOption[]> {
  const supabase = await createAdminClient();

  const { data } = await supabase
    .from('appointments')
    .select(`
      id, date,
      patient:users!appointments_patient_id_fkey(first_name, last_name),
      guest_contacts!guest_contacts_appointment_id_fkey(first_name, last_name)
    `)
    .eq('status', 'COMPLETED')
    .order('date', { ascending: false })
    .limit(100);

  return (data || []).map((a: any) => {
    const gc = Array.isArray(a.guest_contacts) ? a.guest_contacts[0] : a.guest_contacts;
    const name = gc
      ? `${gc.first_name} ${gc.last_name}`
      : a.patient
        ? `${a.patient.first_name} ${a.patient.last_name}`
        : 'Patient';
    return { id: a.id, label: `${name} — ${formatShortDate(a.date)}` };
  });
}

export async function SecretaryFollowUpListView() {
  await authorizeRole('SECRETARY');

  const [rows, responses, appointmentOptions] = await Promise.all([
    loadFollowUps(),
    loadResponses(),
    loadManualEntryAppointments(),
  ]);

  return (
    <div
      className="flex flex-col gap-6 flex-1 min-h-0 p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">48h Follow-Up</h1>
        <p className="text-xs text-text-muted">
          Patients who received the &quot;Kamusta&quot; wellbeing check-in email 48 hours after checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section className="rounded-2xl border border-card-border bg-card p-4 flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Send className="size-4 text-muted-foreground/60" />
              <h2 className="text-sm font-semibold text-foreground">Sent</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">{rows.length}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Patients who received the check-in email.</p>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted/30">
                <HeartHandshake className="size-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-foreground">No 48h follow-up emails sent yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Follow-up emails go out automatically 48 hours after a completed checkout.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-xs font-semibold text-muted-foreground border-y border-card-border/40">
                    <th className="py-2.5 pr-3 font-semibold">Patient</th>
                    <th className="py-2.5 pr-3 font-semibold">Email</th>
                    <th className="py-2.5 pr-3 font-semibold">Appointment</th>
                    <th className="py-2.5 pr-3 font-semibold">Status</th>
                    <th className="py-2.5 pl-2 text-right font-semibold">Sent at</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const status = STATUS_LABEL[row.status] || { label: row.status, className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' };
                    return (
                      <tr key={row.id} className="border-b border-card-border/40 last:border-b-0 hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 pr-3 text-xs font-medium text-foreground">
                          {row.appointment?.patientName || 'Patient'}
                        </td>
                        <td className="py-2.5 pr-3 text-xs text-muted-foreground max-w-[200px] truncate" title={row.payload.email}>
                          {row.payload.email || '—'}
                        </td>
                        <td className="py-2.5 pr-3 text-xs text-muted-foreground">
                          {row.appointment
                            ? `${formatShortDate(row.appointment.date)}${row.appointment.serviceName ? ` · ${row.appointment.serviceName}` : ''}`
                            : '—'}
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-2.5 pl-2 text-right text-xs text-muted-foreground font-mono text-[11px] whitespace-nowrap" title={row.createdAt}>
                          {formatTimeAgo(row.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <FollowUpResponsesPanel responses={responses} appointmentOptions={appointmentOptions} />
      </div>
    </div>
  );
}