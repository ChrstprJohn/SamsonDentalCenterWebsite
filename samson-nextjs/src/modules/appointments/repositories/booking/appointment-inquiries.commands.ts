import { SupabaseClient } from '@supabase/supabase-js';
import { SubmitInquiryDto, InquiryResponseDto, inquiryResponseSchema } from '../../dtos/booking/submit-inquiry.dto';

export const createInquiryCommand = (supabase: SupabaseClient) => {
  return async (data: SubmitInquiryDto): Promise<InquiryResponseDto> => {
    const { data: result, error } = await supabase
      .from('appointment_inquiries')
      .insert([
        {
          first_name: data.firstName,
          middle_name: data.middleName || null,
          last_name: data.lastName,
          suffix: data.suffix || null,
          phone_number: data.phoneNumber,
          email: data.email,
          preferred_service_id: data.preferredServiceId,
          preferred_date: data.preferredDate,
          patient_note: data.patientNote || null,
          status: 'NEW',
        },
      ])
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Failed to create guest inquiry: ${error?.message || 'Unknown database error'}`);
    }

    return inquiryResponseSchema.parse(result);
  };
};

export const dropInquiryCommand = (supabase: SupabaseClient) => {
  return async (inquiryId: string, secretaryNotes?: string): Promise<InquiryResponseDto> => {
    const { data: result, error } = await supabase
      .from('appointment_inquiries')
      .update({
        status: 'DROPPED',
        secretary_notes: secretaryNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId)
      .eq('status', 'NEW')
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Failed to drop inquiry: ${error?.message || 'Inquiry not found or not in NEW status'}`);
    }

    return inquiryResponseSchema.parse(result);
  };
};
