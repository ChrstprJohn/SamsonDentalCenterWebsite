import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerPatientAction } from './register-patient.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { RegisterPatientUseCase } from '../../use-cases';

// 1. Mocks
vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
const { mockExecute } = vi.hoisted(() => {
  return { mockExecute: vi.fn() };
});

vi.mock('../../use-cases/profile/register-patient.use-case', () => {
  return {
    registerPatientUseCase: () => mockExecute,
    RegisterPatientUseCase: class {
      execute = mockExecute;
    },
  };
});

describe('registerPatientAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
        expect(mockExecute).toHaveBeenCalledWith(
            'user_123',
            expect.objectContaining({ firstName: 'John' })
        );
    });

    it('returns structured error if Zod validation fails', async () => {
        // Arrange: Pass an empty object to trigger Zod error
        const invalidPayload = {};

        // Act
        const result = await registerPatientAction(invalidPayload as any);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain('Validation failed');
        }
        // Ensure the system didn't waste resources on Auth or DB if validation failed
        expect(getAuthenticatedUser).not.toHaveBeenCalled();
        expect(mockExecute).not.toHaveBeenCalled();
    });
});
