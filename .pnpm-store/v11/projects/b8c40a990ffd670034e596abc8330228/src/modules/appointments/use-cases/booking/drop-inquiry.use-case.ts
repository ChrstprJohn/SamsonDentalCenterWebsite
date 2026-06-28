import { DropInquiryDto } from '../../dtos/booking/drop-inquiry.dto';
import { InquiryResponseDto } from '../../dtos/booking/submit-inquiry.dto';

export const dropInquiryUseCase = (deps: {
  dropInquiry: (inquiryId: string, secretaryNotes?: string) => Promise<InquiryResponseDto>;
}) => {
  return async (data: DropInquiryDto): Promise<InquiryResponseDto> => {
    return await deps.dropInquiry(data.inquiryId, data.secretaryNotes);
  };
};
