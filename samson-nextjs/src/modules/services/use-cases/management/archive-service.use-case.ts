import { ServiceResponseDto } from '../../dtos/management/service-response.dto';

export const archiveServiceUseCase = (
  archiveService: (id: string, status?: string) => Promise<ServiceResponseDto>
) => {
  return async (id: string, status?: string): Promise<ServiceResponseDto> => {
    return await archiveService(id, status);
  };
};
