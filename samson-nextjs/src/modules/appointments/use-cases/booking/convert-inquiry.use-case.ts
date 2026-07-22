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
      const errObj = error as { code?: string; message?: string; cause?: any };
      const errStr = String(errObj?.message || error || '');
      const errCauseStr = String(errObj?.cause?.message || errObj?.cause || '');

      const isOverlappingError =
        errObj?.code === '23P01' ||
        errObj?.code === '23505' ||
        errStr.includes('no_overlapping_appointments') ||
        errStr.includes('23P01') ||
        errCauseStr.includes('no_overlapping_appointments') ||
        errCauseStr.includes('23P01');

      if (isOverlappingError) {
        throw new ValidationError('This slot is already booked for the selected dentist. Please choose another time or dentist.', 'SLOT_ALREADY_BOOKED');
      }

      throw error;
    }
  };
};
