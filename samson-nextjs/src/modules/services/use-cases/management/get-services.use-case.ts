import { ServiceResponseDto } from '../../dtos/management/service-response.dto';

export const getServicesUseCase = (
  getServices: (includeInactive?: boolean | 'ALL' | 'BOOKABLE') => Promise<ServiceResponseDto[]>
) => {
  return async (includeInactive: boolean | 'ALL' | 'BOOKABLE' = false): Promise<ServiceResponseDto[]> => {
    return await getServices(includeInactive);
  };
};
