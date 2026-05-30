import { describe, it, expect, vi } from 'vitest';
import { PatientProfileQueries } from './patient-profile.queries';
import { NotFoundError } from '@/shared/errors';

describe('PatientProfileQueries', () => {
  it('throws NotFoundError if patient does not exist', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
    };

    const queries = new PatientProfileQueries(mockSupabase as any);
    await expect(queries.getProfileById('123')).rejects.toThrow(NotFoundError);
  });

  it('returns patient data if found', async () => {
    const mockPatient = {
      id: '123',
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

    const queries = new PatientProfileQueries(mockSupabase as any);
    const result = await queries.getProfileById('123');
    expect(result).toEqual({
      id: '123',
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
