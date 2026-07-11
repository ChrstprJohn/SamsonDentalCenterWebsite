import { ConvertInquiryDto } from '../../dtos/booking/convert-inquiry.dto';
import { ValidationError } from '@/shared/errors';
import { GetAvailableTimeSlotsResponseDto } from '../../dtos/exports';

export const convertInquiryUseCase = (deps: {
  executeConversionTransaction: (data: ConvertInquiryDto, secretaryUserId: string) => Promise<{ appointmentId: string }>;
}) => {
  return async (data: ConvertInquiryDto, secretaryUserId: string) => {
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
