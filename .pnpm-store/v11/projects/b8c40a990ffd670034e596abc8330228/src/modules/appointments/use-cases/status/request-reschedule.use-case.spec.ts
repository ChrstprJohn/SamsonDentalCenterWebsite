import { describe, it, expect, vi } from 'vitest';
import { requestRescheduleUseCase } from './request-reschedule.use-case';

const BASE_APPOINTMENT = {
  id: 'appt-uuid-001',
  patientId: 'patient-uuid-001',
  serviceId: 'service-uuid-001',
  doctorId: 'doctor-uuid-001',
  status: 'PENDING' as const,
  date: '2026-06-01',
  startTime: '2026-06-01T10:00:00Z',
  endTime: '2026-06-01T10:30:00Z',
  rescheduleCount: 0,
  source: 'PATIENT',
  doctorAssignmentSource: 'SYSTEM',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
} as any;

const PROPOSED = {
  date: '2026-07-01',
  startTime: '2026-07-01T09:00:00Z',
  endTime: '2026-07-01T09:30:00Z',
  doctorId: 'doctor-uuid-001',
};

describe('requestRescheduleUseCase', () => {
  const makeUseCase = (overrides: Partial<typeof BASE_APPOINTMENT> = {}) => {
    const mockGetById = vi.fn().mockResolvedValue({ ...BASE_APPOINTMENT, ...overrides });
    const mockTransaction = vi.fn().mockResolvedValue({ ...BASE_APPOINTMENT, status: 'RESCHEDULE_REQUESTED' });
    const useCase = requestRescheduleUseCase({
      getAppointmentById: mockGetById,
      requestRescheduleTransaction: mockTransaction,
    });
    return { useCase, mockGetById, mockTransaction };
  };

  it('calls requestRescheduleTransaction with correct args on happy path', async () => {
    const { useCase, mockTransaction } = makeUseCase();

    const result = await useCase('appt-uuid-001', 'actor-uuid-001', 'PATIENT', 'Schedule conflict', PROPOSED);

    expect(result.status).toBe('RESCHEDULE_REQUESTED');
    expect(mockTransaction).toHaveBeenCalledOnce();
    expect(mockTransaction).toHaveBeenCalledWith(
      'appt-uuid-001',
      'actor-uuid-001',
      'PATIENT',
      'Schedule conflict',
      PROPOSED
    );
  });

  it('throws INVALID_STATUS_TRANSITION for terminal status appointments', async () => {
    const terminalStatuses = ['CANCELLED', 'REJECTED', 'COMPLETED', 'NO_SHOW'] as const;

    for (const status of terminalStatuses) {
      const { useCase, mockTransaction } = makeUseCase({ status });

      await expect(
        useCase('appt-uuid-001', null, 'PATIENT', 'reason', PROPOSED)
      ).rejects.toThrow(`Cannot reschedule appointment from terminal status: ${status}`);

      expect(mockTransaction).not.toHaveBeenCalled();
    }
  });

  it('throws RESCHEDULE_LIMIT_EXCEEDED when rescheduleCount >= 1', async () => {
    const { useCase, mockTransaction } = makeUseCase({ rescheduleCount: 1 });

    await expect(
      useCase('appt-uuid-001', null, 'PATIENT', 'reason', PROPOSED)
    ).rejects.toThrow('Maximum reschedule limit of 1 has been reached.');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('does not call transaction when getAppointmentById throws', async () => {
    const mockGetById = vi.fn().mockRejectedValue(new Error('Not found'));
    const mockTransaction = vi.fn();
    const useCase = requestRescheduleUseCase({
      getAppointmentById: mockGetById,
      requestRescheduleTransaction: mockTransaction,
    });

    await expect(
      useCase('appt-uuid-001', null, 'PATIENT', 'reason', PROPOSED)
    ).rejects.toThrow('Not found');

    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
