import { SubmitBookingDto, GetAvailableTimeSlotsResponseDto } from '../../dtos/exports';
import { ValidationError } from '@/shared/errors';

export const submitBookingUseCase = (deps: {
  executeBookingTransaction: (userId: string, data: SubmitBookingDto) => Promise<{ appointmentId: string }>;
  getAvailableTimeSlots: (dto: { serviceId: string; doctorId?: string; date: string }) => Promise<GetAvailableTimeSlotsResponseDto>;
}) => {
  return async (userId: string, dto: SubmitBookingDto) => {
    try {
      return await deps.executeBookingTransaction(userId, dto);
    } catch (error: unknown) {
      // Catch Postgres Exclusion Constraint violation (23P01) for overlapping appointments
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
