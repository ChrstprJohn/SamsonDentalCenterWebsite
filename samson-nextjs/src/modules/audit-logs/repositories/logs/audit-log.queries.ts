import { SupabaseClient } from '@supabase/supabase-js';
import { GetAuditLogsDto } from '../../dtos/logs/get-audit-logs.dto';
import { AuditLogResponseDto, mapAuditLogRecords } from '../../dtos/logs/audit-log-response.dto';
import { DomainError } from '@/shared/errors';

export class AuditLogQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  async getAuditLogs(filters?: GetAuditLogsDto): Promise<AuditLogResponseDto[]> {
    let query = this.supabase
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

    return mapAuditLogRecords((result || []) as Record<string, unknown>[]);
  }
}
