import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuditLogsQuery } from './audit-log.queries';

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe('getAuditLogsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockImplementation(function (this: any) {
      return this;
    });
  });

  it('fetches and returns mapped audit logs without filters', async () => {
    mockOrder.mockResolvedValue({
      data: [
        {
          id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
          actor_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
          action: 'MARKED_NO_SHOW',
          target_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
          reason: 'Patient called',
          created_at: '2026-05-30T13:55:59.000Z',
        },
      ],
      error: null,
    });

    const getAuditLogs = getAuditLogsQuery(mockSupabase);
    const result = await getAuditLogs();

    expect(result.length).toBe(1);
    expect(result[0].actorId).toBe('da95a63c-333e-4b68-98e3-82bdf1a07bd3');
    expect(mockFrom).toHaveBeenCalledWith('audit_logs');
  });

  it('filters audit logs by parameters', async () => {
    const mockQuery = {
      eq: mockEq,
    };
    mockOrder.mockReturnValue(mockQuery);
    mockEq.mockImplementation(function (this: any) {
      return this;
    });
    mockEq.mockResolvedValue({
      data: [],
      error: null,
    });

    const getAuditLogs = getAuditLogsQuery(mockSupabase);
    await getAuditLogs({
      actorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
    });

    expect(mockEq).toHaveBeenCalledWith('actor_id', 'da95a63c-333e-4b68-98e3-82bdf1a07bd3');
  });

  it('throws DomainError when query fails', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'Fetch failed' } });

    const getAuditLogs = getAuditLogsQuery(mockSupabase);
    await expect(getAuditLogs()).rejects.toThrow('Failed to fetch audit logs: Fetch failed');
  });
});
