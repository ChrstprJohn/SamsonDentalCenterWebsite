import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { CreateCoordinationLogDto } from '../../dtos/coordination/create-coordination-log.dto';
import { CoordinationLogResponseDto, coordinationLogResponseSchema } from '../../dtos/coordination/coordination-log-response.dto';

export const insertCoordinationLogCommand = (supabase: SupabaseClient) => {
  return async (data: CreateCoordinationLogDto, createdBy: string): Promise<CoordinationLogResponseDto> => {
    let inquiryId = data.inquiryId || null;
    let appointmentId = data.appointmentId || null;

    // Defensive check: If only inquiryId is passed, verify if it belongs to appointment_inquiries or appointments
    if (inquiryId && !appointmentId) {
      const { data: inquiryCheck } = await supabase
        .from('appointment_inquiries')
        .select('id')
        .eq('id', inquiryId)
        .maybeSingle();

      if (!inquiryCheck) {
        const { data: apptCheck } = await supabase
          .from('appointments')
          .select('id')
          .eq('id', inquiryId)
          .maybeSingle();

        if (apptCheck) {
          appointmentId = inquiryId;
          inquiryId = null;
        }
      }
    }

    const dbPayload = {
      inquiry_id: inquiryId,
      appointment_id: appointmentId,
      action_type: data.actionType,
      message: data.message,
      created_by: createdBy,
    };

    const { data: result, error } = await supabase
      .from('coordination_logs')
      .insert([dbPayload])
      .select()
      .single();

    if (error || !result) {
      throw new DomainError(`Failed to create coordination log: ${error?.message || 'Unknown error'}`, 'DATABASE_ERROR');
    }

    return coordinationLogResponseSchema.parse(result);
  };
};

export const deleteCoordinationLogCommand = (supabase: SupabaseClient) => {
  return async (logId: string): Promise<void> => {
    const { error } = await supabase
      .from('coordination_logs')
      .delete()
      .eq('id', logId);

    if (error) {
      throw new DomainError(`Failed to delete coordination log: ${error.message}`, 'DATABASE_ERROR');
    }
  };
};
