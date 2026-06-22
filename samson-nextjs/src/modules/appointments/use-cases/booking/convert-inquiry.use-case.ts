import { ConvertInquiryDto } from '../../dtos/booking/convert-inquiry.dto';
import { ValidationError } from '@/shared/errors';
import { GetAvailableTimeSlotsResponseDto } from '../../dtos/exports';

export const convertInquiryUseCase = (deps: {
  executeConversionTransaction: (data: ConvertInquiryDto, secretaryUserId: string) => Promise<{ appointmentId: string }>;
  getAvailableTimeSlots: (dto: { serviceId: string; doctorId?: string; date: string }) => Promise<GetAvailableTimeSlotsResponseDto>;
}) => {
  return async (data: ConvertInquiryDto, secretaryUserId: string) => {
    const { serviceId, doctorId, date, startTime, endTime } = data;

    // 1. Live availability check before committing conversion
    const availability = await deps.getAvailableTimeSlots({
      serviceId,
      doctorId,
      date,
    });

    const isSlotAvailable = availability.availableSlots.some(
      (slot) => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!isSlotAvailable) {
      throw new ValidationError(
        'The requested appointment time slot is already taken or unavailable.',
        'SLOT_UNAVAILABLE'
      );
    }

    try {
      return await deps.executeConversionTransaction(data, secretaryUserId);
    } catch (error: unknown) {
      // Catch Postgres Exclusion Constraint violation for overlapping appointments
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        ((error as { code?: string }).code === '23P01' || (error as { code?: string }).code === '23505')
      ) {
        throw new ValidationError('This slot was just booked by someone else!', 'SLOT_ALREADY_BOOKED');
      }

      throw error;
    }
  };
};
