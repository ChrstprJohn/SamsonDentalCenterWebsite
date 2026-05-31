import { DeactivateUserDto } from '../../dtos';
import { UserManagementCommands } from '../../repositories';

export const deactivateUserUseCase = (
  deactivateUser: (userId: string, reason?: string) => Promise<boolean>
) => {
  return async (data: DeactivateUserDto): Promise<boolean> => {
    return deactivateUser(data.userId, data.reason);
  };
};

// Deprecated class for backwards compatibility
export class DeactivateUserUseCase {
  constructor(private readonly commands: UserManagementCommands) {}
  async execute(data: DeactivateUserDto): Promise<boolean> {
    return deactivateUserUseCase((uid, r) => this.commands.deactivateUser(uid, r))(data);
  }
}