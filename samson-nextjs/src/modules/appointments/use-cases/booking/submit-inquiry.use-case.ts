import { SubmitInquiryDto, InquiryResponseDto } from '../../dtos/booking/submit-inquiry.dto';

export const submitInquiryUseCase = (deps: {
  createInquiry: (data: SubmitInquiryDto) => Promise<InquiryResponseDto>;
}) => {
  return async (data: SubmitInquiryDto): Promise<InquiryResponseDto> => {
    // Pure business validation logic can be added here if needed in the future
    return await deps.createInquiry(data);
  };
};
