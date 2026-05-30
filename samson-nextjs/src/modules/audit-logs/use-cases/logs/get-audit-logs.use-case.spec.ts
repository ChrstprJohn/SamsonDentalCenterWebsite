import { describe, expect, it, vi } from 'vitest';
import { GetAuditLogsUseCase } from './get-audit-logs.use-case';

describe('GetAuditLogsUseCase', () => {
  it('executes and fetches audit logs via queries repository', async () => {
    const mockResponse = [
      {
        id: 'log-1',
        actorId: 'user-1',
        action: 'APPROVED_APPOINTMENT',
        targetId: 'appt-1',
      },
    ];

    const mockQueries = {
      getAuditLogs: vi.fn().mockResolvedValue(mockResponse),
    } as any;

    const useCase = new GetAuditLogsUseCase(mockQueries);
    const filters = {
      action: 'APPROVED_APPOINTMENT',
    };

    const result = await useCase.execute(filters);

    expect(result).toEqual(mockResponse);
    expect(mockQueries.getAuditLogs).toHaveBeenCalledWith(filters);
  });
});
