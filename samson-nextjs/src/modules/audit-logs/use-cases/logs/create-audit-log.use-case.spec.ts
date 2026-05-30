import { describe, expect, it, vi } from 'vitest';
import { CreateAuditLogUseCase } from './create-audit-log.use-case';

describe('CreateAuditLogUseCase', () => {
  it('executes and creates audit log via repository', async () => {
    const mockResponse = {
      id: 'log-1',
      actorId: 'user-1',
      action: 'APPROVED_APPOINTMENT',
      targetId: 'appt-1',
    };

    const mockCommands = {
      createAuditLog: vi.fn().mockResolvedValue(mockResponse),
    } as any;

    const useCase = new CreateAuditLogUseCase(mockCommands);
    const data = {
      actorId: 'user-1',
      action: 'APPROVED_APPOINTMENT',
      targetId: 'appt-1',
    };

    const result = await useCase.execute(data);

    expect(result).toEqual(mockResponse);
    expect(mockCommands.createAuditLog).toHaveBeenCalledWith(data);
  });
});
