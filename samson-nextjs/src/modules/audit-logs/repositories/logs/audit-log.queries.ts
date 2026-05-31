import { SupabaseClient } from '@supabase/supabase-js';
import { GetAuditLogsDto } from '../../dtos/logs/get-audit-logs.dto';
import { AuditLogResponseDto, auditLogResponseSchema } from '../../dtos/logs/audit-log-response.dto';
import { DomainError } from '@/shared/errors';

export const getAuditLogsQuery = (supabase: SupabaseClient) => {
  return async (filters?: GetAuditLogsDto): Promise<AuditLogResponseDto[]> => {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.actorId) {
        query = query.eq('actor_id', filters.actorId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.targetId) {
        query = query.eq('target_id', filters.targetId);
      }
    }

    const { data: result, error } = await query;

    if (error) {
      throw new DomainError(
        `Failed to fetch audit logs: ${error.message}`,
        'DATABASE_ERROR'
      );
    }

    return auditLogResponseSchema.array().parse(result || []);
  };
};
