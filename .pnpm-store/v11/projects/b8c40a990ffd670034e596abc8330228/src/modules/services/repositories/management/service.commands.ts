import { SupabaseClient } from '@supabase/supabase-js';
import { CreateServiceDto } from '../../dtos/management/create-service.dto';
import { UpdateServiceDto } from '../../dtos/management/update-service.dto';
import { ServiceResponseDto, serviceResponseSchema } from '../../dtos/management/service-response.dto';

export const createServiceCommand = (supabase: SupabaseClient) => {
  return async (data: CreateServiceDto): Promise<ServiceResponseDto> => {
    const dbPayload = {
      name: data.name,
      description: data.description,
      duration_minutes: data.durationMinutes,
      price: data.price,
      service_type: data.serviceType,
      is_active: data.isActive,
    };
    const { data: result, error } = await supabase
      .from("services")
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw new Error(`Failed to create service: ${error.message}`);
    return serviceResponseSchema.parse(result);
  };
};

export const updateServiceCommand = (supabase: SupabaseClient) => {
  return async (data: UpdateServiceDto): Promise<ServiceResponseDto> => {
    const { id, ...updates } = data;
    const dbPayload: Record<string, any> = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.description !== undefined) dbPayload.description = updates.description;
    if (updates.durationMinutes !== undefined) dbPayload.duration_minutes = updates.durationMinutes;
    if (updates.price !== undefined) dbPayload.price = updates.price;
    if (updates.serviceType !== undefined) dbPayload.service_type = updates.serviceType;
    if (updates.isActive !== undefined) dbPayload.is_active = updates.isActive;

    const { data: result, error } = await supabase
      .from("services")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update service: ${error.message}`);
    return serviceResponseSchema.parse(result);
  };
};

export const deleteServiceCommand = (supabase: SupabaseClient) => {
  return async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw new Error(`Failed to delete service: ${error.message}`);
  };
};
