import { ServiceQueriesRepository } from "../../repositories/management/service.queries";
import { ServiceResponseDto } from "../../dtos/management/service-response.dto";

export class GetServicesUseCase {
  constructor(private readonly serviceQueries: ServiceQueriesRepository) {}

  async execute(includeInactive = false): Promise<ServiceResponseDto[]> {
    return await this.serviceQueries.getServices(includeInactive);
  }
}
