import { SupabaseClient } from '@supabase/supabase-js';
import { CreateServiceDto } from '../../dtos/management/create-service.dto';
import { UpdateServiceDto } from '../../dtos/management/update-service.dto';
import { ServiceResponseDto, serviceResponseSchema } from '../../dtos/management/service-response.dto';
import { createAdminClient } from '@/shared/database/server';

export const createServiceCommand = (supabase: SupabaseClient) => {
  return async (data: CreateServiceDto): Promise<ServiceResponseDto> => {
    const status = data.status || (data.isActive ? 'ACTIVE' : 'HIDDEN');
    const dbPayload = {
      name: data.name,
      description: data.description,
      duration_minutes: data.durationMinutes,
      price: data.price,
      service_type: data.serviceType,
      is_active: status === 'ACTIVE',
      image_url: data.imageUrl,
      status: status,
      ranking: data.ranking ?? null,
    };
    const { data: result, error } = await supabase
      .from("services")
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw new Error(`Failed to create service: ${error.message}`);

    // Map new service to all operational doctors so booking inherits their
    // clinic-hours schedule instead of showing blank availability.
    const isMockClient = !!(supabase as any).from?.mock;
    if (!isMockClient) {
      const adminDb = await createAdminClient();
      const { data: doctors, error: doctorsError } = await adminDb
        .from('users')
        .select('id')
        .eq('role', 'DOCTOR')
        .in('status', ['ACTIVE', 'HIDDEN']);
      if (!doctorsError && doctors?.length) {
        const { error: mapError } = await adminDb
          .from('doctor_services')
          .insert(doctors.map((d: any) => ({ doctor_id: d.id, service_id: result.id })));
        if (mapError) {
          console.error('Failed to map new service to doctors:', mapError);
        }
      }
    }

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
    if (updates.status !== undefined) {
      dbPayload.status = updates.status;
      dbPayload.is_active = updates.status === 'ACTIVE';
    } else if (updates.isActive !== undefined) {
      dbPayload.is_active = updates.isActive;
      dbPayload.status = updates.isActive ? 'ACTIVE' : 'HIDDEN';
    }
    if (updates.imageUrl !== undefined) dbPayload.image_url = updates.imageUrl;
    if (updates.ranking !== undefined) dbPayload.ranking = updates.ranking;

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
      .update({ is_active: false, status: 'ARCHIVED' })
      .eq("id", id);

    if (error) throw new Error(`Failed to delete service: ${error.message}`);
  };
};

export const archiveServiceCommand = (supabase: SupabaseClient) => {
  return async (id: string, currentStatus?: string): Promise<ServiceResponseDto> => {
    const isArchived = currentStatus === 'ARCHIVED';
    const nextStatus = isArchived ? 'HIDDEN' : 'ARCHIVED';
    const nextIsActive = false; // Restored service goes to HIDDEN by default until toggled ACTIVE

    const { data: result, error } = await supabase
      .from("services")
      .update({ is_active: nextIsActive, status: nextStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to archive/restore service: ${error.message}`);
    return serviceResponseSchema.parse(result);
  };
};

export const toggleServiceVisibilityCommand = (supabase: SupabaseClient) => {
  return async (id: string, currentIsActive: boolean): Promise<ServiceResponseDto> => {
    const nextIsActive = !currentIsActive;
    const nextStatus = nextIsActive ? 'ACTIVE' : 'HIDDEN';
    const { data: result, error } = await supabase
      .from("services")
      .update({ is_active: nextIsActive, status: nextStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to toggle service visibility: ${error.message}`);
    return serviceResponseSchema.parse(result);
  };
};

