import { GetAuditLogsDto } from '../../dtos/logs/get-audit-logs.dto';
import { AuditLogResponseDto } from '../../dtos/logs/audit-log-response.dto';
import { AuditLogQueries } from '../../repositories/logs/audit-log.queries';

export class GetAuditLogsUseCase {
  constructor(private readonly queries: AuditLogQueries) {}

  async execute(filters?: GetAuditLogsDto): Promise<AuditLogResponseDto[]> {
    return await this.queries.getAuditLogs(filters);
  }
}
