import { ServiceResponseDto } from '../../dtos/management/service-response.dto';

export const archiveServiceUseCase = (
  archiveService: (id: string) => Promise<ServiceResponseDto>
) => {
  return async (id: string): Promise<ServiceResponseDto> => {
    return await archiveService(id);
  };
};
