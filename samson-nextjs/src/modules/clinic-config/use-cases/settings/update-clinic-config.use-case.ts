import { ClinicConfigCommandsRepository } from "../../repositories/settings/clinic-config.commands";
import { UpdateClinicConfigDto } from "../../dtos/settings/update-clinic-config.dto";
import { ClinicConfigResponseDto } from "../../dtos/settings/get-clinic-config.dto";

export class UpdateClinicConfigUseCase {
  constructor(private readonly commands: ClinicConfigCommandsRepository) {}

  async execute(data: UpdateClinicConfigDto): Promise<ClinicConfigResponseDto> {
    return await this.commands.updateConfig(data);
  }
}
