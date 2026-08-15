import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/shared/database/server';
import { Button } from '@/components/ui/button';
import { ReviewForm } from '@/modules/reviews/components/review-form';
import { Link2, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const appointmentId = (ref || '').trim();

  let context: { patientName: string; serviceName: string | null } | null = null;
  let existingReview: { rating: number; comment: string | null } | null = null;

  if (appointmentId) {
    const supabase = await createAdminClient();
    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        date,
        service:services(name),
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
        serviceName: (appointment.service as any)?.name ?? null,
      };

      const { data: review } = await supabase
        .from('reviews')
        .select('rating, comment')
        .eq('appointment_id', appointmentId)
        .maybeSingle();
      existingReview = review ?? null;
    }
  }

  if (!appointmentId || !context) {
    return (
      <div className="w-full max-w-xl mx-auto px-6 py-16 flex flex-col items-center">
        <div className="w-full p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
          <span className="text-4xl"><Link2 className="h-10 w-10 text-slate-400" /></span>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">Invalid Review Link</h1>
            <p className="text-sm text-gray-700 max-w-md">
              This review link is invalid or has expired. Please use the link from your email, or visit our homepage.
            </p>
          </div>
          <Link href="/">
            <Button className="mt-2 w-full sm:w-auto">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (existingReview) {
    return (
      <div className="w-full max-w-xl mx-auto px-6 py-16 flex flex-col items-center">
        <div className="w-full p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Star className="h-8 w-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">Review already submitted</h1>
            <p className="text-sm text-gray-700 max-w-md">
              {context.patientName} — thank you! You have already reviewed this visit.
            </p>
          </div>
          <div className="w-full border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/30 text-xs flex flex-col gap-2.5 text-left">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Rating</span>
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <Star
                    key={v}
                    className={`h-4 w-4 ${
                      v <= existingReview!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </span>
            </div>
            {existingReview.comment && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">Comment</span>
                <span className="font-semibold text-black dark:text-white text-right">{existingReview.comment}</span>
              </div>
            )}
          </div>
          <div className="w-full flex flex-col gap-2">
            <Link href="/book" className="w-full">
              <Button className="w-full bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background">
                Request New Appointment
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button className="w-full bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background">
                Go to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-16 flex flex-col items-center">
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl flex flex-col">
        <div className="px-8 py-10">
          <ReviewForm appointmentId={appointmentId} />
        </div>
      </div>
    </div>
  );
}