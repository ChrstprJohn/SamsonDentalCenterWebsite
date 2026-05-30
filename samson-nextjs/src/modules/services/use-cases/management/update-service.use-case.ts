import { ServiceCommandsRepository } from "../../repositories/management/service.commands";
import { UpdateServiceDto } from "../../dtos/management/update-service.dto";
import { ServiceResponseDto } from "../../dtos/management/service-response.dto";

export class UpdateServiceUseCase {
  constructor(private readonly serviceCommands: ServiceCommandsRepository) {}

  async execute(data: UpdateServiceDto): Promise<ServiceResponseDto> {
    return await this.serviceCommands.updateService(data);
  }
}
