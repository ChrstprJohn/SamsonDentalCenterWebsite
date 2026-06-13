import { UserProfileResponseDto } from '../../dtos/exports';


export const getDoctorsUseCase = (
  getActiveDoctors: (serviceId?: string) => Promise<UserProfileResponseDto[]>
) => {
  return async (serviceId?: string): Promise<UserProfileResponseDto[]> => {
    return getActiveDoctors(serviceId);
  };
};
