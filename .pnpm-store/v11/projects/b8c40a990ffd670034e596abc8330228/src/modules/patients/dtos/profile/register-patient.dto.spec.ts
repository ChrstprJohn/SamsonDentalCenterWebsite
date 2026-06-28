import { describe, it, expect } from 'vitest';
import { registerPatientSchema } from './register-patient.dto';

describe('RegisterPatientDto', () => {
  it('validates correct data', () => {
    const validData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      dateOfBirth: '1990-01-01',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    
    // We expect the output to be trimmed/formatted if applicable
    const result = registerPatientSchema.parse(validData);
    expect(result).toEqual(validData);
  });

  it('fails on invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      dateOfBirth: '1990-01-01',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    
    const result = registerPatientSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('fails on invalid date of birth format', () => {
    const invalidData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      dateOfBirth: 'not-a-date', // Truly wrong format
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    
    const result = registerPatientSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('normalizes different date of birth formats', () => {
    const baseData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };

    // 1. Test MM/DD/YYYY format
    const result1 = registerPatientSchema.parse({
      ...baseData,
      dateOfBirth: '05/07/2026',
    });
    expect(result1.dateOfBirth).toBe('2026-05-07');

    // 2. Test MM/DD/YY format (1900s)
    const result2 = registerPatientSchema.parse({
      ...baseData,
      dateOfBirth: '05/07/90',
    });
    expect(result2.dateOfBirth).toBe('1990-05-07');

    // 3. Test MM/DD/YY format (2000s)
    const result3 = registerPatientSchema.parse({
      ...baseData,
      dateOfBirth: '05/07/26',
    });
    expect(result3.dateOfBirth).toBe('2026-05-07');

    // 4. Test MM-DD-YYYY format with dashes
    const result4 = registerPatientSchema.parse({
      ...baseData,
      dateOfBirth: '05-07-2026',
    });
    expect(result4.dateOfBirth).toBe('2026-05-07');
  });
});