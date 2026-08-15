import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/shared/database/server';
import { Button } from '@/components/ui/button';
import { ReviewForm } from '@/modules/reviews/components/review-form';
import { CheckCircle2, Link2, Star } from 'lucide-react';

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
        <div className="w-full p-8 rounded-3xl border border-card-border bg-card/75 text-center flex flex-col items-center gap-4">
          <span className="text-4xl"><Link2 className="h-10 w-10 text-text-muted" /></span>
          <h1 className="text-xl font-bold text-text-primary">Invalid Review Link</h1>
          <p className="text-sm text-text-muted">
            This review link is invalid or has expired. Please use the link from your email, or visit our homepage.
          </p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (existingReview) {
    return (
      <div className="w-full max-w-xl mx-auto px-6 py-16 flex flex-col items-center">
        <div className="w-full p-8 rounded-3xl border border-card-border bg-card shadow-2xl text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Review already submitted</h1>
          <p className="text-sm text-text-muted">
            {context.patientName} — thank you! You have already reviewed this visit.
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <Star
                key={v}
                className={`h-6 w-6 ${
                  v <= existingReview!.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          {existingReview.comment && (
            <p className="text-sm text-text-secondary leading-relaxed max-w-md">{existingReview.comment}</p>
          )}
          <Link href="/">
            <Button className="bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-16 flex flex-col items-center">
      <div className="w-full overflow-hidden rounded-3xl border border-card-border bg-card shadow-2xl flex flex-col">
        <div className="px-8 py-10">
          <ReviewForm appointmentId={appointmentId} />
        </div>
      </div>
    </div>
  );
}