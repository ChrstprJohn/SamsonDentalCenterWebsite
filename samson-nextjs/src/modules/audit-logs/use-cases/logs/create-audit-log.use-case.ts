import { CreateAuditLogDto } from '../../dtos/logs/create-audit-log.dto';
import { AuditLogResponseDto } from '../../dtos/logs/audit-log-response.dto';
import { AuditLogCommands } from '../../repositories/logs/audit-log.commands';

export class CreateAuditLogUseCase {
  constructor(private readonly commands: AuditLogCommands) {}

  async execute(data: CreateAuditLogDto): Promise<AuditLogResponseDto> {
    return await this.commands.createAuditLog(data);
  }
}
