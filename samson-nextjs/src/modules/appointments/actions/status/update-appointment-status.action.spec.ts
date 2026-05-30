import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateAppointmentStatusAction } from './update-appointment-status.action';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { UpdateAppointmentStatusUseCase } from '../../use-cases';
import { UnauthorizedError } from '@/shared/errors';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/status/update-appointment-status.use-case');

describe('updateAppointmentStatusAction', () => {
  const mockUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(UpdateAppointmentStatusUseCase).mockImplementation(function () {
      return { execute: mockUpdateStatus } as any;
    });
    vi.mocked(createClient).mockResolvedValue({} as any);
  });

  it('successfully updates appointment status when authorized', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    mockUpdateStatus.mockResolvedValue({ id: 'appt_123', status: 'APPROVED' });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'APPROVED',
    };

    const result = await updateAppointmentStatusAction(payload as any);

    expect(result).toEqual({ success: true, data: { id: 'appt_123', status: 'APPROVED' } });
    expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
    expect(mockUpdateStatus).toHaveBeenCalledWith(
      'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      'APPROVED',
      undefined,
      undefined
    );
  });

  it('maps reschedule metadata correctly when all fields provided', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    mockUpdateStatus.mockResolvedValue({ id: 'appt_123', status: 'APPROVED' });

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'APPROVED',
      newDate: '2026-06-01',
      newStartTime: '2026-06-01T09:00:00Z',
      newEndTime: '2026-06-01T09:30:00Z',
      newDoctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
    };

    await updateAppointmentStatusAction(payload as any);

    expect(mockUpdateStatus).toHaveBeenCalledWith(
      'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      'APPROVED',
      undefined,
      {
        date: '2026-06-01',
        startTime: '2026-06-01T09:00:00Z',
        endTime: '2026-06-01T09:30:00Z',
        doctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      }
    );
  });

  it('returns validation error when REJECTED has no reason', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      status: 'REJECTED',
      // statusReason intentionally omitted — required for REJECTED
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
});
