import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { CreateManualBookingDto } from '../../dtos/exports';

export const createManualBookingCommand = (supabase: SupabaseClient) => {
  return async (data: CreateManualBookingDto & { secretaryUserId: string }): Promise<{ appointmentId: string }> => {
    const { data: appointmentId, error } = await supabase.rpc('create_manual_booking', {
      p_patient_id: data.patientId || null,
      p_service_id: data.serviceId,
      p_doctor_id: data.doctorId,
      p_date: data.date,
      p_start_time: data.startTime,
      p_end_time: data.endTime,
      p_first_name: data.firstName || null,
      p_middle_name: data.middleName || null,
      p_last_name: data.lastName || null,
      p_suffix: data.suffix || null,
      p_phone_number: data.phoneNumber || null,
      p_email: data.email || null,
      p_patient_note: data.patientNote || null,
      p_status_reason: data.statusReason || null,
      p_secretary_user_id: data.secretaryUserId,
      // Dependent params
      p_dependent_id: data.dependentId || null,
      p_new_dependent_first_name: data.newDependentFirstName || null,
      p_new_dependent_middle_name: data.newDependentMiddleName || null,
      p_new_dependent_last_name: data.newDependentLastName || null,
      p_new_dependent_suffix: data.newDependentSuffix || null,
      p_new_dependent_date_of_birth: data.newDependentDateOfBirth || null,
      p_new_dependent_relationship: data.newDependentRelationship || null,
    });

    if (error || !appointmentId) {
      throw new DomainError(
        `Failed to create manual booking: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return { appointmentId: appointmentId as string };
  };
};
