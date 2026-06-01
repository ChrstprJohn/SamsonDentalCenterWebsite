import { describe, it, expect, vi } from 'vitest';
import { createPatientCommand } from './patient-profile.commands';
import { RegisterPatientDto } from '../../dtos';
import { DomainError } from '@/shared/errors';
import { emailOutboxCommands } from '../../../emails';

vi.mock('server-only', () => ({}));
vi.mock('../../../emails');

describe('PatientProfileCommands (Functional)', () => {
  it('successfully creates a patient', async () => {
    const validData: RegisterPatientDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    const createdAt = new Date().toISOString();
    const mockInsertedRecord = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: validData.email,
      first_name: validData.firstName,
      last_name: validData.lastName,
      phone_number: validData.phoneNumber,
      date_of_birth: validData.dateOfBirth,
      created_at: createdAt,
    };
    const mockSupabase = {
      auth: { 
        admin: {
          generateLink: vi.fn().mockResolvedValue({ data: { user: { id: '123e4567-e89b-12d3-a456-426614174000' } }, error: null })
        }
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockInsertedRecord, error: null }),
    };

    vi.mocked(emailOutboxCommands).mockReturnValue({
      queueEmail: vi.fn(),
    } as any);

    const createPatient = createPatientCommand(mockSupabase as any);
    const result = await createPatient(validData);

    expect(result).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: validData.email,
      firstName: validData.firstName,
      middleName: null,
      lastName: validData.lastName,
      suffix: null,
      phoneNumber: validData.phoneNumber,
      dateOfBirth: validData.dateOfBirth,
      avatarUrl: null,
      createdAt,
      updatedAt: undefined,
    });
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
  });

  it('throws a DomainError if Supabase insertion fails', async () => {
    const validData: RegisterPatientDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    const mockSupabase = {
      auth: { 
        admin: {
          generateLink: vi.fn().mockResolvedValue({ data: null, error: { message: 'Auth failed' } })
        }
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database constraint failed' } }),
    };

    const createPatient = createPatientCommand(mockSupabase as any);
    await expect(createPatient(validData))
      .rejects.toThrow(DomainError);
  });
});

