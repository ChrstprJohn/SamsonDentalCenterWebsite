import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { CreateCoordinationLogDto } from '../../dtos/coordination/create-coordination-log.dto';
import { CoordinationLogResponseDto, coordinationLogResponseSchema } from '../../dtos/coordination/coordination-log-response.dto';

export const insertCoordinationLogCommand = (supabase: SupabaseClient) => {
  return async (data: CreateCoordinationLogDto, createdBy: string): Promise<CoordinationLogResponseDto> => {
    const dbPayload = {
      inquiry_id: data.inquiryId,
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
