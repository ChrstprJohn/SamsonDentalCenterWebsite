import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientDetailsForStaffAction } from './get-patient-details-for-staff.action';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { getPatientProfileForStaffQuery } from '../../repositories/exports';
import { getAppointmentsByUserQuery } from '@/modules/appointments/repositories/exports';
import { UnauthorizedError, NotFoundError } from '@/shared/errors';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../repositories/exports');
vi.mock('@/modules/appointments/repositories/exports');

const mockGetProfile = vi.fn();
const mockGetAppointments = vi.fn();

describe('getPatientDetailsForStaffAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({} as any);
    vi.mocked(getPatientProfileForStaffQuery).mockReturnValue(mockGetProfile);
    vi.mocked(getAppointmentsByUserQuery).mockReturnValue(mockGetAppointments);
  });

  it('successfully fetches profile, history and counts completed appts if authorized', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    mockGetProfile.mockResolvedValue({
      id: 'patient_123',
      firstName: 'Jane',
      lastName: 'Doe',
      cancelCount: 1,
      noShowCount: 0,
      rescheduleCount: 2,
    });
    mockGetAppointments.mockResolvedValue([
      { id: 'appt_1', status: 'COMPLETED', dependentId: null },
      { id: 'appt_2', status: 'PENDING', dependentId: null },
      { id: 'appt_3', status: 'COMPLETED', dependentId: 'some_dependent' },
    ]);

    const result = await getPatientDetailsForStaffAction('patient_123');

    expect(result.success).toBe(true);
    expect(result.data?.profile.firstName).toBe('Jane');
    expect(result.data?.reliability).toEqual({
      completedCount: 1, // Only appt_1 is completed and belongs to owner (dependentId is null)
      cancelCount: 1,
      noShowCount: 0,
      rescheduleCount: 2,
    });
    expect(result.data?.history.length).toBe(2);
    expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
  });

  it('filters by dependentId if provided', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    mockGetProfile.mockResolvedValue({
      id: 'patient_123',
      firstName: 'Jane',
      lastName: 'Doe',
      cancelCount: 1,
      noShowCount: 0,
      rescheduleCount: 2,
    });
    mockGetAppointments.mockResolvedValue([
      { id: 'appt_1', status: 'COMPLETED', dependentId: 'dep_123' },
      { id: 'appt_2', status: 'COMPLETED', dependentId: null },
      { id: 'appt_3', status: 'COMPLETED', dependentId: 'dep_123' },
    ]);

    const result = await getPatientDetailsForStaffAction('patient_123', 'dep_123');

    expect(result.success).toBe(true);
    expect(result.data?.reliability.completedCount).toBe(2);
    expect(result.data?.history.length).toBe(2);
    expect(result.data?.history[0].id).toBe('appt_1');
  });

  it('fails if user is not authorized', async () => {
    vi.mocked(authorizeRole).mockRejectedValue(new UnauthorizedError('Insufficient permissions'));

    const result = await getPatientDetailsForStaffAction('patient_123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Insufficient permissions');
  });

  it('returns error if patient profile is not found', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'staff_1' } as any);
    mockGetProfile.mockRejectedValue(new NotFoundError('Patient profile not found.'));

    const result = await getPatientDetailsForStaffAction('patient_unknown');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Patient profile not found.');
  });
});
