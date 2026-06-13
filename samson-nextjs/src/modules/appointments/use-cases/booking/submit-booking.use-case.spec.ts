import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitBookingUseCase } from './submit-booking.use-case';
import { SubmitBookingDto } from '../../dtos/booking/submit-booking.dto';
import { ValidationError } from '@/shared/errors';

describe('submitBookingUseCase', () => {
  let mockExecuteBookingTransaction: any;
  let mockGetAvailableTimeSlots: any;

  const mockDto: SubmitBookingDto = {
    idempotencyKey: '00000000-0000-0000-0000-000000000000',
    serviceId: '1111f111-1111-1111-1111-111111111111',
    doctorId: '22222222-2222-2222-2222-222222222222',
    isPreferredDoctor: true,
    date: '2024-12-25',
    startTime: '2024-12-25T10:00:00.000Z',
    endTime: '2024-12-25T10:30:00.000Z',
    userNote: 'Dental checkup',
    patientType: 'SELF',
  };

  beforeEach(() => {
    mockExecuteBookingTransaction = vi.fn();
    mockGetAvailableTimeSlots = vi.fn();
  });

  it('should successfully book an appointment if the slot is completely available', async () => {
    // Mock the slot as available
    mockGetAvailableTimeSlots.mockResolvedValueOnce({
      date: '2024-12-25',
      serviceId: mockDto.serviceId,
      availableSlots: [
        {
          startTime: mockDto.startTime,
          endTime: mockDto.endTime,
          doctorId: mockDto.doctorId,
          doctorName: 'Dr. John Doe',
        },
      ],
    });

    const mockCreatedAppt = { appointmentId: 'appt-123' };
    mockExecuteBookingTransaction.mockResolvedValueOnce(mockCreatedAppt);

    const useCase = submitBookingUseCase({
      executeBookingTransaction: mockExecuteBookingTransaction,
      getAvailableTimeSlots: mockGetAvailableTimeSlots,
    });

    const result = await useCase('user-123', mockDto);

    expect(result).toEqual(mockCreatedAppt);
    expect(mockExecuteBookingTransaction).toHaveBeenCalledWith('user-123', mockDto);
  });

  it('should throw ValidationError if the requested slot is not in the list of available slots', async () => {
    // Mock availability returning no slots (slot is taken)
    mockGetAvailableTimeSlots.mockResolvedValueOnce({
      date: '2024-12-25',
      serviceId: mockDto.serviceId,
      availableSlots: [],
    });

    const useCase = submitBookingUseCase({
      executeBookingTransaction: mockExecuteBookingTransaction,
      getAvailableTimeSlots: mockGetAvailableTimeSlots,
    });

    await expect(useCase('user-123', mockDto)).rejects.toThrow(
      ValidationError
    );

    expect(mockExecuteBookingTransaction).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if a database unique constraint violation occurs', async () => {
    // Mock availability returning the slot as available (simulating race condition before DB insert)
    mockGetAvailableTimeSlots.mockResolvedValueOnce({
      date: '2024-12-25',
      serviceId: mockDto.serviceId,
      availableSlots: [
        {
          startTime: mockDto.startTime,
          endTime: mockDto.endTime,
          doctorId: mockDto.doctorId,
          doctorName: 'Dr. John Doe',
        },
      ],
    });

    // Mock DB unique constraint violation
    const dbError = new Error('duplicate key value violates unique constraint') as any;
    dbError.code = '23P01';
    mockExecuteBookingTransaction.mockRejectedValueOnce(dbError);

    const useCase = submitBookingUseCase({
      executeBookingTransaction: mockExecuteBookingTransaction,
      getAvailableTimeSlots: mockGetAvailableTimeSlots,
    });

    await expect(useCase('user-123', mockDto)).rejects.toThrow(
      'This slot was just booked by someone else!'
    );
  });
});
