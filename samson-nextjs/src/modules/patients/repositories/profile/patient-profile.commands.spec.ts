import { describe, it, expect, vi } from 'vitest';
import { PatientProfileCommands } from './patient-profile.commands';
import { RegisterPatientDto } from '../dtos';
import { DomainError } from '@/shared/errors';

describe('PatientProfileCommands', () => {
  it('successfully creates a patient', async () => {
    const validData: RegisterPatientDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      dateOfBirth: '1990-01-01',
    };
    const mockInsertedRecord = { 
      id: 'user_123', 
      ...validData,
      created_at: new Date().toISOString() 
    };
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockInsertedRecord, error: null }),
    };

    const commands = new PatientProfileCommands(mockSupabase as any);
    const result = await commands.createPatient('user_123', validData);

    expect(result).toEqual(mockInsertedRecord);
    expect(mockSupabase.from).toHaveBeenCalledWith('patients');
  });

  it('throws a DomainError if Supabase insertion fails', async () => {
    const validData: RegisterPatientDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      dateOfBirth: '1990-01-01',
    };
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database constraint failed' } }),
    };

    const commands = new PatientProfileCommands(mockSupabase as any);
    await expect(commands.createPatient('user_123', validData))
      .rejects.toThrow(DomainError);
  });
});
