import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveNoShowAction } from './resolve-no-show.action';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockResolveNoShow } = vi.hoisted(() => {
  return { mockResolveNoShow: vi.fn() };
});

vi.mock('../../use-cases/status/resolve-no-show.use-case', () => {
  return {
    resolveNoShowUseCase: () => mockResolveNoShow,
  };
});

describe('resolveNoShowAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({} as any);
  });

  it('successfully resolves no-show when authorized', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'staff_1' } as any);
    mockResolveNoShow.mockResolvedValue({ id: 'appt_123', status: 'COMPLETED' });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      resolution: 'COMPLETED' as const,
      reason: 'Forgot to check in',
    };

    const result = await resolveNoShowAction(payload);

    expect(result).toEqual({ success: true, data: { id: 'appt_123', status: 'COMPLETED' } });
    expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
    expect(mockResolveNoShow).toHaveBeenCalledWith(
      'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      'staff_1',
      'STAFF',
      'COMPLETED',
      'Forgot to check in',
      undefined
    );
  });
});
