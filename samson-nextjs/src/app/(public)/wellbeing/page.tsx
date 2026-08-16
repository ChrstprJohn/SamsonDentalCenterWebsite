import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/shared/database/server';
import { Button } from '@/components/ui/button';
import { WellbeingForm } from '@/modules/wellbeing/components/wellbeing-form';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { Link2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WellbeingPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const appointmentId = (ref || '').trim();

  let clinicPhone: string | null = null;
  try {
    const configResponse = await getClinicConfigAction();
    if (configResponse && 'data' in configResponse && configResponse.data) {
      clinicPhone = (configResponse.data as ClinicConfigResponseDto).phone ?? null;
    }
  } catch (err) {
    console.error('Failed to load clinic phone on wellbeing page:', err);
  }

  let context: { patientName: string } | null = null;

  if (appointmentId) {
    const supabase = await createAdminClient();
    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        patient:users!appointments_patient_id_fkey(first_name, last_name),
        guest_contacts!guest_contacts_appointment_id_fkey(first_name, last_name)
      `)
      .eq('id', appointmentId)
      .maybeSingle();

    if (appointment) {
      const gc = Array.isArray(appointment.guest_contacts) ? appointment.guest_contacts[0] : appointment.guest_contacts;
      context = {
        patientName: gc
          ? `${gc.first_name} ${gc.last_name}`
          : appointment.patient
            ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
            : 'Valued Patient',
      };
    }
  }

  if (!appointmentId || !context) {
    return (
      <div className="w-full max-w-xl mx-auto px-6 py-16 flex flex-col items-center">
        <div className="w-full p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
          <span className="text-4xl"><Link2 className="h-10 w-10 text-slate-400" /></span>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">Invalid Check-In Link</h1>
            <p className="text-sm text-gray-700 max-w-md">
              This check-in link is invalid or has expired. Please use the link from your email, or visit our homepage.
            </p>
          </div>
          <Link href="/">
            <Button className="mt-2 w-full sm:w-auto">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-16 flex flex-col items-center">
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl flex flex-col">
        <div className="px-8 py-10">
          <WellbeingForm appointmentId={appointmentId} patientName={context.patientName} clinicPhone={clinicPhone} />
        </div>
      </div>
    </div>
  );
}