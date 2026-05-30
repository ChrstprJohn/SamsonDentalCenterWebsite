import { describe, it, expect, vi } from 'vitest';
import { AssignDoctorServicesUseCase } from './assign-doctor-services.use-case';

describe('AssignDoctorServicesUseCase', () => {
  it('should successfully execute and call repository', async () => {
    const mockCommands = {
      assignDoctorServices: vi.fn().mockResolvedValue(true),
    } as any;

    const useCase = new AssignDoctorServicesUseCase(mockCommands);
    const data = {
      doctorId: 'doc-123',
      serviceIds: ['svc-1', 'svc-2'],
    };

    const result = await useCase.execute(data);

    expect(result).toBe(true);
    expect(mockCommands.assignDoctorServices).toHaveBeenCalledWith('doc-123', ['svc-1', 'svc-2']);
  });
});
