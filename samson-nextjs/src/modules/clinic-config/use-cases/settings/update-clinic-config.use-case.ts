import { UpdateClinicConfigDto } from "../../dtos/settings/update-clinic-config.dto";
import { ClinicConfigResponseDto } from "../../dtos/settings/get-clinic-config.dto";

export const updateClinicConfigUseCase = (
  updateClinicConfig: (data: UpdateClinicConfigDto) => Promise<ClinicConfigResponseDto>
) => {
  return async (data: UpdateClinicConfigDto): Promise<ClinicConfigResponseDto> => {
    return await updateClinicConfig(data);
  };
};
