import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateAppointmentStatusAction } from './update-appointment-status.action';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { UnauthorizedError } from '@/shared/errors';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockUpdateStatus } = vi.hoisted(() => {
  return { mockUpdateStatus: vi.fn() };
});

vi.mock('../../use-cases/status/update-appointment-status.use-case', () => {
  return {
    updateAppointmentStatusUseCase: () => mockUpdateStatus,
  };
});

describe('updateAppointmentStatusAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({} as any);
  });

  it('successfully updates appointment status when authorized', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'staff_1' } as any);
    mockUpdateStatus.mockResolvedValue({ id: 'appt_123', status: 'APPROVED' });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'APPROVED',
      statusReason: 'Approved because calendar cleared',
    };

    const result = await updateAppointmentStatusAction(payload as any);

    expect(result).toEqual({ success: true, data: { id: 'appt_123', status: 'APPROVED' } });
    expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
    expect(mockUpdateStatus).toHaveBeenCalledWith(
      'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      'staff_1',
      'STAFF',
      'APPROVED',
      'Approved because calendar cleared',
      undefined
    );
  });

  it('maps reschedule metadata correctly when all fields provided', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'staff_1' } as any);
    mockUpdateStatus.mockResolvedValue({ id: 'appt_123', status: 'APPROVED' });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'APPROVED',
      statusReason: 'Rescheduling requested slot',
      newDate: '2026-06-01',
      newStartTime: '2026-06-01T09:00:00Z',
      newEndTime: '2026-06-01T09:30:00Z',
      newDoctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
    };

    await updateAppointmentStatusAction(payload as any);

    expect(mockUpdateStatus).toHaveBeenCalledWith(
      'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      'staff_1',
      'STAFF',
      'APPROVED',
      'Rescheduling requested slot',
      {
        date: '2026-06-01',
        startTime: '2026-06-01T09:00:00Z',
        endTime: '2026-06-01T09:30:00Z',
        doctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      }
    );
  });

  it('returns validation error when payload has no reason', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'staff_1' } as any);

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'APPROVED',
      // statusReason intentionally omitted
    };

    const result = await updateAppointmentStatusAction(payload as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('returns error if user is not authorized', async () => {
    vi.mocked(authorizeRole).mockRejectedValue(new UnauthorizedError('Insufficient permissions'));

    const result = await updateAppointmentStatusAction({} as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Insufficient permissions');
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('returns DomainError message on use-case failure', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'staff_1' } as any);
    const { DomainError } = await import('@/shared/errors');
    mockUpdateStatus.mockRejectedValue(new DomainError('Terminal state', 'INVALID_STATUS_TRANSITION'));

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'APPROVED',
      statusReason: 'some reason',
    };

    const result = await updateAppointmentStatusAction(payload as any);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Terminal state');
  });
});
