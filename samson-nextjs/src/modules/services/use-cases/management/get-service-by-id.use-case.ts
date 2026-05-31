import { ServiceResponseDto } from "../../dtos/management/service-response.dto";

export const getServiceByIdUseCase = (
  getServiceById: (id: string) => Promise<ServiceResponseDto | null>
) => {
  return async (id: string): Promise<ServiceResponseDto | null> => {
    return await getServiceById(id);
  };
};
