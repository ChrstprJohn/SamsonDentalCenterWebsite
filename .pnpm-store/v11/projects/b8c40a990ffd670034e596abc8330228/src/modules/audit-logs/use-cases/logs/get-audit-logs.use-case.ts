import { GetAuditLogsDto } from '../../dtos/logs/get-audit-logs.dto';
import { AuditLogResponseDto } from '../../dtos/logs/audit-log-response.dto';

export const getAuditLogsUseCase = (
  getAuditLogs: (filters?: GetAuditLogsDto) => Promise<AuditLogResponseDto[]>
) => {
  return async (filters?: GetAuditLogsDto): Promise<AuditLogResponseDto[]> => {
    return await getAuditLogs(filters);
  };
};
