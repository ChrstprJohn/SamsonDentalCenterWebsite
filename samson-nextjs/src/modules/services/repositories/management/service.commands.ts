import { SupabaseClient } from "@supabase/supabase-js";
import { CreateServiceDto } from "../../dtos/management/create-service.dto";
import { UpdateServiceDto } from "../../dtos/management/update-service.dto";
import { ServiceResponseDto } from "../../dtos/management/service-response.dto";

export class ServiceCommandsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createService(data: CreateServiceDto): Promise<ServiceResponseDto> {
    const { data: result, error } = await this.supabase
      .from("services")
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(`Failed to create service: ${error.message}`);
    return result as ServiceResponseDto;
  }

  async updateService(data: UpdateServiceDto): Promise<ServiceResponseDto> {
    const { id, ...updates } = data;
    const { data: result, error } = await this.supabase
      .from("services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update service: ${error.message}`);
    return result as ServiceResponseDto;
  }

  async deleteService(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("services")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw new Error(`Failed to delete service: ${error.message}`);
  }
}
