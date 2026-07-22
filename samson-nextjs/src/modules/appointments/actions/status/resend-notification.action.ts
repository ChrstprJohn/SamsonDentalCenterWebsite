'use server';

import { createClient, createAdminClient } from '@/shared/database/server';
import { outboxCommands } from '@/shared/outbox/outbox.commands';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';

export interface ResendNotificationInput {
  appointmentId: string;
  eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H';
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
        service_id,
        doctor_id,
        date,
        start_time,
        end_time,
        source,
        patient:users!appointments_patient_id_fkey(email, first_name, last_name)
      `)
      .eq('id', input.appointmentId)
      .single();

    if (appError || !appointment) {
      return { success: false, error: 'Appointment not found.' };
    }

    const { data: gc } = await supabaseAdmin
      .from('guest_contacts')
      .select('email, first_name, last_name')
      .eq('appointment_id', input.appointmentId)
      .single();

    const recipientEmail = gc?.email || appointment.patient?.email;

    if (!recipientEmail) {
      return { success: false, error: 'No contact email found for this appointment.' };
    }

    const { data: service } = await supabaseAdmin
      .from('services')
      .select('duration_minutes, name')
      .eq('id', appointment.service_id)
      .single();

    const outbox = outboxCommands(supabaseAdmin);

    let eventType: string;
    let payload: Record<string, any>;

    if (input.eventType === 'APPOINTMENT_REMINDER_24H' || input.eventType === 'APPOINTMENT_REMINDER_48H') {
      eventType = input.eventType === 'APPOINTMENT_REMINDER_48H' ? 'APPOINTMENT_REMINDER_48H' : 'APPOINTMENT_REMINDER_24H';
      payload = { appointmentId: input.appointmentId, email: recipientEmail };
    } else {
      // Determine confirmation event type based on appointment source
      if (appointment.patient_id && appointment.source === 'STAFF_CREATED') {
        eventType = 'APPOINTMENT_MANUALLY_BOOKED_PATIENT';
        payload = {
          appointmentId: input.appointmentId,
          patientId: appointment.patient_id,
          serviceId: appointment.service_id,
          doctorId: appointment.doctor_id,
          date: appointment.date,
          startTime: appointment.start_time,
          durationMinutes: service?.duration_minutes || 60,
        };
      } else if (!appointment.patient_id) {
        eventType = 'APPOINTMENT_MANUALLY_BOOKED_GUEST';
        payload = {
          appointmentId: input.appointmentId,
          serviceId: appointment.service_id,
          doctorId: appointment.doctor_id,
          date: appointment.date,
          startTime: appointment.start_time,
          durationMinutes: service?.duration_minutes || 60,
          guestName: gc ? `${gc.first_name || ''} ${gc.last_name || ''}`.trim() : 'Guest',
          guestEmail: gc?.email || '',
        };
      } else {
        eventType = 'APPOINTMENT_BOOKED';
        payload = {
          appointmentId: input.appointmentId,
          patientId: appointment.patient_id,
          serviceId: appointment.service_id,
          doctorId: appointment.doctor_id,
          date: appointment.date,
          startTime: appointment.start_time,
          durationMinutes: service?.duration_minutes || 60,
        };
      }
    }

    const emittedEvent = await outbox.emitEvent(eventType, payload);

    const update: Record<string, boolean> = {};
    if (eventType === 'APPOINTMENT_REMINDER_48H') update.reminder_48h_sent = true;
    else if (eventType === 'APPOINTMENT_REMINDER_24H') update.reminder_24h_sent = true;
    else update.confirmation_sent = true;

    await supabaseAdmin.from('appointments').update(update).eq('id', input.appointmentId);

    bootstrapEventSubscribers();
    await globalOutboxDispatcher(supabaseAdmin, true, emittedEvent.id)();

    return {
      success: true,
      message: `Confirmation notification dispatched to ${recipientEmail}.`,
    };
  } catch (error: any) {
    console.error('[resendNotificationAction] Error:', error);
    return { success: false, error: error.message || 'Failed to resend notification.' };
  }
}
