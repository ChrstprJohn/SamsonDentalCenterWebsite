import { SupabaseClient } from '@supabase/supabase-js';
import { CreateAuditLogDto } from '../../dtos/logs/create-audit-log.dto';
import { AuditLogResponseDto, auditLogResponseSchema } from '../../dtos/logs/audit-log-response.dto';
import { DomainError } from '@/shared/errors';

export const createAuditLogCommand = (supabase: SupabaseClient) => {
  return async (data: CreateAuditLogDto): Promise<AuditLogResponseDto> => {
    const dbPayload = {
      actor_id: data.actorId,
      action: data.action,
      target_id: data.targetId,
      reason: data.reason || null,
    };

    const { data: result, error } = await supabase
      .from('audit_logs')
      .insert([dbPayload])
      .select()
      .single();

    if (error || !result) {
      throw new DomainError(
        `Failed to create audit log: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return auditLogResponseSchema.parse(result);
  };
};
