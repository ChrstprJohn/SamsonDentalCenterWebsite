import { ServiceResponseDto } from '../../dtos/management/service-response.dto';

export const getServicesUseCase = (
  getServices: (includeInactive?: boolean) => Promise<ServiceResponseDto[]>
) => {
  return async (includeInactive = false): Promise<ServiceResponseDto[]> => {
    return await getServices(includeInactive);
  };
};
