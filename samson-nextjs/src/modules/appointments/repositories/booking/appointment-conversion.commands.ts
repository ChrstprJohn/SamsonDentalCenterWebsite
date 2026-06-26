import { SupabaseClient } from '@supabase/supabase-js';
import { ConvertInquiryDto } from '../../dtos/booking/convert-inquiry.dto';

export const convertInquiryToAppointmentCommand = (supabase: SupabaseClient) => {
  return async (data: ConvertInquiryDto, secretaryUserId: string): Promise<{ appointmentId: string }> => {
    const { data: appointmentId, error } = await supabase.rpc('convert_inquiry_to_appointment', {
      p_inquiry_id: data.inquiryId,
      p_service_id: data.serviceId,
      p_doctor_id: data.doctorId,
      p_date: data.date,
      p_start_time: data.startTime,
      p_end_time: data.endTime,
      p_patient_note: data.patientNote || null,
      p_secretary_notes: data.secretaryNotes || null,
      p_secretary_user_id: secretaryUserId,
      p_patient_id: data.linkedPatientId || null,
      p_first_name: data.guestFirstName || null,
      p_middle_name: data.guestMiddleName || null,
      p_last_name: data.guestLastName || null,
      p_suffix: data.guestSuffix || null,
      p_phone_number: data.guestPhone || null,
      p_email: data.guestEmail || null,
      p_doctor_assignment_source: data.doctorAssignmentSource,
    });

    if (error || !appointmentId) {
      throw new Error(`Failed to convert inquiry: ${error?.message || 'Unknown database error'}`);
    }

    return { appointmentId: appointmentId as string };
  };
};
