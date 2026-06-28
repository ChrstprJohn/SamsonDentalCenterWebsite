import { describe, it, expect, vi } from 'vitest';
import { assignDoctorServicesUseCase } from './assign-doctor-services.use-case';

describe('AssignDoctorServicesUseCase (Functional)', () => {
  it('should successfully execute and call repository function', async () => {
    const mockAssignDoctorServices = vi.fn().mockResolvedValue(true);

    const execute = assignDoctorServicesUseCase(mockAssignDoctorServices);
    const data = {
      doctorId: 'doc-123',
      serviceIds: ['svc-1', 'svc-2'],
    };

    const result = await execute(data);

    expect(result).toBe(true);
    expect(mockAssignDoctorServices).toHaveBeenCalledWith('doc-123', ['svc-1', 'svc-2']);
  });
});

