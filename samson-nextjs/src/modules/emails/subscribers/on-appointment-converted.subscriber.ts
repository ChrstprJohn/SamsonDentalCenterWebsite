import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { appointmentConvertedEventSchema } from '../dtos/events/appointment-converted.event.dto';
import { formatShortDate, formatClinicTime, calculateEndTimeFromIso } from '@/shared/utils/date.util';

export const onAppointmentConvertedSubscriber = {
  /**
   * Handles the APPOINTMENT_CONVERTED_FROM_INQUIRY event by sending a confirmation email.
   * Resolves service and doctor names before sending.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    // Contract Validation
    const parsed = appointmentConvertedEventSchema.parse(payload);
    const { appointmentId, serviceId, doctorId, date, startTime, durationMinutes, guestName, guestEmail } = parsed;

    const supabaseAdmin = await createAdminClient();

    // 1. Fetch Service details
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('name')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      throw new Error(`Failed to fetch service for outbox email: ${serviceError?.message || 'Not found'}`);
    }

    // 2. Fetch Doctor details
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name')
      .eq('id', doctorId)
      .single();

    if (doctorError || !doctor) {
      throw new Error(`Failed to fetch doctor for outbox email: ${doctorError?.message || 'Not found'}`);
    }

    // Calculations & Formats
    const doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    const dateStr = formatShortDate(date);

    const start = new Date(startTime);
    const end = calculateEndTimeFromIso(startTime, durationMinutes);
    const timeRangeStr = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    const subject = 'Appointment Confirmed – Samson Dental Center';

    // Send email using Resend
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
      }
    );
  }
};
