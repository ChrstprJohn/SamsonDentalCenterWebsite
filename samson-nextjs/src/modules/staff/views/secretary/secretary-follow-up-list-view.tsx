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
  patientPhone?: string | null;
  appointment?: {
    id: string;
    date: string;
    patientName: string;
    serviceName: string | null;
    doctorName: string | null;
    phone: string | null;
  } | null;
};

async function loadResponses(): Promise<ResponseRow[]> {
  const supabase = await createAdminClient();

  const { data: responses, error: respError } = await supabase
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
        id,
        date,
        service:services(name),
        doctor:users!appointments_doctor_id_fkey(first_name, last_name),
        patient:users!appointments_patient_id_fkey(first_name, last_name, phone_number),
        guest_contacts!guest_contacts_appointment_id_fkey(first_name, last_name, phone_number)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (respError) {
    console.error('[Aftercare Check-Ins] Error loading responses:', respError);
  }

  return (responses || []).map((r: any) => {
    const a = r.appointment;
    const gc = Array.isArray(a?.guest_contacts) ? a.guest_contacts[0] : a?.guest_contacts;
    const patientName = gc
      ? `${gc.first_name} ${gc.last_name}`
      : a?.patient
        ? `${a.patient.first_name} ${a.patient.last_name}`
        : r.patient_name || null;
    const phone = gc?.phone_number || a?.patient?.phone_number || null;
    const doctorName = a?.doctor
      ? `Dr. ${a.doctor.first_name} ${a.doctor.last_name}`
      : null;

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
      patientPhone: phone,
      appointment: a
        ? {
            id: a.id,
            date: a.date,
            patientName,
            serviceName: (a.service as any)?.name ?? null,
            doctorName,
            phone,
          }
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

  return <FollowUpResponsesPanel responses={responses} appointmentOptions={appointmentOptions} />;
}