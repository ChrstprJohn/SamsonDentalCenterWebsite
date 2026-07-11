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
    doctorAssignmentSource: 'USER',
    date: '2024-12-25',
    timePreference: 'MORNING',
    userNote: 'Dental checkup',
    patientType: 'SELF',
  };

  const mockDtoAnyDoctor: SubmitBookingDto = {
    idempotencyKey: '11111111-0000-0000-0000-000000000000',
    serviceId: '1111f111-1111-1111-1111-111111111111',
    doctorId: null,
    isPreferredDoctor: false,
    doctorAssignmentSource: 'SYSTEM',
    date: '2024-12-25',
    timePreference: 'AFTERNOON',
    patientType: 'SELF',
  };

  beforeEach(() => {
    mockExecuteBookingTransaction = vi.fn();
    mockGetAvailableTimeSlots = vi.fn();
  });

  it('should successfully delegate to executeBookingTransaction (specific doctor)', async () => {
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

  it('should delegate null doctorId (ANY doctor) payload without modification', async () => {
    const mockCreatedAppt = { appointmentId: 'appt-456' };
    mockExecuteBookingTransaction.mockResolvedValueOnce(mockCreatedAppt);

    const useCase = submitBookingUseCase({
      executeBookingTransaction: mockExecuteBookingTransaction,
      getAvailableTimeSlots: mockGetAvailableTimeSlots,
    });

    const result = await useCase('user-123', mockDtoAnyDoctor);

    expect(result).toEqual(mockCreatedAppt);
    // null doctorId flows through without rejection
    expect(mockExecuteBookingTransaction).toHaveBeenCalledWith('user-123', expect.objectContaining({
      doctorId: null,
      doctorAssignmentSource: 'SYSTEM',
    }));
  });

  it('should throw ValidationError if a database unique constraint violation occurs', async () => {
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
