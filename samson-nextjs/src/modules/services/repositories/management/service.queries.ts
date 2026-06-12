import { SupabaseClient } from "@supabase/supabase-js";
import { ServiceResponseDto, serviceResponseSchema } from "../../dtos/management/service-response.dto";

export const getServicesQuery = (supabase: SupabaseClient) => {
  return async (includeInactive = false): Promise<ServiceResponseDto[]> => {
    let query = supabase.from("services").select("*").order("name");
    
    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch services: ${error.message}`);
    return serviceResponseSchema.array().parse(data ?? []);
  };
};

export const getServiceByIdQuery = (supabase: SupabaseClient) => {
  return async (id: string): Promise<ServiceResponseDto | null> => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch service: ${error.message}`);
    return data ? serviceResponseSchema.parse(data) : null;
  };
};

export const getServicesByIdsQuery = (supabase: SupabaseClient) => {
  return async (ids: string[]): Promise<ServiceResponseDto[]> => {
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .in("id", ids);

    if (error) throw new Error(`Failed to fetch services by ids: ${error.message}`);
    return serviceResponseSchema.array().parse(data ?? []);
  };
};

