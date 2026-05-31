import { describe, it, expect, vi } from 'vitest';
import { getDependentsByPatientIdQuery } from './patient-dependents.queries';

describe('PatientDependentsQueries (Functional)', () => {
  it('should get dependents', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            patient_id: '123e4567-e89b-12d3-a456-426614174000',
            first_name: 'Jane',
            last_name: 'Doe',
            date_of_birth: '2010-05-15',
            relationship: 'CHILD',
          }
        ],
        error: null,
      }),
    } as any;

    const getDependentsByPatientId = getDependentsByPatientIdQuery(mockSupabase);
    const result = await getDependentsByPatientId('123e4567-e89b-12d3-a456-426614174000');

    expect(result.length).toBe(1);
    expect(result[0].firstName).toBe('Jane');
  });
});

