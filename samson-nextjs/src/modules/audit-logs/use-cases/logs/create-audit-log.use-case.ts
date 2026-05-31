import { CreateAuditLogDto } from '../../dtos/logs/create-audit-log.dto';
import { AuditLogResponseDto } from '../../dtos/logs/audit-log-response.dto';

export const createAuditLogUseCase = (
  createAuditLog: (data: CreateAuditLogDto) => Promise<AuditLogResponseDto>
) => {
  return async (data: CreateAuditLogDto): Promise<AuditLogResponseDto> => {
    return await createAuditLog(data);
  };
};
