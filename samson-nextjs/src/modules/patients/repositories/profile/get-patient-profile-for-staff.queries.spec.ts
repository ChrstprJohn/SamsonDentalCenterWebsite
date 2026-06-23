import { describe, it, expect, vi } from 'vitest';
import { getPatientProfileForStaffQuery } from './get-patient-profile-for-staff.queries';
import { NotFoundError } from '@/shared/errors';

describe('getPatientProfileForStaffQuery (Functional)', () => {
  it('throws NotFoundError if patient does not exist', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
    };

    const getProfile = getPatientProfileForStaffQuery(mockSupabase as any);
    await expect(getProfile('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow(NotFoundError);
  });

  it('returns patient data with reliability counters if found', async () => {
    const mockPatient = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+12345678901',
      date_of_birth: '1990-01-01',
      cancel_count: 5,
      no_show_count: 2,
      reschedule_count: 3,
    };
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockPatient, error: null }),
    };

    const getProfile = getPatientProfileForStaffQuery(mockSupabase as any);
    const result = await getProfile('123e4567-e89b-12d3-a456-426614174000');
    expect(result).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john@example.com',
      firstName: 'John',
      middleName: null,
      lastName: 'Doe',
      suffix: null,
      phoneNumber: '+12345678901',
      dateOfBirth: '1990-01-01',
      avatarUrl: null,
      cancelCount: 5,
      noShowCount: 2,
      rescheduleCount: 3,
      createdAt: undefined,
      updatedAt: undefined,
    });
  });
});
