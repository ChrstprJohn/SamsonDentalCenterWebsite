import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cancelAppointmentAction } from './cancel-appointment.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockUpdateStatus } = vi.hoisted(() => {
  return { mockUpdateStatus: vi.fn() };
});

vi.mock('../../use-cases/status/cancel-appointment.use-case', () => {
  return {
    cancelAppointmentUseCase: () => mockUpdateStatus,
  };
});

describe('cancelAppointmentAction', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect })) } as any;
  const validUserId = 'da95a63c-333e-4b68-98e3-82bdf1a07bd9';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase);
  });

  it('cancels appointment when user owns it', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: validUserId } as any);
    mockSingle.mockResolvedValue({
      data: {
        id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
        service_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
        doctor_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
        status: 'PENDING',
        patient_id: validUserId,
        date: '2025-01-01',
        start_time: '2025-01-01T10:00:00Z',
        end_time: '2025-01-01T10:30:00Z',
      },
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
      validUserId,
      'PATIENT',
      'Cannot make it'
    );
  });

  it('returns error if patient does not own the appointment', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: validUserId } as any);
    mockSingle.mockResolvedValue({
      data: {
        id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
        service_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
        doctor_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
        status: 'PENDING',
        patient_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bda',
        date: '2025-01-01',
        start_time: '2025-01-01T10:00:00Z',
        end_time: '2025-01-01T10:30:00Z',
      },
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
