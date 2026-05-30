import { SupabaseClient } from "@supabase/supabase-js";
import { ClinicConfigResponseDto, mapClinicConfigRecord } from "../../dtos/settings/get-clinic-config.dto";

export class ClinicConfigQueriesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getConfig(): Promise<ClinicConfigResponseDto | null> {
    const { data, error } = await this.supabase
      .from("clinic_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch clinic config: ${error.message}`);
    return data ? mapClinicConfigRecord(data) : null;
  }
}
