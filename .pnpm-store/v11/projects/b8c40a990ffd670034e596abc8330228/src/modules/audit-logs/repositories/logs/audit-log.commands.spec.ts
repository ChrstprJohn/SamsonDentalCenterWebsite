import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuditLogCommand } from './audit-log.commands';

const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe('createAuditLogCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ insert: mockInsert });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
  });

  it('inserts audit log and returns mapped response', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
        actor_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
        action: 'MARKED_NO_SHOW',
        target_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
        reason: 'Patient called',
        created_at: '2026-05-30T13:55:59.000Z',
      },
      error: null,
    });

    const createAuditLog = createAuditLogCommand(mockSupabase);
    const result = await createAuditLog({
      actorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
      action: 'MARKED_NO_SHOW',
      targetId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
      reason: 'Patient called',
    });

    expect(result.actorId).toBe('da95a63c-333e-4b68-98e3-82bdf1a07bd3');
    expect(mockFrom).toHaveBeenCalledWith('audit_logs');
    expect(mockInsert).toHaveBeenCalledWith([
      {
        actor_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
        action: 'MARKED_NO_SHOW',
        target_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
        reason: 'Patient called',
      },
    ]);
  });

  it('throws DomainError when database insert fails', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

    const createAuditLog = createAuditLogCommand(mockSupabase);
    await expect(
      createAuditLog({
        actorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
        action: 'MARKED_NO_SHOW',
        targetId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
      })
    ).rejects.toThrow('Failed to create audit log: Insert failed');
  });
});
