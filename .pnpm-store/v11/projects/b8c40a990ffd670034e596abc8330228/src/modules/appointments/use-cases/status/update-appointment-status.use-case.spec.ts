import { describe, it, expect, vi } from 'vitest';
import { updateAppointmentStatusUseCase } from './update-appointment-status.use-case';

const BASE_APPOINTMENT = {
  id: 'appt-uuid-001',
  patientId: 'patient-uuid-001',
  serviceId: 'service-uuid-001',
  doctorId: 'doctor-uuid-001',
  status: 'APPROVED' as const,
  date: '2026-06-01',
  startTime: '2026-06-01T10:00:00Z',
  endTime: '2026-06-01T10:30:00Z',
  rescheduleCount: 0,
  source: 'SELF_BOOKED',
  doctorAssignmentSource: 'SYSTEM',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
  proposedDate: null,
  proposedStartTime: null,
  proposedEndTime: null,
  proposedDoctorId: null,
} as any;

const RESCHEDULE_META = {
  date: '2026-07-01',
  startTime: '2026-07-01T09:00:00Z',
  endTime: '2026-07-01T09:30:00Z',
  doctorId: 'doctor-uuid-002',
};

const makeUseCase = (overrides: Record<string, unknown> = {}) => {
  const mockGetById = vi.fn().mockResolvedValue({ ...BASE_APPOINTMENT, ...overrides });
  const mockTransaction = vi.fn().mockResolvedValue({ ...BASE_APPOINTMENT, status: 'APPROVED' });
  const useCase = updateAppointmentStatusUseCase({
    getAppointmentById: mockGetById,
    updateAppointmentStatusTransaction: mockTransaction,
  });
  return { useCase, mockGetById, mockTransaction };
};

describe('updateAppointmentStatusUseCase', () => {
  it('happy path: calls transaction with correct args for simple APPROVED update', async () => {
    const { useCase, mockTransaction } = makeUseCase();

    await useCase('appt-uuid-001', 'actor-id', 'STAFF', 'APPROVED', 'Approved by staff');

    expect(mockTransaction).toHaveBeenCalledOnce();
    expect(mockTransaction).toHaveBeenCalledWith(
      'appt-uuid-001', 'actor-id', 'STAFF', 'APPROVED', 'Approved by staff',
      undefined, false, undefined
    );
  });

  it('direct reschedule: passes metadata and nextRescheduleCount=1', async () => {
    const { useCase, mockTransaction } = makeUseCase();

    await useCase('appt-uuid-001', 'actor-id', 'STAFF', 'APPROVED', 'Rescheduling', RESCHEDULE_META);

    expect(mockTransaction).toHaveBeenCalledWith(
      'appt-uuid-001', 'actor-id', 'STAFF', 'APPROVED', 'Rescheduling',
      RESCHEDULE_META, false, 1
    );
  });

  it('throws INVALID_STATUS_TRANSITION for terminal statuses', async () => {
    const terminals = ['CANCELLED', 'REJECTED', 'COMPLETED', 'NO_SHOW'] as const;

    for (const status of terminals) {
      const { useCase, mockTransaction } = makeUseCase({ status });
      await expect(
        useCase('appt-uuid-001', null, 'STAFF', 'APPROVED', 'reason')
      ).rejects.toThrow(`Cannot transition appointment from terminal status: ${status}`);
      expect(mockTransaction).not.toHaveBeenCalled();
    }
  });

  it('throws RESCHEDULE_LIMIT_EXCEEDED when rescheduleCount >= 1 and rescheduling', async () => {
    const { useCase, mockTransaction } = makeUseCase({ rescheduleCount: 1 });

    await expect(
      useCase('appt-uuid-001', null, 'STAFF', 'APPROVED', 'reason', RESCHEDULE_META)
    ).rejects.toThrow('Maximum reschedule limit of 1 has been reached.');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('Hold-and-Swap APPROVED: swaps proposed→actual and sets clearProposedMetadata=true', async () => {
    const proposed = {
      proposedDate: '2026-07-10',
      proposedStartTime: '2026-07-10T09:00:00Z',
      proposedEndTime: '2026-07-10T09:30:00Z',
      proposedDoctorId: 'doctor-uuid-002',
    };
    const { useCase, mockTransaction } = makeUseCase({ status: 'RESCHEDULE_REQUESTED', ...proposed });

    await useCase('appt-uuid-001', 'actor-id', 'STAFF', 'APPROVED', 'Approved');

    expect(mockTransaction).toHaveBeenCalledWith(
      'appt-uuid-001', 'actor-id', 'STAFF', 'APPROVED', 'Approved',
      {
        date: '2026-07-10',
        startTime: '2026-07-10T09:00:00Z',
        endTime: '2026-07-10T09:30:00Z',
        doctorId: 'doctor-uuid-002',
      },
      true,  // clearProposedMetadata
      undefined
    );
  });

  it('Hold-and-Swap REJECTED: reverts to APPROVED status and clears proposed', async () => {
    const { useCase, mockTransaction } = makeUseCase({ status: 'RESCHEDULE_REQUESTED' });

    await useCase('appt-uuid-001', 'actor-id', 'STAFF', 'REJECTED', 'Denied');

    expect(mockTransaction).toHaveBeenCalledWith(
      'appt-uuid-001', 'actor-id', 'STAFF',
      'APPROVED',  // finalStatus reverted
      'Denied',
      undefined,
      true,        // clearProposedMetadata
      undefined
    );
  });

  it('Hold-and-Swap REJECTED: uses default reason when none provided', async () => {
    const { useCase, mockTransaction } = makeUseCase({ status: 'RESCHEDULE_REQUESTED' });

    await useCase('appt-uuid-001', 'actor-id', 'STAFF', 'REJECTED');

    const callArgs = mockTransaction.mock.calls[0];
    expect(callArgs[4]).toContain('Reschedule request was denied');
  });

  it('cancel: calls transaction with CANCELLED status', async () => {
    const { useCase, mockTransaction } = makeUseCase();

    await useCase('appt-uuid-001', 'actor-id', 'STAFF', 'CANCELLED', 'Patient request');

    expect(mockTransaction).toHaveBeenCalledWith(
      'appt-uuid-001', 'actor-id', 'STAFF', 'CANCELLED', 'Patient request',
      undefined, false, undefined
    );
  });

  it('does not call transaction when getAppointmentById throws', async () => {
    const mockGetById = vi.fn().mockRejectedValue(new Error('Not found'));
    const mockTransaction = vi.fn();
    const useCase = updateAppointmentStatusUseCase({
      getAppointmentById: mockGetById,
      updateAppointmentStatusTransaction: mockTransaction,
    });

    await expect(
      useCase('appt-uuid-001', null, 'STAFF', 'APPROVED', 'reason')
    ).rejects.toThrow('Not found');

    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
