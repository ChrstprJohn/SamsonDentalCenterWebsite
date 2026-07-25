import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { manualBookingPatientEventSchema } from '../dtos/events/manual-booking-patient.event.dto';
import { formatShortDate, formatClinicTime, calculateEndTime } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onManualBookingPatientSubscriber = {
  /**
   * Handles APPOINTMENT_MANUALLY_BOOKED_PATIENT.
   * Registered patient always has email — fetched from users table.
   * If dependentName is present in payload, uses it as the recipient name in the email.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const parsed = manualBookingPatientEventSchema.parse(payload);
    const { appointmentId, patientId, serviceId, doctorId, date, startTime, durationMinutes, dependentName } = parsed;

    const supabaseAdmin = await createAdminClient();

    const { data: patient, error: patientError } = await supabaseAdmin
      .from('users')
      .select('email, first_name, middle_name, last_name, suffix')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      throw new Error(`Failed to fetch patient for outbox email: ${patientError?.message || 'Not found'}`);
    }

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

    // Use dependent name if booking is for a dependent, otherwise account holder's name
    const accountHolderName = [patient.first_name, patient.middle_name, patient.last_name, patient.suffix]
      .filter(Boolean)
      .join(' ')
      .trim();

    const patientName = dependentName || accountHolderName;

    const doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
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

    await ResendService.sendTemplatedEmail(
      patient.email,
      'Appointment Confirmed – Samson Dental Center',
      'appointment_confirmed',
      {
        patientName,
        serviceName: service.name,
        doctorName,
        dateStr,
        timeRangeStr,
        appointmentId,
        chatToken,
        baseUrl,
      }
    );

    await supabaseAdmin
      .from('appointments')
      .update({
        confirmation_sent: true,
        email_confirmation_sent: true,
      })
      .eq('id', appointmentId);
  },
};
