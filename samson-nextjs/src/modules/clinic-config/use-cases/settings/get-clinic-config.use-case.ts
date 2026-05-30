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
  operating_hours: {
    monday: { is_open: true, open_time: "09:00", close_time: "17:00" },
    tuesday: { is_open: true, open_time: "09:00", close_time: "17:00" },
    wednesday: { is_open: true, open_time: "09:00", close_time: "17:00" },
    thursday: { is_open: true, open_time: "09:00", close_time: "17:00" },
    friday: { is_open: true, open_time: "09:00", close_time: "17:00" },
    saturday: { is_open: false, open_time: null, close_time: null },
    sunday: { is_open: false, open_time: null, close_time: null },
  },
  allow_same_day_booking: true,
  calendar_render_days: 30,
  social_links: [],
};

export class GetClinicConfigUseCase {
  constructor(private readonly queries: ClinicConfigQueriesRepository) {}

  async execute(): Promise<ClinicConfigResponseDto> {
    const config = await this.queries.getConfig();
    return config || DEFAULT_CONFIG;
  }
}
