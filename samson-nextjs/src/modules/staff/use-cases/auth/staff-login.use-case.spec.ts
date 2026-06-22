import { describe, it, expect, vi } from 'vitest';
import { staffLoginUseCase } from './staff-login.use-case';

describe('staffLoginUseCase', () => {
  it('should allow staff roles (ADMIN, SECRETARY, DOCTOR)', async () => {
    const mockLoginCmd = vi.fn().mockResolvedValue({
      user: {
        id: 'staff_1',
        user_metadata: { role: 'ADMIN' },
      },
    });

    const useCase = staffLoginUseCase(mockLoginCmd);
    const result = await useCase({ email: 'admin@samson.com', password: 'password123' });

    expect(result.user.user_metadata.role).toBe('ADMIN');
  });

  it('should block patient role', async () => {
    const mockLoginCmd = vi.fn().mockResolvedValue({
      user: {
        id: 'patient_1',
        user_metadata: { role: 'PATIENT' },
      },
    });

    const useCase = staffLoginUseCase(mockLoginCmd);
    await expect(
      useCase({ email: 'patient@samson.com', password: 'password123' })
    ).rejects.toThrow('Access denied: patients cannot log in to the staff portal');
  });
});
