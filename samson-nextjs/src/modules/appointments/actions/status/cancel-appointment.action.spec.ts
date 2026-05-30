import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cancelAppointmentAction } from './cancel-appointment.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { UpdateAppointmentStatusUseCase } from '../../use-cases';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/status/update-appointment-status.use-case');

describe('cancelAppointmentAction', () => {
  const mockUpdateStatus = vi.fn();

  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect })) } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(UpdateAppointmentStatusUseCase).mockImplementation(function () {
      return { execute: mockUpdateStatus } as any;
    });
    vi.mocked(createClient).mockResolvedValue(mockSupabase);
  });

  it('cancels appointment when user owns it', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user_123' } as any);
    mockSingle.mockResolvedValue({
      data: { user_id: 'user_123', patient_id: null },
      error: null,
    });
    mockUpdateStatus.mockResolvedValue({ id: 'appt_123', status: 'CANCELLED' });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'CANCELLED',
      statusReason: 'Cannot make it',
    };

    const result = await cancelAppointmentAction(payload as any);

    expect(result).toEqual({ success: true, data: { id: 'appt_123', status: 'CANCELLED' } });
    expect(mockUpdateStatus).toHaveBeenCalledWith(
      'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      'CANCELLED',
      'Cannot make it'
    );
  });

  it('returns error if patient does not own the appointment', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user_123' } as any);
    mockSingle.mockResolvedValue({
      data: { user_id: 'different_user', patient_id: null },
      error: null,
    });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'CANCELLED',
      statusReason: 'Cannot make it',
    };

    const result = await cancelAppointmentAction(payload as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('not authorized to cancel');
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });
});
