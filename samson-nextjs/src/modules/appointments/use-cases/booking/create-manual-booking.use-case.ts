import { CreateManualBookingDto } from '../../dtos/booking/create-manual-booking.dto';
import { ValidationError } from '@/shared/errors';
import { GetAvailableTimeSlotsResponseDto } from '../../dtos/exports';

export const createManualBookingUseCase = (deps: {
  createManualBooking: (data: CreateManualBookingDto & { secretaryUserId: string }) => Promise<{ appointmentId: string }>;
  getAvailableTimeSlots: (dto: { serviceId: string; doctorId?: string; date: string }) => Promise<GetAvailableTimeSlotsResponseDto>;
}) => {
  return async (data: CreateManualBookingDto, secretaryUserId: string): Promise<{ appointmentId: string }> => {
    const { serviceId, doctorId, date, startTime, endTime } = data;

    // 1. Live availability check before committing
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
      return await deps.createManualBooking({ ...data, secretaryUserId });
    } catch (error: unknown) {
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
