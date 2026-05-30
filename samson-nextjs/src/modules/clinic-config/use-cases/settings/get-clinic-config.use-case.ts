import { ClinicConfigQueriesRepository } from "../../repositories/settings/clinic-config.queries";
import { ClinicConfigResponseDto } from "../../dtos/settings/get-clinic-config.dto";

const DEFAULT_CONFIG: ClinicConfigResponseDto = {
  is_booking_open: true,
  maintenance_message: null,
  max_reschedules: 1,
  clinic_name: "Samson Dental",
  address: "123 Dental Way",
  phone: "555-0101",
  email: "contact@samsondental.com",
};

export class GetClinicConfigUseCase {
  constructor(private readonly queries: ClinicConfigQueriesRepository) {}

  async execute(): Promise<ClinicConfigResponseDto> {
    const config = await this.queries.getConfig();
    return config || DEFAULT_CONFIG;
  }
}
