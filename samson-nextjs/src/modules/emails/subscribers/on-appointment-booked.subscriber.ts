import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { appointmentBookedEventSchema } from '../dtos/events/appointment-booked.event.dto';
import { formatShortDate, formatClinicTime, calculateEndTimeFromIso } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onAppointmentBookedSubscriber = {
  /**
   * Handles the APPOINTMENT_BOOKED event by sending a confirmation request email.
   * Resolves patient, service, and doctor info before mailing out.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    // Contract Validation
    const parsed = appointmentBookedEventSchema.parse(payload);
    const { appointmentId, patientId, serviceId, doctorId, date, startTime, durationMinutes } = parsed;

    const supabaseAdmin = await createAdminClient();

    // 1. Fetch Patient details
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      throw new Error(`Failed to fetch patient for outbox email: ${patientError?.message || 'Not found'}`);
    }

    // 2. Fetch Service details
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('name')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      throw new Error(`Failed to fetch service for outbox email: ${serviceError?.message || 'Not found'}`);
    }

    // 3. Fetch Doctor details
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name')
      .eq('id', doctorId)
      .single();

    if (doctorError || !doctor) {
      throw new Error(`Failed to fetch doctor for outbox email: ${doctorError?.message || 'Not found'}`);
    }

    // Calculations & Formats
    const patientName = `${patient.first_name} ${patient.last_name}`.trim();
    const doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    const dateStr = formatShortDate(date);
    
    const start = new Date(startTime);
    const end = calculateEndTimeFromIso(startTime, durationMinutes);
    const timeRangeStr = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    const baseUrl = getBaseUrl();

    // Send email using Resend
    await ResendService.sendTemplatedEmail(
      patient.email,
      'We Received Your Appointment Request',
      'appointment_booked',
      {
        patientName,
        serviceName: service.name,
        doctorName,
        dateStr,
        timeRangeStr,
        appointmentId,
        dashboardUrl: `${baseUrl}/user`,
      }
    );
  }
};
