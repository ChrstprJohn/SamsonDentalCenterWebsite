import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { SubmitBookingDto, AppointmentDto, mapAppointmentRecord } from '../../dtos/exports';

export const executeBookingTransactionCommand = (supabase: SupabaseClient) => {
  return async (userId: string, data: SubmitBookingDto): Promise<{ appointmentId: string }> => {
    
    const { data: appointmentId, error } = await supabase.rpc('submit_booking_transaction', {
      p_patient_id: userId,
      p_service_id: data.serviceId,
      p_doctor_id: data.doctorId,
      p_date: data.date,
      p_start_time: data.startTime,
      p_end_time: data.endTime,
      p_user_note: data.userNote || null,
      p_existing_dependent_id: data.patientType === 'EXISTING_DEPENDENT' ? data.dependentId : null,
      p_new_dependent_first_name: data.patientType === 'NEW_DEPENDENT' ? data.dependentFirstName : null,
      p_new_dependent_last_name: data.patientType === 'NEW_DEPENDENT' ? data.dependentLastName : null,
      p_new_dependent_date_of_birth: data.patientType === 'NEW_DEPENDENT' ? data.dependentBirthday : null,
      p_new_dependent_relationship: data.patientType === 'NEW_DEPENDENT' ? data.dependentRelationship : null,
      p_new_dependent_middle_name: data.patientType === 'NEW_DEPENDENT' ? data.dependentMiddleName : null,
      p_new_dependent_suffix: data.patientType === 'NEW_DEPENDENT' ? data.dependentSuffix : null,
    });

    if (error || !appointmentId) {
      throw new DomainError(
        `Failed to submit booking: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return { appointmentId: appointmentId as string };
  };
};

