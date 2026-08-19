import React from 'react';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { formatTimeAgo, formatShortDate } from '@/shared/utils/date.util';
import { Send, MessageSquare } from 'lucide-react';
import { FollowUpResponsesPanel } from './sub-components/follow-up-responses-panel';

type FollowUpRow = {
  id: string;
  eventType: string;
  payload: Record<string, any>;
  status: string;
  createdAt: string;
};

async function loadFollowUps(): Promise<FollowUpRow[]> {
  const supabase = await createAdminClient();

  const { data: events } = await supabase
    .from('outbox')
    .select('id, event_type, payload, status, created_at')
    .eq('event_type', 'APPOINTMENT_CHECKOUT_FOLLOW_UP')
    .order('created_at', { ascending: false })
    .limit(100);

  return (events || []).map((e: any) => ({
    id: e.id,
    eventType: e.event_type,
    payload: (e.payload || {}) as Record<string, any>,
    status: e.status as string,
    createdAt: e.created_at as string,
  }));
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
  patientName: string | null;
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
      patient_name,
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
        : r.patient_name || null;
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

  const replied = responses.length;

  return (
    <div
      className="flex flex-col gap-6 flex-1 min-h-0 p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">48h Aftercare</h1>
        <p className="text-xs text-text-muted">
          The aftercare email goes out 48 hours after checkout; log any follow-up contact that needs attention.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-card-border bg-card p-4 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted/30">
            <Send className="size-4 text-muted-foreground/60" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-foreground">{rows.length}</span>
            <span className="text-xs text-muted-foreground">48h aftercare email sent</span>
          </div>
        </div>
        <div className="rounded-2xl border border-card-border bg-card p-4 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted/30">
            <MessageSquare className="size-4 text-muted-foreground/60" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-foreground">{replied}</span>
            <span className="text-xs text-muted-foreground">responses</span>
          </div>
        </div>
      </div>

      <FollowUpResponsesPanel responses={responses} appointmentOptions={appointmentOptions} />
    </div>
  );
}