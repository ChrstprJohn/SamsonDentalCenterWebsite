import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { SubmitBookingDto, AppointmentDto, mapAppointmentRecord } from '../../dtos';

export class AppointmentBookingCommands {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Strictly creates a new appointment request from the booking wizard.
   * Maps properties to snake_case database columns.
   */
  async createAppointment(userId: string, data: SubmitBookingDto): Promise<AppointmentDto> {
    const { data: appointment, error } = await this.supabase
      .from('appointments')
      .insert({
        user_id: userId,
        status: 'PENDING',
        idempotency_key: data.idempotencyKey,
        service_id: data.serviceId,
        doctor_id: data.doctorId,
        is_preferred_doctor: data.isPreferredDoctor ?? false,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        user_note: data.userNote,
        patient_type: data.patientType,
        dependent_id: data.dependentId,
        dependent_first_name: data.dependentFirstName,
        dependent_middle_name: data.dependentMiddleName,
        dependent_last_name: data.dependentLastName,
        dependent_suffix: data.dependentSuffix,
        dependent_birthday: data.dependentBirthday,
        dependent_sex: data.dependentSex,
        dependent_relationship: data.dependentRelationship,
      })
      .select('*')
      .single();

    if (error || !appointment) {
      throw new DomainError(
        `Failed to create appointment: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return mapAppointmentRecord(appointment as Record<string, unknown>);
  }
}
