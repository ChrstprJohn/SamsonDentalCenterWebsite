"use server";

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { outboxCommands } from '@/shared/outbox/outbox.commands';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { authorizeRole } from '@/shared/auth/auth.util';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';

const resendEmailActionSchema = z.object({
  id: z.string().uuid(),
});

export async function resendEmailAction(data: { id: string }) {
  try {
    await authorizeRole('SECRETARY');

    const { id } = resendEmailActionSchema.parse(data);

    // Setup DB client
    const supabase = await createAdminClient();

    // Re-verify the event and fetch only the fields needed to enqueue a retry.
    const { data: event, error: fetchError } = await supabase
      .from('outbox')
      .select('id, event_type, payload, status, retry_count')
      .eq('id', id)
      .single();

    if (fetchError || !event) {
      return { error: 'Email log not found.' };
    }

    const eventStatus = event.status as string;
    if (!['FAILED', 'PENDING', 'PROCESSED'].includes(eventStatus)) {
      return { error: 'This communication cannot be resent in its current state.' };
    }

    // Refresh payload with current email from appointment
    const eventPayload = (event.payload || {}) as Record<string, unknown>;
    const apptId = typeof eventPayload.appointmentId === 'string' ? eventPayload.appointmentId : null;
    const eventType = event.event_type || '';
    if (!eventType) return { error: 'Communication event type is missing.' };
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

    const outbox = outboxCommands(supabase);
    let eventId = id;

    if (eventStatus === 'PROCESSED') {
      // Already sent — create new record for fresh attempt
      const emitted = await outbox.emitEvent(eventType, eventPayload);
      eventId = emitted.id;
    } else {
      // FAILED or PENDING — reuse same record, reset retry counter
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
    }

    // Dispatch only the event just re-queued/created. Do not claim unrelated
    // pending events during a user-initiated resend.
    bootstrapEventSubscribers();
    const dispatch = globalOutboxDispatcher(supabase, true, eventId);
    await dispatch();

    return { data: { success: true } };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Failed to resend email' };
  }
}
