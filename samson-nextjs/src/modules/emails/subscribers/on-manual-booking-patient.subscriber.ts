import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { manualBookingPatientEventSchema } from '../dtos/events/manual-booking-patient.event.dto';
import { formatShortDate, formatClinicTime, calculateEndTimeFromIso } from '@/shared/utils/date.util';

export const onManualBookingPatientSubscriber = {
  /**
   * Handles APPOINTMENT_MANUALLY_BOOKED_PATIENT.
   * Registered patient always has email — fetched from users table.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    const parsed = manualBookingPatientEventSchema.parse(payload);
    const { appointmentId, patientId, serviceId, doctorId, date, startTime, durationMinutes } = parsed;

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

    const patientName = [patient.first_name, patient.middle_name, patient.last_name, patient.suffix]
      .filter(Boolean)
      .join(' ')
      .trim();

    const doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    const dateStr = formatShortDate(date);
    const start = new Date(startTime);
    const end = calculateEndTimeFromIso(startTime, durationMinutes);
    const timeRangeStr = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

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
      }
    );
  },
};
