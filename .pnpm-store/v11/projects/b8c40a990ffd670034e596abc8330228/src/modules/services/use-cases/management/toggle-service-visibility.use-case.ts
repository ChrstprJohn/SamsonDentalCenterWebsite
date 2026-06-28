import { ServiceResponseDto } from '../../dtos/management/service-response.dto';

export const toggleServiceVisibilityUseCase = (
  toggleVisibility: (id: string, currentIsActive: boolean) => Promise<ServiceResponseDto>
) => {
  return async (id: string, currentIsActive: boolean): Promise<ServiceResponseDto> => {
    return await toggleVisibility(id, currentIsActive);
  };
};
