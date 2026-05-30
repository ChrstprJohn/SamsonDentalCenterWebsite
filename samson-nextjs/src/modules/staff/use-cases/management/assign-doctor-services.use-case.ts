import { AssignDoctorServicesDto } from '../../dtos';
import { DoctorServicesCommands } from '../../repositories';

export class AssignDoctorServicesUseCase {
  constructor(private readonly commands: DoctorServicesCommands) {}

  async execute(data: AssignDoctorServicesDto): Promise<boolean> {
    return this.commands.assignDoctorServices(data.doctorId, data.serviceIds);
  }
}
