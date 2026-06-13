import { AssignDoctorServicesDto } from '../../dtos/exports';


export const assignDoctorServicesUseCase = (
  assignDoctorServices: (doctorId: string, serviceIds: string[]) => Promise<boolean>
) => {
  return async (data: AssignDoctorServicesDto): Promise<boolean> => {
    return assignDoctorServices(data.doctorId, data.serviceIds);
  };
};
