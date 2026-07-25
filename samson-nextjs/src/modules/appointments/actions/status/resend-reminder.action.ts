'use server';

import { createClient, createAdminClient } from '@/shared/database/server';
import { outboxCommands } from '@/shared/outbox/outbox.commands';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';

export interface ResendReminderInput {
  appointmentId: string;
  reminderType: '24H' | '48H';
}

export async function resendReminderAction(input: ResendReminderInput) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized user.' };
    }

    const supabaseAdmin = await createAdminClient();

    // Verify staff role
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['SECRETARY', 'ADMIN', 'DOCTOR'].includes(userData.role)) {
      return { success: false, error: 'Permission denied. Staff role required.' };
    }

    // Fetch appointment & recipient email
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

    // Pure Guest Focus: Always query guest_contacts first for contact email
    const { data: gc } = await supabaseAdmin
      .from('guest_contacts')
      .select('email')
      .eq('appointment_id', input.appointmentId)
      .single();

    let recipientEmail = gc?.email || appointment.patient?.email;

    if (!recipientEmail) {
      return { success: false, error: 'No contact email found for this appointment.' };
    }

    const eventType = input.reminderType === '48H' ? 'APPOINTMENT_REMINDER_48H' : 'APPOINTMENT_REMINDER_24H';
    const outbox = outboxCommands(supabaseAdmin);

    const emittedEvent = await outbox.emitEvent(eventType, {
      appointmentId: input.appointmentId,
      email: recipientEmail,
    });

    // Update sent flags on appointments table
    if (input.reminderType === '48H') {
      await supabaseAdmin.from('appointments').update({ reminder_48h_sent: true, email_reminder_48h_sent: true }).eq('id', input.appointmentId);
    } else {
      await supabaseAdmin.from('appointments').update({ reminder_24h_sent: true, email_reminder_24h_sent: true }).eq('id', input.appointmentId);
    }

    // Trigger immediate outbox processing ONLY for this specific event
    bootstrapEventSubscribers();
    await globalOutboxDispatcher(supabaseAdmin, true, emittedEvent.id)();

    return {
      success: true,
      message: `Manual ${input.reminderType} reminder dispatched successfully to ${recipientEmail}.`,
    };
  } catch (error: any) {
    console.error('[resendReminderAction] Error:', error);
    return { success: false, error: error.message || 'Failed to resend reminder email.' };
  }
}
