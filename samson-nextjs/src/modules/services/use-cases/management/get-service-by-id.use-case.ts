import { ServiceQueriesRepository } from "../../repositories/management/service.queries";
import { ServiceResponseDto } from "../../dtos/management/service-response.dto";

export class GetServiceByIdUseCase {
  constructor(private readonly serviceQueries: ServiceQueriesRepository) {}

  async execute(id: string): Promise<ServiceResponseDto | null> {
    return await this.serviceQueries.getServiceById(id);
  }
}
