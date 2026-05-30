import { GetAllUsersDto, UserProfileResponseDto } from '../../dtos';
import { UserManagementQueries } from '../../repositories';

export class GetAllUsersUseCase {
  constructor(private readonly queries: UserManagementQueries) {}

  async execute(params?: GetAllUsersDto): Promise<UserProfileResponseDto[]> {
    return this.queries.getAllUsers(params);
  }
}