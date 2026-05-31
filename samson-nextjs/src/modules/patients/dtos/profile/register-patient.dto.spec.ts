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
      dateOfBirth: '01-01-1990', // Wrong format
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    
    const result = registerPatientSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});