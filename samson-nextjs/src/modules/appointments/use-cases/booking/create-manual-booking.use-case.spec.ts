import { describe, it, expect, vi } from 'vitest';
import { createManualBookingUseCase } from './create-manual-booking.use-case';
import { ValidationError } from '@/shared/errors';

describe('createManualBookingUseCase', () => {
  it('should book successfully when slot is available', async () => {
    const mockGetAvailableTimeSlots = vi.fn().mockResolvedValue({
      availableSlots: [{ startTime: '2026-06-25T10:00:00Z', endTime: '2026-06-25T10:30:00Z' }],
    });
    const mockCreateManualBooking = vi.fn().mockResolvedValue({ appointmentId: 'app-123' });

    const useCase = createManualBookingUseCase({
      createManualBooking: mockCreateManualBooking,
      getAvailableTimeSlots: mockGetAvailableTimeSlots,
    });

    const payload = {
      patientId: 'patient-123',
      serviceId: 'srv-123',
      doctorId: 'doc-123',
      date: '2026-06-25',
      startTime: '2026-06-25T10:00:00Z',
      endTime: '2026-06-25T10:30:00Z',
    };

    const result = await useCase(payload, 'secretary-123');
    expect(mockGetAvailableTimeSlots).toHaveBeenCalledWith({ serviceId: 'srv-123', doctorId: 'doc-123', date: '2026-06-25' });
    expect(mockCreateManualBooking).toHaveBeenCalledWith({ ...payload, secretaryUserId: 'secretary-123' });
    expect(result.appointmentId).toBe('app-123');
  });

  it('should throw validation error when slot is unavailable', async () => {
    const mockGetAvailableTimeSlots = vi.fn().mockResolvedValue({ availableSlots: [] });
    const mockCreateManualBooking = vi.fn();

    const useCase = createManualBookingUseCase({
      createManualBooking: mockCreateManualBooking,
      getAvailableTimeSlots: mockGetAvailableTimeSlots,
    });

    const payload = {
      patientId: 'patient-123',
      serviceId: 'srv-123',
      doctorId: 'doc-123',
      date: '2026-06-25',
      startTime: '2026-06-25T10:00:00Z',
      endTime: '2026-06-25T10:30:00Z',
    };

    await expect(useCase(payload, 'secretary-123')).rejects.toThrow(ValidationError);
    expect(mockCreateManualBooking).not.toHaveBeenCalled();
  });
});
