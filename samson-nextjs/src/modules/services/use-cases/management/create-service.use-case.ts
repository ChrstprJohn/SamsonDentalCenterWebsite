import { CreateServiceDto } from "../../dtos/management/create-service.dto";
import { ServiceResponseDto } from "../../dtos/management/service-response.dto";

export const createServiceUseCase = (
  createService: (data: CreateServiceDto) => Promise<ServiceResponseDto>
) => {
  return async (data: CreateServiceDto): Promise<ServiceResponseDto> => {
    return await createService(data);
  };
};
