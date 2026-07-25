import { describe, it, expect, vi } from 'vitest';
import { createManualBookingUseCase } from './create-manual-booking.use-case';

describe('createManualBookingUseCase', () => {
  it('should book successfully bypassing slot validation checks', async () => {
    const mockCreateManualBooking = vi.fn().mockResolvedValue({ appointmentId: 'app-123' });

    const useCase = createManualBookingUseCase({
      createManualBooking: mockCreateManualBooking,
    });

    const payload = {
      patientId: 'patient-123',
      serviceId: 'srv-123',
      doctorId: 'doc-123',
      doctorAssignmentSource: 'SYSTEM' as const,
      confirmationChannel: 'EMAIL' as const,
      date: '2026-06-25',
      startTime: '2026-06-25T10:00:00Z',
      endTime: '2026-06-25T10:30:00Z',
    };

    const result = await useCase(payload, 'secretary-123');
    expect(mockCreateManualBooking).toHaveBeenCalledWith({ ...payload, secretaryUserId: 'secretary-123' });
    expect(result.appointmentId).toBe('app-123');
  });

  it('should pass dependent fields through to createManualBooking unchanged', async () => {
    const mockCreateManualBooking = vi.fn().mockResolvedValue({ appointmentId: 'app-456' });

    const useCase = createManualBookingUseCase({
      createManualBooking: mockCreateManualBooking,
    });

    const payload = {
      patientId: 'patient-123',
      serviceId: 'srv-123',
      doctorId: 'doc-123',
      doctorAssignmentSource: 'SYSTEM' as const,
      confirmationChannel: 'EMAIL' as const,
      date: '2026-06-25',
      startTime: '2026-06-25T10:00:00Z',
      endTime: '2026-06-25T10:30:00Z',
      newDependentFirstName: 'Maria',
      newDependentLastName: 'Santos',
      newDependentDateOfBirth: '2015-03-10',
      newDependentRelationship: 'CHILD' as const,
    };

    await useCase(payload, 'secretary-123');
    expect(mockCreateManualBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        newDependentFirstName: 'Maria',
        newDependentLastName: 'Santos',
        newDependentDateOfBirth: '2015-03-10',
        newDependentRelationship: 'CHILD',
      })
    );
  });
});
