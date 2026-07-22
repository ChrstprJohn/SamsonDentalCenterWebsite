import { UpdateInquiryDto } from '../../dtos/booking/update-inquiry.dto';

export const updateInquiryUseCase = (deps: {
  executeUpdate: (data: UpdateInquiryDto) => Promise<{ success: true }>;
}) => {
  return async (data: UpdateInquiryDto) => {
    return await deps.executeUpdate(data);
  };
};
