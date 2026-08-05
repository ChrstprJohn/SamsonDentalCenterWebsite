import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { manualBookingGuestEventSchema } from '../dtos/events/manual-booking-guest.event.dto';
import { formatShortDate, formatClinicTime, calculateEndTime, formatRefId } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onManualBookingGuestSubscriber = {
  /**
   * Handles APPOINTMENT_MANUALLY_BOOKED_GUEST.
   * Sends confirmation email only if guest provided an email address.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const parsed = manualBookingGuestEventSchema.parse(payload);
    const { appointmentId, serviceId, doctorId, date, startTime, durationMinutes, guestName, guestEmail } = parsed;

    // Skip email if no address was captured
    if (!guestEmail) return;

    const supabaseAdmin = await createAdminClient();

    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('name')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      throw new Error(`Failed to fetch service for outbox email: ${serviceError?.message || 'Not found'}`);
    }

    let doctorName = 'Assigned Dentist';
    if (doctorId) {
      const { data: doctor, error: doctorError } = await supabaseAdmin
        .from('users')
        .select('first_name, last_name')
        .eq('id', doctorId)
        .single();
      if (doctorError || !doctor) {
        throw new Error(`Failed to fetch doctor: ${doctorError?.message || 'Not found'}`);
      }
      doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    const dateStr = formatShortDate(date);
    const start = startTime;
    const end = calculateEndTime(startTime, durationMinutes);
    const timeRangeStr = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    const { data: appt } = await supabaseAdmin
      .from('appointments')
      .select('chat_token')
      .eq('id', appointmentId)
      .single();

    const chatToken = appt?.chat_token || '';
    const baseUrl = getBaseUrl();
    const ref = formatRefId(appointmentId);
    const subject = `Your Appointment is Confirmed${ref ? ` [Ref: ${ref}]` : ''}`;

    await ResendService.sendTemplatedEmail(
      guestEmail,
      subject,
      'appointment_confirmed',
      {
        patientName: guestName,
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
  },
};
