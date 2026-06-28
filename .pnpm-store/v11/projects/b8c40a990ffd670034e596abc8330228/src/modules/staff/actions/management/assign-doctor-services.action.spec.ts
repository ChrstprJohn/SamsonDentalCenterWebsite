import { describe, it, expect, vi } from 'vitest';
import { assignDoctorServicesAction } from './assign-doctor-services.action';

vi.mock('@/shared/auth/auth.util', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ id: 'user1', role: 'ADMIN' }),
  authorizeRole: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../repositories/exports', () => ({
  assignDoctorServicesCommand: () => vi.fn().mockResolvedValue(true),
  DoctorServicesCommands: class {
    assignDoctorServices = vi.fn().mockResolvedValue(true);
  }
}));


describe('assignDoctorServicesAction', () => {
  it('should assign doctor services and return success', async () => {
    const result = await assignDoctorServicesAction({
      doctorId: '123e4567-e89b-12d3-a456-426614174000',
      serviceIds: ['123e4567-e89b-12d3-a456-426614174001'],
    });
    expect(result.success).toBe(true);
  });

  it('should return failure if DTO validation fails', async () => {
    const result = await assignDoctorServicesAction({
      doctorId: 'invalid-uuid',
      serviceIds: [],
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
