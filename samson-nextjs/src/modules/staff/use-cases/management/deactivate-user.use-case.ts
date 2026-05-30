import { DeactivateUserDto } from '../../dtos';
import { UserManagementCommands } from '../../repositories';

export class DeactivateUserUseCase {
  constructor(private readonly commands: UserManagementCommands) {}

  async execute(data: DeactivateUserDto): Promise<boolean> {
    return this.commands.deactivateUser(data.userId, data.reason);
  }
}