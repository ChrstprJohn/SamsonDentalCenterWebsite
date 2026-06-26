import { describe, it, expect, vi, beforeEach } from 'vitest';
import { markNoShowAction } from './mark-no-show.action';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockMarkNoShow } = vi.hoisted(() => {
  return { mockMarkNoShow: vi.fn() };
});

vi.mock('../../use-cases/status/mark-no-show.use-case', () => {
  return {
    markNoShowUseCase: () => mockMarkNoShow,
  };
});

describe('markNoShowAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({} as any);
  });

  it('successfully marks no-show when authorized', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'staff_1' } as any);
    mockMarkNoShow.mockResolvedValue({ id: 'appt_123', status: 'NO_SHOW' });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
    };

    const result = await markNoShowAction(payload);

    expect(result).toEqual({ success: true, data: { id: 'appt_123', status: 'NO_SHOW' } });
    expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
    expect(mockMarkNoShow).toHaveBeenCalledWith(
      'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      'staff_1',
      'STAFF'
    );
  });
});
