import { DeactivateUserDto } from '../../dtos/exports';


export const deactivateUserUseCase = (
  deactivateUser: (userId: string, reason?: string) => Promise<boolean>
) => {
  return async (data: DeactivateUserDto): Promise<boolean> => {
    return deactivateUser(data.userId, data.reason);
  };
};
