import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { GetAuditLogsUseCase } from '../../use-cases/logs/get-audit-logs.use-case';
import { getAuditLogsAction } from './get-audit-logs.action';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/logs/get-audit-logs.use-case');

describe('getAuditLogsAction', () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'admin-1' } as any);
    vi.mocked(createClient).mockResolvedValue({} as any);
    vi.mocked(GetAuditLogsUseCase).mockImplementation(function () {
      return {
        execute: mockExecute,
      } as any;
    });
  });

  it('successfully fetches audit logs when authorized as ADMIN', async () => {
    mockExecute.mockResolvedValue([
      { id: 'log-1', actorId: 'user-1', action: 'APPROVED', targetId: 'appt-1' },
    ]);

    const result = await getAuditLogsAction({
      action: 'APPROVED',
    });

    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
    expect(authorizeRole).toHaveBeenCalledWith('ADMIN');
    expect(mockExecute).toHaveBeenCalledWith({ action: 'APPROVED' });
  });

  it('returns validation error if filter schema validation fails', async () => {
    const result = await getAuditLogsAction({
      actorId: 'invalid-uuid',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
