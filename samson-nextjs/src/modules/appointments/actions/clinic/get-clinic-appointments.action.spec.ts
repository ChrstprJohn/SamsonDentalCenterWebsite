import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getClinicAppointmentsAction } from './get-clinic-appointments.action';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { GetClinicAppointmentsUseCase } from '../../use-cases';
import { UnauthorizedError } from '@/shared/errors';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/clinic/get-clinic-appointments.use-case');

describe('getClinicAppointmentsAction', () => {
  const mockGetClinicAppointments = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GetClinicAppointmentsUseCase).mockImplementation(function () {
      return {
        execute: mockGetClinicAppointments,
      } as any;
    });
    vi.mocked(createClient).mockResolvedValue({} as any);
  });

  it('successfully retrieves clinic appointments if authorized', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    mockGetClinicAppointments.mockResolvedValue([{ id: 'appt_1' }]);

    const payload = {
      date: '2026-06-01',
      status: 'PENDING',
      doctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
    };

    const result = await getClinicAppointmentsAction(payload as any);

    expect(result).toEqual({ success: true, data: [{ id: 'appt_1' }] });
    expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
    expect(mockGetClinicAppointments).toHaveBeenCalledWith(payload);
  });

  it('returns error if user is not authorized', async () => {
    vi.mocked(authorizeRole).mockRejectedValue(new UnauthorizedError('Insufficient permissions'));

    const result = await getClinicAppointmentsAction({} as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Insufficient permissions');
    expect(mockGetClinicAppointments).not.toHaveBeenCalled();
  });
});
