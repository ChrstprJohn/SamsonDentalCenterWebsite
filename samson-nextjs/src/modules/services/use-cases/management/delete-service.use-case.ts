import { ServiceCommandsRepository } from "../../repositories/management/service.commands";

export class DeleteServiceUseCase {
  constructor(private readonly serviceCommands: ServiceCommandsRepository) {}

  async execute(id: string): Promise<void> {
    await this.serviceCommands.deleteService(id);
  }
}
