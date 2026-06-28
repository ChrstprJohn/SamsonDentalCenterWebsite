import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { manualBookingGuestEventSchema } from '../dtos/events/manual-booking-guest.event.dto';
import { formatShortDate, formatClinicTime, calculateEndTimeFromIso } from '@/shared/utils/date.util';

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

    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name')
      .eq('id', doctorId)
      .single();

    if (doctorError || !doctor) {
      throw new Error(`Failed to fetch doctor for outbox email: ${doctorError?.message || 'Not found'}`);
    }

    const doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    const dateStr = formatShortDate(date);
    const start = new Date(startTime);
    const end = calculateEndTimeFromIso(startTime, durationMinutes);
    const timeRangeStr = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    await ResendService.sendTemplatedEmail(
      guestEmail,
      'Appointment Confirmed – Samson Dental Center',
      'appointment_confirmed',
      {
        patientName: guestName,
        serviceName: service.name,
        doctorName,
        dateStr,
        timeRangeStr,
        appointmentId,
      }
    );
  },
};
