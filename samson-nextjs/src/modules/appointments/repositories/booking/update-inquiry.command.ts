import { SupabaseClient } from '@supabase/supabase-js';
import { UpdateInquiryDto } from '../../dtos/booking/update-inquiry.dto';

export const updateInquiryCommand = (supabase: SupabaseClient) => {
  return async (data: UpdateInquiryDto): Promise<{ success: true }> => {
    const dbPayload: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (data.firstName !== undefined) dbPayload.first_name = data.firstName;
    if (data.middleName !== undefined) dbPayload.middle_name = data.middleName || null;
    if (data.lastName !== undefined) dbPayload.last_name = data.lastName;
    if (data.suffix !== undefined) dbPayload.suffix = data.suffix || null;
    if (data.phoneNumber !== undefined) dbPayload.phone_number = data.phoneNumber;
    if (data.email !== undefined) dbPayload.email = data.email;
    if (data.patientNote !== undefined) dbPayload.patient_note = data.patientNote || null;
    if (data.serviceId !== undefined) dbPayload.preferred_service_id = data.serviceId;
    if (data.date !== undefined) dbPayload.preferred_date = data.date;
    if (data.startTime !== undefined) dbPayload.preferred_start_time = data.startTime;
    if (data.assignedDoctorId !== undefined) dbPayload.assigned_doctor_id = data.assignedDoctorId;
    if (data.assignedEndTime !== undefined) dbPayload.assigned_end_time = data.assignedEndTime;
    if (data.confirmationChannel !== undefined) dbPayload.confirmation_channel = data.confirmationChannel;

    const { error } = await supabase
      .from('appointment_inquiries')
      .update(dbPayload)
      .eq('id', data.inquiryId);

    if (error) {
      throw new Error(`Failed to update inquiry: ${error.message}`);
    }

    return { success: true };
  };
};
