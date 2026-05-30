import { ServiceCommandsRepository } from "../../repositories/management/service.commands";
import { CreateServiceDto } from "../../dtos/management/create-service.dto";
import { ServiceResponseDto } from "../../dtos/management/service-response.dto";

export class CreateServiceUseCase {
  constructor(private readonly serviceCommands: ServiceCommandsRepository) {}

  async execute(data: CreateServiceDto): Promise<ServiceResponseDto> {
    return await this.serviceCommands.createService(data);
  }
}
