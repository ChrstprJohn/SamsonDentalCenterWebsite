import { describe, it, expect, vi, beforeEach } from 'vitest';
import { undoCheckInAction } from './undo-check-in.action';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockUndoCheckIn } = vi.hoisted(() => {
  return { mockUndoCheckIn: vi.fn() };
});

vi.mock('../../use-cases/status/undo-check-in.use-case', () => {
  return {
    undoCheckInUseCase: () => mockUndoCheckIn,
  };
});

describe('undoCheckInAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({} as any);
  });

  it('successfully undoes check-in when authorized', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'staff_1' } as any);
    mockUndoCheckIn.mockResolvedValue({ id: 'appt_123', status: 'APPROVED' });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
    };

    const result = await undoCheckInAction(payload);

    expect(result).toEqual({ success: true, data: { id: 'appt_123', status: 'APPROVED' } });
    expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
    expect(mockUndoCheckIn).toHaveBeenCalledWith(
      'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      'staff_1',
      'STAFF'
    );
  });
});
