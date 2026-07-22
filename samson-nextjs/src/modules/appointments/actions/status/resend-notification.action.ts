'use server';

import { createClient, createAdminClient } from '@/shared/database/server';
import { outboxCommands } from '@/shared/outbox/outbox.commands';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';

export interface ResendNotificationInput {
  appointmentId: string;
  eventType: 'APPOINTMENT_BOOKED' | 'PAYMENT_RECEIPT' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H';
}

export async function resendNotificationAction(input: ResendNotificationInput) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized user.' };
    }

    const supabaseAdmin = await createAdminClient();

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['SECRETARY', 'ADMIN', 'DOCTOR'].includes(userData.role)) {
      return { success: false, error: 'Permission denied. Staff role required.' };
    }

    const { data: appointment, error: appError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        patient_id,
        patient:users!appointments_patient_id_fkey(email)
      `)
      .eq('id', input.appointmentId)
      .single();

    if (appError || !appointment) {
      return { success: false, error: 'Appointment not found.' };
    }

    const { data: gc } = await supabaseAdmin
      .from('guest_contacts')
      .select('email')
      .eq('appointment_id', input.appointmentId)
      .single();

    const recipientEmail = gc?.email || appointment.patient?.email;

    if (!recipientEmail) {
      return { success: false, error: 'No contact email found for this appointment.' };
    }

    const outbox = outboxCommands(supabaseAdmin);

    const emittedEvent = await outbox.emitEvent(input.eventType, {
      appointmentId: input.appointmentId,
      email: recipientEmail,
    });

    // Update sent flag on appointments table
    const update: Record<string, boolean> = {};
    if (input.eventType === 'APPOINTMENT_REMINDER_48H') update.reminder_48h_sent = true;
    else if (input.eventType === 'APPOINTMENT_REMINDER_24H') update.reminder_24h_sent = true;
    else if (input.eventType === 'APPOINTMENT_BOOKED') update.confirmation_sent = true;
    else if (input.eventType === 'PAYMENT_RECEIPT') update.payment_receipt_sent = true;

    await supabaseAdmin.from('appointments').update(update).eq('id', input.appointmentId);

    bootstrapEventSubscribers();
    await globalOutboxDispatcher(supabaseAdmin, true, emittedEvent.id)();

    return {
      success: true,
      message: `${input.eventType} notification dispatched to ${recipientEmail}.`,
    };
  } catch (error: any) {
    console.error('[resendNotificationAction] Error:', error);
    return { success: false, error: error.message || 'Failed to resend notification.' };
  }
}
