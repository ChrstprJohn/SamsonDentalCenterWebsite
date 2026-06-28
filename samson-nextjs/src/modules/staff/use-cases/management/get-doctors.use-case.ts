import { UserProfileResponseDto } from '../../dtos/exports';


export const getDoctorsUseCase = (
  getActiveDoctors: (serviceId?: string, includeHidden?: boolean) => Promise<UserProfileResponseDto[]>
) => {
  return async (serviceId?: string, includeHidden = false): Promise<UserProfileResponseDto[]> => {
    return getActiveDoctors(serviceId, includeHidden);
  };
};
