import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubmitBookingUseCase } from './submit-booking.use-case';
import { AppointmentBookingCommands } from '../repositories/appointment-booking.commands';
import { GetAvailabilityUseCase } from './get-availability.use-case';
import { SubmitBookingDto } from '../dtos/submit-booking.dto';
import { ValidationError } from '@/shared/errors';

describe('SubmitBookingUseCase', () => {
  let useCase: SubmitBookingUseCase;
  let mockBookingCommands: any;
  let mockAvailabilityUseCase: any;

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
    mockBookingCommands = {
      createAppointment: vi.fn(),
    };

    mockAvailabilityUseCase = {
      getAvailableTimeSlots: vi.fn(),
    };

    useCase = new SubmitBookingUseCase(
      mockBookingCommands as unknown as AppointmentBookingCommands,
      mockAvailabilityUseCase as unknown as GetAvailabilityUseCase
    );
  });

  it('should successfully book an appointment if the slot is completely available', async () => {
    // Mock the slot as available
    mockAvailabilityUseCase.getAvailableTimeSlots.mockResolvedValueOnce({
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

    const mockCreatedAppt = { id: 'appt-123', status: 'PENDING' };
    mockBookingCommands.createAppointment.mockResolvedValueOnce(mockCreatedAppt);

    const result = await useCase.execute('user-123', mockDto);

    expect(result).toEqual(mockCreatedAppt);
    expect(mockBookingCommands.createAppointment).toHaveBeenCalledWith('user-123', mockDto);
  });

  it('should throw ValidationError if the requested slot is not in the list of available slots', async () => {
    // Mock availability returning no slots (slot is taken)
    mockAvailabilityUseCase.getAvailableTimeSlots.mockResolvedValueOnce({
      date: '2024-12-25',
      serviceId: mockDto.serviceId,
      availableSlots: [],
    });

    await expect(useCase.execute('user-123', mockDto)).rejects.toThrow(
      ValidationError
    );

    expect(mockBookingCommands.createAppointment).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if a database unique constraint violation occurs', async () => {
    // Mock availability returning the slot as available (simulating race condition before DB insert)
    mockAvailabilityUseCase.getAvailableTimeSlots.mockResolvedValueOnce({
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
    const dbError = new Error('duplicate key value violates unique constraint');
    mockBookingCommands.createAppointment.mockRejectedValueOnce(dbError);

    await expect(useCase.execute('user-123', mockDto)).rejects.toThrow(
      'This slot is already booked!'
    );
  });
});
