import { UserProfileResponseDto } from '../../dtos';
import { GetActiveDoctorsQueries } from '../../repositories';

export const getDoctorsUseCase = (
  getActiveDoctors: (serviceId?: string) => Promise<UserProfileResponseDto[]>
) => {
  return async (serviceId?: string): Promise<UserProfileResponseDto[]> => {
    return getActiveDoctors(serviceId);
  };
};

// Deprecated class for backwards compatibility
export class GetDoctorsUseCase {
  constructor(private readonly queries: GetActiveDoctorsQueries) {}
  async execute(serviceId?: string): Promise<UserProfileResponseDto[]> {
    return getDoctorsUseCase((sId) => this.queries.getActiveDoctors(sId))(serviceId);
  }
}
