import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDoctorScheduleAction } from './get-doctor-schedule.action';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { getExistingAppointmentsQuery } from '../../repositories/exports';
import { UnauthorizedError } from '@/shared/errors';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../repositories/exports');

const mockGetExistingAppointments = vi.fn();

describe('getDoctorScheduleAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({} as any);
    vi.mocked(getExistingAppointmentsQuery).mockReturnValue(mockGetExistingAppointments);
  });

  it('successfully fetches doctor schedule if authorized', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    mockGetExistingAppointments.mockResolvedValue([
      { id: 'appt_1', startTime: '09:00 AM', endTime: '09:30 AM' },
    ]);

    const result = await getDoctorScheduleAction('doctor_123', '2026-06-25');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { id: 'appt_1', startTime: '09:00 AM', endTime: '09:30 AM' },
    ]);
    expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
    expect(mockGetExistingAppointments).toHaveBeenCalledWith('2026-06-25', 'doctor_123');
  });

  it('fails if user is not authorized', async () => {
    vi.mocked(authorizeRole).mockRejectedValue(new UnauthorizedError('Insufficient permissions'));

    const result = await getDoctorScheduleAction('doctor_123', '2026-06-25');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Insufficient permissions');
    expect(mockGetExistingAppointments).not.toHaveBeenCalled();
  });
});
