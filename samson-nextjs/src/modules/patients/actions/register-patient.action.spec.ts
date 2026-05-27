import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerPatientAction } from './register-patient.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { RegisterPatientUseCase } from '../use-cases/register-patient.use-case';

// 1. Mocks
vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../use-cases/register-patient.use-case');

describe('registerPatientAction', () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Inject the mock into the constructor using a standard function so 'new' works
    vi.mocked(RegisterPatientUseCase).mockImplementation(function() {
      return { execute: mockExecute } as any;
    });
  });

  it('successfully validates data, resolves auth, and executes the use-case', async () => {
    // Arrange
    const mockUser = { id: 'user_123' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser as any);
    vi.mocked(createClient).mockResolvedValue({} as any);
    
    mockExecute.mockResolvedValue({ id: 'patient_789', firstName: 'John' });

    const validPayload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
    };

    // Act
    const result = await registerPatientAction(validPayload as any);

    // Assert
    expect(result).toEqual({ success: true, data: { id: 'patient_789', firstName: 'John' } });
    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalledWith('user_123', expect.objectContaining({ firstName: 'John' }));
  });

  it('returns structured error if Zod validation fails', async () => {
    // Arrange: Pass an empty object to trigger Zod error
    const invalidPayload = {}; 

    // Act
    const result = await registerPatientAction(invalidPayload as any);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    // Ensure the system didn't waste resources on Auth or DB if validation failed
    expect(getAuthenticatedUser).not.toHaveBeenCalled(); 
    expect(mockExecute).not.toHaveBeenCalled();
  });
});