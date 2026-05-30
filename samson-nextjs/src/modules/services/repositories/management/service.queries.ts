import { SupabaseClient } from "@supabase/supabase-js";
import { ServiceResponseDto, mapServiceRecord, mapServiceRecords } from "../../dtos/management/service-response.dto";

export class ServiceQueriesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getServices(includeInactive = false): Promise<ServiceResponseDto[]> {
    let query = this.supabase.from("services").select("*").order("name");
    
    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch services: ${error.message}`);
    return mapServiceRecords(data ?? []);
  }

  async getServiceById(id: string): Promise<ServiceResponseDto | null> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch service: ${error.message}`);
    return data ? mapServiceRecord(data) : null;
  }
}
