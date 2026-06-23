import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailableDoctorsForDateAction } from './get-available-doctors-for-date.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockGetDoctorSchedules } = vi.hoisted(() => {
  return {
    mockGetDoctorSchedules: vi.fn(),
  };
});

vi.mock('../../repositories/exports', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    getDoctorSchedulesQuery: () => mockGetDoctorSchedules,
  };
});

describe('getAvailableDoctorsForDateAction', () => {
  const validServiceId = 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch schedules, deduplicate, and return distinct doctors list', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'secretary-uuid',
      role: 'SECRETARY',
    } as any);

    vi.mocked(createClient).mockResolvedValue({} as any);

    const mockSchedules = [
      {
        id: 'sched-1',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Alice Smith',
        dayOfWeek: 1,
        startTime: '09:00:00',
        endTime: '17:00:00',
      },
      {
        id: 'sched-2',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Alice Smith',
        dayOfWeek: 1,
        startTime: '10:00:00',
        endTime: '14:00:00',
      },
      {
        id: 'sched-3',
        doctorId: 'doctor-2',
        doctorName: 'Dr. Bob Jones',
        dayOfWeek: 1,
        startTime: '09:00:00',
        endTime: '17:00:00',
      },
    ];

    mockGetDoctorSchedules.mockResolvedValueOnce(mockSchedules);

    const payload = {
      date: '2026-06-25',
      serviceId: validServiceId,
    };

    const response = await getAvailableDoctorsForDateAction(payload);
    expect(response.success).toBe(true);
    expect(response.data).toEqual([
      { doctorId: 'doctor-1', doctorName: 'Dr. Alice Smith' },
      { doctorId: 'doctor-2', doctorName: 'Dr. Bob Jones' },
    ]);
  });

  it('should return unauthorized error for PATIENT role', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'patient-uuid',
      role: 'PATIENT',
    } as any);

    const payload = {
      date: '2026-06-25',
      serviceId: validServiceId,
    };

    const response = await getAvailableDoctorsForDateAction(payload);
    expect(response.success).toBe(false);
    expect(response.error).toContain('Unauthorized');
  });
});
