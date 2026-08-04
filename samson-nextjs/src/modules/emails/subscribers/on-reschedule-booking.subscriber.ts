import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { formatShortDate, formatClinicTime } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onRescheduleBookingSubscriber = {
  /**
   * Handles RESCHEDULE_BOOKING outbox events by sending a reschedule confirmation email.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const { appointmentId, date, startTime } = payload;
    const supabaseAdmin = await createAdminClient();

    // 1. Fetch appointment details including service & doctor
    const { data: appt, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select(`
        chat_token,
        patient_id,
        confirmation_channel,
        service:services(name),
        doctor:users!appointments_doctor_id_fkey(first_name, last_name)
      `)
      .eq('id', appointmentId)
      .single();

    if (apptError || !appt) {
      throw new Error(`Failed to fetch appointment for reschedule: ${apptError?.message || 'Not found'}`);
    }

    const channel = (appt as any).confirmation_channel || 'EMAIL';
    if (channel === 'NONE' || channel === 'SMS') {
      return;
    }

    let recipientEmail = '';
    let patientName = '';

    // 2. Resolve name and email
    if (appt.patient_id) {
      const { data: patient } = await supabaseAdmin
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', appt.patient_id)
        .single();
      if (patient) {
        recipientEmail = patient.email;
        patientName = `${patient.first_name} ${patient.last_name}`;
      }
    } else {
      const { data: guest } = await supabaseAdmin
        .from('guest_contacts')
        .select('email, first_name, last_name')
        .eq('appointment_id', appointmentId)
        .maybeSingle();
      if (guest) {
        recipientEmail = guest.email;
        patientName = `${guest.first_name} ${guest.last_name}`;
      }
    }

    if (!recipientEmail) {
      console.warn(`No recipient email found for reschedule on appointment ${appointmentId}`);
      return;
    }

    const serviceName = (appt.service as any)?.name || 'Dental Treatment';
    const doctorName = appt.doctor
      ? `Dr. ${appt.doctor.first_name} ${appt.doctor.last_name}`
      : 'Dr. Adrian Samson';

    const dateStr = formatShortDate(date);
    const timeRangeStr = formatClinicTime(startTime);
    const baseUrl = getBaseUrl();
    const chatToken = appt.chat_token;

    await ResendService.sendTemplatedEmail(
      recipientEmail,
      'Your Appointment Has Been Rescheduled',
      'appointment_rescheduled',
      {
        patientName: patientName || 'Valued Patient',
        serviceName,
        doctorName,
        dateStr,
        timeRangeStr,
        appointmentId,
        chatToken,
        baseUrl,
      }
    );

    await supabaseAdmin.from('appointments').update({ email_reschedule_sent: true }).eq('id', appointmentId);
  },
};
