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
