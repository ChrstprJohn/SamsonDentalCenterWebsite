import { SupabaseClient } from "@supabase/supabase-js";
import { UpdateClinicConfigDto } from "../../dtos/settings/update-clinic-config.dto";
import { ClinicConfigResponseDto } from "../../dtos/settings/get-clinic-config.dto";

export class ClinicConfigCommandsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async updateConfig(data: UpdateClinicConfigDto): Promise<ClinicConfigResponseDto> {
    const { data: result, error } = await this.supabase
      .from("clinic_settings")
      .update(data)
      .eq("id", 1) // Always update the single row
      .select()
      .single();

    if (error) throw new Error(`Failed to update clinic config: ${error.message}`);
    return result as ClinicConfigResponseDto;
  }
}
