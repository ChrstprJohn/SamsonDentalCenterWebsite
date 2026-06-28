import { createAdminClient } from '@/shared/database/server';
import { ResendService } from '@/shared/services/email/resend.service';
import { appointmentBookedEventSchema } from '../dtos/events/appointment-booked.event.dto';
import { formatShortDate, formatClinicTime, calculateEndTimeFromIso } from '@/shared/utils/date.util';
import { getBaseUrl } from '@/shared/utils/get-base-url.util';

export const onAppointmentBookedSubscriber = {
  /**
   * Handles the APPOINTMENT_BOOKED event by sending a confirmation request email.
   * Resolves patient, service, doctor, and (if applicable) dependent info before mailing out.
   */
  async handle(payload: Record<string, any>): Promise<void> {
    // Contract Validation
    const parsed = appointmentBookedEventSchema.parse(payload);
    const { appointmentId, patientId, serviceId, doctorId, date, startTime, durationMinutes, dependentId } = parsed;

    const supabaseAdmin = await createAdminClient();

    // 1. Fetch account holder (patient) details
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('users')
      .select('email, first_name, middle_name, last_name, suffix')
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

    // 4. Resolve patient identity — account holder vs. dependent
    const bookedByName = [patient.first_name, patient.middle_name, patient.last_name, patient.suffix]
      .filter(Boolean)
      .join(' ')
      .trim();

    let patientType: 'SELF' | 'DEPENDENT' = 'SELF';
    let patientName = bookedByName;
    let relationship: string | undefined;

    if (dependentId) {
      // Dependent booking — fetch the dependent's name and relationship
      const { data: dependent, error: dependentError } = await supabaseAdmin
        .from('dependents')
        .select('first_name, middle_name, last_name, suffix, relationship')
        .eq('id', dependentId)
        .single();

      if (dependentError || !dependent) {
        throw new Error(`Failed to fetch dependent for outbox email: ${dependentError?.message || 'Not found'}`);
      }

      patientType = 'DEPENDENT';
      patientName = [dependent.first_name, dependent.middle_name, dependent.last_name, dependent.suffix]
        .filter(Boolean)
        .join(' ')
        .trim();
      // Capitalize for display — DB stores as uppercase enum e.g. 'SPOUSE' → 'Spouse'
      relationship = dependent.relationship.charAt(0).toUpperCase() + dependent.relationship.slice(1).toLowerCase();
    }

    // Calculations & Formats
    const doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    const dateStr = formatShortDate(date);

    const start = new Date(startTime);
    const end = calculateEndTimeFromIso(startTime, durationMinutes);
    const timeRangeStr = `${formatClinicTime(start)} - ${formatClinicTime(end)}`;

    const baseUrl = getBaseUrl();

    const subject = patientType === 'DEPENDENT'
      ? 'Family Member Appointment Request Received – Samson Dental Center'
      : 'Appointment Request Received – Samson Dental Center';

    // Send email using Resend
    await ResendService.sendTemplatedEmail(
      patient.email,
      subject,
      'appointment_request_received',
      {
        accountHolderName: bookedByName,
        patientType,
        patientName,
        relationship,
        bookedByName: patientType === 'DEPENDENT' ? bookedByName : undefined,
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
