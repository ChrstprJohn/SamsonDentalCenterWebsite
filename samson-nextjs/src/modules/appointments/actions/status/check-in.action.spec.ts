import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkInAction } from './check-in.action';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockCheckIn } = vi.hoisted(() => {
  return { mockCheckIn: vi.fn() };
});

vi.mock('../../use-cases/status/check-in.use-case', () => {
  return {
    checkInUseCase: () => mockCheckIn,
  };
});

describe('checkInAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({} as any);
  });

  it('successfully checks in when authorized', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'staff_1' } as any);
    mockCheckIn.mockResolvedValue({ id: 'appt_123', status: 'CHECKED_IN' });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
    };

    const result = await checkInAction(payload);

    expect(result).toEqual({ success: true, data: { id: 'appt_123', status: 'CHECKED_IN' } });
    expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
    expect(mockCheckIn).toHaveBeenCalledWith(
      'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      'staff_1',
      'STAFF'
    );
  });
});
