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
    });

    if (error || !appointmentId) {
      throw new Error(`Failed to convert inquiry: ${error?.message || 'Unknown database error'}`);
    }

    return { appointmentId: appointmentId as string };
  };
};
