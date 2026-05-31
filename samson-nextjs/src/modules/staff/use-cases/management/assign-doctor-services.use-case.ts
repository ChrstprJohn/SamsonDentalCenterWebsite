import { AssignDoctorServicesDto } from '../../dtos';
import { DoctorServicesCommands } from '../../repositories';

export const assignDoctorServicesUseCase = (
  assignDoctorServices: (doctorId: string, serviceIds: string[]) => Promise<boolean>
) => {
  return async (data: AssignDoctorServicesDto): Promise<boolean> => {
    return assignDoctorServices(data.doctorId, data.serviceIds);
  };
};

// Deprecated class for backwards compatibility
export class AssignDoctorServicesUseCase {
  constructor(private readonly commands: DoctorServicesCommands) {}
  async execute(data: AssignDoctorServicesDto): Promise<boolean> {
    return assignDoctorServicesUseCase((did, sids) => this.commands.assignDoctorServices(did, sids))(data);
  }
}

