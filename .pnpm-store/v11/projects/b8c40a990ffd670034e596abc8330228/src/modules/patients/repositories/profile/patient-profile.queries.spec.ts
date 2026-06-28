import { describe, it, expect, vi } from 'vitest';
import { getPatientProfileByIdQuery } from './patient-profile.queries';
import { NotFoundError } from '@/shared/errors';

describe('PatientProfileQueries (Functional)', () => {
  it('throws NotFoundError if patient does not exist', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
    };

    const getProfileById = getPatientProfileByIdQuery(mockSupabase as any);
    await expect(getProfileById('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow(NotFoundError);
  });

  it('returns patient data if found', async () => {
    const mockPatient = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+12345678901',
      date_of_birth: '1990-01-01',
    };
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockPatient, error: null }),
    };

    const getProfileById = getPatientProfileByIdQuery(mockSupabase as any);
    const result = await getProfileById('123e4567-e89b-12d3-a456-426614174000');
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
      createdAt: undefined,
      updatedAt: undefined,
    });
  });
});

