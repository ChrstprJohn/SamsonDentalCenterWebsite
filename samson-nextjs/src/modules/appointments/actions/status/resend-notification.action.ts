'use server';

import { createClient, createAdminClient } from '@/shared/database/server';
import { outboxCommands } from '@/shared/outbox/outbox.commands';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';

export interface ResendNotificationInput {
  appointmentId: string;
  eventType: 'APPOINTMENT_BOOKED' | 'APPOINTMENT_REMINDER_48H' | 'APPOINTMENT_REMINDER_24H' | 'APPOINTMENT_CHECKOUT';
  targetChannel?: 'EMAIL' | 'SMS' | 'BOTH';
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
        confirmation_channel,
        patient:users!appointments_patient_id_fkey(email, phone_number, first_name, last_name)
      `)
      .eq('id', input.appointmentId)
      .single();

    if (appError || !appointment) {
      return { success: false, error: 'Appointment not found.' };
    }

    const { data: gc } = await supabaseAdmin
      .from('guest_contacts')
      .select('id, email, phone_number, first_name, last_name')
      .eq('appointment_id', input.appointmentId)
      .single();

    const channelToUse = input.targetChannel || (appointment.confirmation_channel as any) || 'EMAIL';
    if (channelToUse === 'NONE') {
      return { success: false, error: 'Notification channel is set to NONE (Opted out).' };
    }

    const shouldSendEmail = channelToUse === 'EMAIL' || channelToUse === 'BOTH';
    const shouldSendSms = channelToUse === 'SMS' || channelToUse === 'BOTH';

    const recipientEmail = gc?.email?.trim() || appointment.patient?.email?.trim();
    const recipientPhone = gc?.phone_number?.trim() || appointment.patient?.phone_number?.trim();

    if (shouldSendEmail && !recipientEmail) {
      return { success: false, error: 'No contact email found for this appointment.' };
    }

    if (shouldSendSms && !recipientPhone) {
      return { success: false, error: 'No phone number found for SMS notification.' };
    }

    const { data: service } = await supabaseAdmin
      .from('services')
      .select('duration_minutes, name')
      .eq('id', appointment.service_id)
      .single();

    const outbox = outboxCommands(supabaseAdmin);
    let dispatchedEvents: string[] = [];

    // Helper: find existing FAILED event for this appointment+eventType and reuse it
    const reuseOrEmit = async (eventType: string, payload: Record<string, any>) => {
      const { data: existing } = await supabaseAdmin
        .from('outbox')
        .select('id')
        .eq('event_type', eventType)
        .contains('payload', { appointmentId: input.appointmentId })
        .eq('status', 'FAILED')
        .order('created_at', { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        await supabaseAdmin
          .from('outbox')
          .update({ status: 'PENDING', retry_count: 0, error_logs: null })
          .eq('id', existing[0].id);
        return existing[0].id;
      }
      const emitted = await outbox.emitEvent(eventType, payload);
      return emitted.id;
    };

    // Build atomic update payload based on event type and target channel
    const updatePayload: Record<string, boolean> = {};

    if (input.eventType === 'APPOINTMENT_BOOKED') {
      if (shouldSendEmail) updatePayload.email_confirmation_sent = true;
      if (shouldSendSms) updatePayload.sms_confirmation_sent = true;
    } else if (input.eventType === 'APPOINTMENT_REMINDER_48H') {
      if (shouldSendEmail) updatePayload.email_reminder_48h_sent = true;
      if (shouldSendSms) updatePayload.sms_reminder_48h_sent = true;
    } else if (input.eventType === 'APPOINTMENT_REMINDER_24H') {
      if (shouldSendEmail) updatePayload.email_reminder_24h_sent = true;
      if (shouldSendSms) updatePayload.sms_reminder_24h_sent = true;
    } else if (input.eventType === 'APPOINTMENT_CHECKOUT') {
      if (shouldSendEmail) updatePayload.email_checkout_sent = true;
      if (shouldSendSms) updatePayload.sms_checkout_sent = true;
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateErr } = await supabaseAdmin
        .from('appointments')
        .update(updatePayload)
        .eq('id', input.appointmentId);

      if (updateErr) {
        console.error('[resendNotificationAction] Atomic update error:', updateErr.message);
      }
    }

    // Dispatch Email Event
    if (shouldSendEmail && recipientEmail) {
      let eventType: string;
      let payload: Record<string, any>;

      if (input.eventType === 'APPOINTMENT_CHECKOUT') {
        eventType = 'APPOINTMENT_COMPLETED_POST_CARE';
        payload = { appointmentId: input.appointmentId, email: recipientEmail };
      } else if (input.eventType === 'APPOINTMENT_REMINDER_24H' || input.eventType === 'APPOINTMENT_REMINDER_48H') {
        eventType = input.eventType === 'APPOINTMENT_REMINDER_48H' ? 'APPOINTMENT_REMINDER_48H' : 'APPOINTMENT_REMINDER_24H';
        payload = { appointmentId: input.appointmentId, email: recipientEmail };
      } else {
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
            guestContactId: gc?.id || input.appointmentId,
            guestName: gc ? `${gc.first_name || ''} ${gc.last_name || ''}`.trim() : 'Guest',
            guestEmail: gc?.email || recipientEmail || null,
            guestPhone: gc?.phone_number || recipientPhone || 'N/A',
          };
        } else {
          eventType = 'APPOINTMENT_BOOKED';
          payload = {
            appointmentId: input.appointmentId,
            patientId: appointment.patient_id,
            serviceId: appointment.service_id,
            doctorId: appointment.doctor_id || null,
            date: appointment.date,
            startTime: appointment.start_time || null,
            durationMinutes: service?.duration_minutes || 60,
          };
        }
      }

      const emailEventId = await reuseOrEmit(eventType, payload);
      dispatchedEvents.push(`Email (${eventType})`);
      bootstrapEventSubscribers();
      await globalOutboxDispatcher(supabaseAdmin, true, emailEventId)();
    }

    // Dispatch SMS Event
    if (shouldSendSms && recipientPhone) {
      const smsEventType = input.eventType === 'APPOINTMENT_CHECKOUT' ? 'APPOINTMENT_COMPLETED_POST_CARE_SMS' : 'APPOINTMENT_MANUALLY_BOOKED_SMS';
      const smsPayload = {
        phoneNumber: recipientPhone,
        date: appointment.date,
        startTime: appointment.start_time,
        appointmentId: appointment.id,
      };

      const smsEventId = await reuseOrEmit(smsEventType, smsPayload);
      dispatchedEvents.push(`SMS (${recipientPhone})`);
      bootstrapEventSubscribers();
      await globalOutboxDispatcher(supabaseAdmin, true, smsEventId)();
    }

    return {
      success: true,
      message: `Notification sent via ${dispatchedEvents.join(' & ')}.`,
    };
  } catch (error: any) {
    console.error('[resendNotificationAction] Error:', error);
    return { success: false, error: error.message || 'Failed to resend notification.' };
  }
}
