import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestRescheduleAction } from './request-reschedule.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockUpdateStatus } = vi.hoisted(() => {
  return { mockUpdateStatus: vi.fn() };
});

vi.mock('../../use-cases/status/update-appointment-status.use-case', () => {
  return {
    updateAppointmentStatusUseCase: () => mockUpdateStatus,
    UpdateAppointmentStatusUseCase: class {
      execute = mockUpdateStatus;
    },
  };
});

describe('requestRescheduleAction', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect })) } as any;
  const validUserId = 'da95a63c-333e-4b68-98e3-82bdf1a07bd9';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase);
  });

  it('requests reschedule successfully when user owns the appointment', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: validUserId } as any);
    mockSingle.mockResolvedValue({
      data: {
        id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
        service_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3',
        doctor_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd4',
        status: 'PENDING',
        patient_id: validUserId,
      },
      error: null,
    });
    mockUpdateStatus.mockResolvedValue({ id: 'appt_123', status: 'RESCHEDULE_REQUESTED' });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'RESCHEDULE_REQUESTED',
      statusReason: 'Conflict in schedule',
    };

    const result = await requestRescheduleAction(payload as any);

    expect(result).toEqual({ success: true, data: { id: 'appt_123', status: 'RESCHEDULE_REQUESTED' } });
    expect(mockUpdateStatus).toHaveBeenCalledWith(
      'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      'RESCHEDULE_REQUESTED',
      'Conflict in schedule'
    );
  });

  it('returns error if wrong status passed to reschedule endpoint', async () => {
    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'CANCELLED',
      statusReason: 'Test',
    };

    const result = await requestRescheduleAction(payload as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid action for reschedule request endpoint');
  });
});
