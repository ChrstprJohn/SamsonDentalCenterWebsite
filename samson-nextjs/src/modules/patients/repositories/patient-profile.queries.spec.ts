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
    const mockPatient = { id: '123', first_name: 'John' };
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockPatient, error: null }),
    };

    const queries = new PatientProfileQueries(mockSupabase as any);
    const result = await queries.getProfileById('123');
    expect(result).toEqual(mockPatient);
  });
});
