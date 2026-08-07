import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { appointmentConvertedEventSchema } from '../dtos/events/appointment-converted.event.dto';
import { formatShortDate, formatClinicTime, calculateEndTime, formatRefId } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onAppointmentConvertedSubscriber = {
  /**
   * Handles the APPOINTMENT_CONVERTED_FROM_INQUIRY event by sending a confirmation email.
   * Resolves service and doctor names before sending.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    // Contract Validation
    const parsed = appointmentConvertedEventSchema.parse(payload);
    const { appointmentId, serviceId, doctorId, date, startTime, durationMinutes, inquiryId } = parsed;

    let recipientEmail = parsed.guestEmail || '';
    let recipientName = parsed.guestName || '';

    const supabaseAdmin = await createAdminClient();

    // 1. Fallback recipient resolution if email or name missing
    if (!recipientEmail || !recipientName) {
      const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select('patient_id, guest_contacts(first_name, last_name, email), patient:users!appointments_patient_id_fkey(first_name, last_name, email)')
        .eq('id', appointmentId)
        .maybeSingle();

      if (appt) {
        const gcData = Array.isArray(appt.guest_contacts) ? appt.guest_contacts[0] : (appt.guest_contacts as any);
        if (gcData && (gcData.email || gcData.first_name)) {
          recipientEmail = recipientEmail || gcData.email || '';
          recipientName = recipientName || `${gcData.first_name || ''} ${gcData.last_name || ''}`.trim();
        } else if (appt.patient) {
          recipientEmail = recipientEmail || appt.patient.email || '';
          recipientName = recipientName || `${appt.patient.first_name || ''} ${appt.patient.last_name || ''}`.trim();
        }
      }

      if ((!recipientEmail || !recipientName) && inquiryId) {
        const { data: inq } = await supabaseAdmin
          .from('appointment_inquiries')
          .select('first_name, last_name, email')
          .eq('id', inquiryId)
          .maybeSingle();
        if (inq) {
          recipientEmail = recipientEmail || inq.email || '';
          recipientName = recipientName || `${inq.first_name} ${inq.last_name}`;
        }
      }
    }

    if (!recipientEmail) {
      console.warn(`[Appointment Converted Email] Skipping: No recipient email found for payload`, payload);
      return;
    }

    // 2. Fetch Service details
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('name, duration_minutes')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      throw new Error(`Failed to fetch service for outbox email: ${serviceError?.message || 'Not found'}`);
    }

    const duration = durationMinutes || service.duration_minutes || 30;

    // 3. Fetch Doctor details
    let doctorName = 'Assigned Dentist';
    if (doctorId) {
      const { data: doctor } = await supabaseAdmin
        .from('users')
        .select('first_name, last_name')
        .eq('id', doctorId)
        .single();
      if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
      }
    }

    const dateStr = formatShortDate(date);
    let timeRangeStr = 'To be scheduled';
    if (startTime) {
      const end = parsed.endTime || calculateEndTime(startTime, duration);
      const startFmt = formatClinicTime(startTime);
      const endFmt = formatClinicTime(end);
      timeRangeStr = startFmt && endFmt ? `${startFmt} - ${endFmt}` : startFmt || 'To be scheduled';
    }

    const ref = formatRefId(appointmentId);
    const subject = `Your Appointment is Confirmed${ref ? ` [Ref: ${ref}]` : ''}`;

    const { data: appt } = await supabaseAdmin
      .from('appointments')
      .select('chat_token')
      .eq('id', appointmentId)
      .single();

    const chatToken = appt?.chat_token || '';
    const baseUrl = getBaseUrl();

    // Send email using Resend
    await ResendService.sendTemplatedEmail(
      recipientEmail,
      subject,
      'appointment_confirmed',
      {
        patientName: recipientName || 'Valued Patient',
        serviceName: service.name,
        doctorName,
        dateStr,
        timeRangeStr,
        appointmentId,
        chatToken,
        baseUrl,
      }
    );
    const { error: updateError } = await supabaseAdmin
      .from('appointments')
      .update({ email_confirmation_sent: true })
      .eq('id', appointmentId);

    if (updateError) {
      throw new Error(`Failed to mark email confirmation sent: ${updateError.message}`);
    }
  }
};
