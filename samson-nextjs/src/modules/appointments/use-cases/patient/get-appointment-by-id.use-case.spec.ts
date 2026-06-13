import { describe, it, expect, vi } from 'vitest';
import { getAppointmentByIdUseCase } from './get-appointment-by-id.use-case';
import { AppointmentDto } from '../../dtos/exports';

describe('getAppointmentByIdUseCase', () => {
  it('calls the getAppointmentById repository query with correct parameter and returns result', async () => {
    const mockAppt = { id: 'uuid-123', status: 'APPROVED' } as unknown as AppointmentDto;
    const mockGetAppointmentById = vi.fn().mockResolvedValue(mockAppt);

    const useCase = getAppointmentByIdUseCase(mockGetAppointmentById);
    const result = await useCase('uuid-123');

    expect(result).toBe(mockAppt);
    expect(mockGetAppointmentById).toHaveBeenCalledWith('uuid-123');
  });
});
