import { describe, expect, it, vi } from 'vitest';
import { createAuditLogUseCase } from './create-audit-log.use-case';

describe('createAuditLogUseCase', () => {
  it('executes and creates audit log via repository', async () => {
    const mockResponse = {
      id: 'log-1',
      actorId: 'user-1',
      action: 'APPROVED_APPOINTMENT',
      targetId: 'appt-1',
    };

    const createAuditLog = vi.fn().mockResolvedValue(mockResponse);

    const useCase = createAuditLogUseCase(createAuditLog);
    const data = {
      actorId: 'user-1',
      action: 'APPROVED_APPOINTMENT',
      targetId: 'appt-1',
    };

    const result = await useCase(data);

    expect(result).toEqual(mockResponse);
    expect(createAuditLog).toHaveBeenCalledWith(data);
  });
});
