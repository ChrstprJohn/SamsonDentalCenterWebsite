import { GetAllUsersDto, UserProfileResponseDto } from '../../dtos';
import { UserManagementQueries } from '../../repositories';

export const getAllUsersUseCase = (
  getAllUsers: (params?: GetAllUsersDto) => Promise<UserProfileResponseDto[]>
) => {
  return async (params?: GetAllUsersDto): Promise<UserProfileResponseDto[]> => {
    return getAllUsers(params);
  };
};

// Deprecated class for backwards compatibility
export class GetAllUsersUseCase {
  constructor(private readonly queries: UserManagementQueries) {}
  async execute(params?: GetAllUsersDto): Promise<UserProfileResponseDto[]> {
    return getAllUsersUseCase((p) => this.queries.getAllUsers(p))(params);
  }
}