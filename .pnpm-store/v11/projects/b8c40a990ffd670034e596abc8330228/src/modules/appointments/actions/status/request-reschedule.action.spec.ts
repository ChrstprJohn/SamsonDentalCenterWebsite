import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestRescheduleAction } from './request-reschedule.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

// Hoist the mock fn so it can be asserted on below
const { mockUseCase } = vi.hoisted(() => {
  return { mockUseCase: vi.fn() };
});

vi.mock('../../use-cases/status/request-reschedule.use-case', () => ({
  requestRescheduleUseCase: () => mockUseCase,
}));

describe('requestRescheduleAction', () => {
  const validUserId    = '123e4567-e89b-12d3-a456-426614174009';
  const appointmentId  = '123e4567-e89b-12d3-a456-426614174002';
  const doctorId       = '123e4567-e89b-12d3-a456-426614174004';
  const serviceId      = '123e4567-e89b-12d3-a456-426614174005';

  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect })) } as any;

  const validPayload = {
    appointmentId,
    status: 'RESCHEDULE_REQUESTED',
    statusReason: 'Conflict in schedule',
    newDate: '2026-06-01',
    newStartTime: '2026-06-01T09:00:00Z',
    newEndTime: '2026-06-01T09:30:00Z',
    newDoctorId: doctorId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase);
  });

  it('returns success when user owns the appointment', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: validUserId } as any);
    mockSingle.mockResolvedValue({
      data: {
        id: appointmentId,
        patient_id: validUserId,
        service_id: serviceId,
        doctor_id: doctorId,
        status: 'PENDING',
        date: '2026-06-01',
        start_time: '2026-06-01T10:00:00Z',
        end_time: '2026-06-01T10:30:00Z',
      },
      error: null,
    });
    mockUseCase.mockResolvedValue({ id: appointmentId, status: 'RESCHEDULE_REQUESTED' });

    const result = await requestRescheduleAction(validPayload as any);

    expect(result).toEqual({ success: true, data: { id: appointmentId, status: 'RESCHEDULE_REQUESTED' } });
    expect(mockUseCase).toHaveBeenCalledWith(
      appointmentId,
      validUserId,
      'PATIENT',
      'Conflict in schedule',
      {
        date: '2026-06-01',
        startTime: '2026-06-01T09:00:00Z',
        endTime: '2026-06-01T09:30:00Z',
        doctorId,
      }
    );
  });

  it('returns error if user does not own the appointment', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000099' } as any);
    mockSingle.mockResolvedValue({
      data: {
        id: appointmentId,
        patient_id: validUserId, // different from authenticated user
        service_id: serviceId,
        doctor_id: doctorId,
        status: 'PENDING',
        date: '2026-06-01',
        start_time: '2026-06-01T10:00:00Z',
        end_time: '2026-06-01T10:30:00Z',
      },
      error: null,
    });

    const result = await requestRescheduleAction(validPayload as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('not authorized');
    expect(mockUseCase).not.toHaveBeenCalled();
  });

  it('returns error if wrong status passed', async () => {
    const payload = { ...validPayload, status: 'CANCELLED' };

    const result = await requestRescheduleAction(payload as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(mockUseCase).not.toHaveBeenCalled();
  });
});
