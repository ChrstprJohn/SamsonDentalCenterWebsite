"use server";

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { authorizeRole } from '@/shared/auth/auth.util';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';

const resendEmailActionSchema = z.object({
  id: z.string().uuid(),
});

export async function resendEmailAction(data: { id: string }) {
  try {
    const user = await authorizeRole('SECRETARY');
    console.log('Authorized SECRETARY user for resend:', user.id);

    const { id } = resendEmailActionSchema.parse(data);

    // Setup DB client
    const supabase = await createAdminClient();

    // Re-verify the event is indeed in a FAILED or PENDING state
    const { data: event, error: fetchError } = await supabase
      .from('outbox')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !event) {
      return { error: 'Email log not found.' };
    }

    // Refresh payload with current email from appointment
    const eventPayload = (event as any).payload || {};
    const apptId = eventPayload.appointmentId;
    if (apptId) {
      const { data: gc } = await supabase
        .from('guest_contacts')
        .select('email')
        .eq('appointment_id', apptId)
        .maybeSingle();

      const { data: appt } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('id', apptId)
        .single();

      let freshEmail = gc?.email?.trim();
      if (!freshEmail && appt?.patient_id) {
        const { data: user } = await supabase
          .from('users')
          .select('email')
          .eq('id', appt.patient_id)
          .single();
        freshEmail = user?.email?.trim();
      }

      if (freshEmail) {
        eventPayload.email = freshEmail;
        eventPayload.guestEmail = freshEmail;
      }
    }

    // Force reset retry_count, set status to PENDING, and update payload with fresh email
    const { error: updateError } = await supabase
      .from('outbox')
      .update({
        status: 'PENDING',
        retry_count: 0,
        error_logs: null,
        payload: eventPayload,
      })
      .eq('id', id);

    if (updateError) {
      return { error: `Failed to queue email resend: ${updateError.message}` };
    }

    // Trigger dispatcher synchronously for quick feedback
    bootstrapEventSubscribers();
    const dispatch = globalOutboxDispatcher(supabase);
    await dispatch();

    // Verify it changed to PROCESSED
    const { data: updatedEvent } = await supabase
      .from('outbox')
      .select('status, error_logs')
      .eq('id', id)
      .single();

    if (updatedEvent?.status !== 'PROCESSED') {
      await supabase
        .from('outbox')
        .update({
          status: 'FAILED',
          retry_count: 3,
        })
        .eq('id', id);

      return { error: `Email sending failed again: ${updatedEvent?.error_logs || 'Unknown error'}` };
    }

    return { data: { success: true } };
  } catch (err: any) {
    return { error: err.message || 'Failed to resend email' };
  }
}
