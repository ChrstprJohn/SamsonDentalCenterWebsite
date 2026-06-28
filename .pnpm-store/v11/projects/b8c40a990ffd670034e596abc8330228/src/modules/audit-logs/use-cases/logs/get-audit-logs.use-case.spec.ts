import { describe, expect, it, vi } from 'vitest';
import { getAuditLogsUseCase } from './get-audit-logs.use-case';

describe('getAuditLogsUseCase', () => {
  it('executes and fetches audit logs via queries repository', async () => {
    const mockResponse = [
      {
        id: 'log-1',
        actorId: 'user-1',
        action: 'APPROVED_APPOINTMENT',
        targetId: 'appt-1',
      },
    ];

    const getAuditLogs = vi.fn().mockResolvedValue(mockResponse);

    const useCase = getAuditLogsUseCase(getAuditLogs);
    const filters = {
      action: 'APPROVED_APPOINTMENT',
    };

    const result = await useCase(filters);

    expect(result).toEqual(mockResponse);
    expect(getAuditLogs).toHaveBeenCalledWith(filters);
  });
});
