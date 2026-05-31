import { SupabaseClient } from "@supabase/supabase-js";
import { ClinicConfigResponseDto, clinicConfigResponseSchema } from "../../dtos/settings/get-clinic-config.dto";

export const getClinicConfigQuery = (supabase: SupabaseClient) => {
  return async (): Promise<ClinicConfigResponseDto | null> => {
    const { data, error } = await supabase
      .from("clinic_config")
      .select("*")
      .eq("is_singleton", true)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch clinic config: ${error.message}`);
    return data ? clinicConfigResponseSchema.parse(data) : null;
  };
};
