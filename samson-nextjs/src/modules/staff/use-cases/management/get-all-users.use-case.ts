import { GetAllUsersDto, UserProfileResponseDto } from '../../dtos/exports';


export const getAllUsersUseCase = (
  getAllUsers: (params?: GetAllUsersDto) => Promise<UserProfileResponseDto[]>
) => {
  return async (params?: GetAllUsersDto): Promise<UserProfileResponseDto[]> => {
    return getAllUsers(params);
  };
};
