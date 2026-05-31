import { describe, it, expect, vi } from 'vitest';
import { addDependentCommand } from './patient-dependents.commands';

describe('PatientDependentsCommands (Functional)', () => {
  it('should add a dependent', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          patient_id: '123e4567-e89b-12d3-a456-426614174000',
          first_name: 'Jane',
          last_name: 'Doe',
          date_of_birth: '2010-05-15',
          relationship: 'CHILD',
        },
        error: null,
      }),
    } as any;

    const addDependent = addDependentCommand(mockSupabase);
    const result = await addDependent({
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '2010-05-15',
      relationship: 'CHILD',
    });

    expect(result.firstName).toBe('Jane');
    expect(mockSupabase.from).toHaveBeenCalledWith('patient_dependents');
  });
});

