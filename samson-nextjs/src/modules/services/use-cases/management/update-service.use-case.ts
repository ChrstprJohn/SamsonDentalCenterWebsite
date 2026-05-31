import { UpdateServiceDto } from "../../dtos/management/update-service.dto";
import { ServiceResponseDto } from "../../dtos/management/service-response.dto";

export const updateServiceUseCase = (
  updateService: (data: UpdateServiceDto) => Promise<ServiceResponseDto>
) => {
  return async (data: UpdateServiceDto): Promise<ServiceResponseDto> => {
    return await updateService(data);
  };
};
