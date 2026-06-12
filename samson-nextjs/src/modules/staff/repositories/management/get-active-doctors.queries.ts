import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfileResponseDto } from '../../dtos';

export const getActiveDoctorsQuery = (supabase: SupabaseClient) => {
  return async (serviceId?: string): Promise<UserProfileResponseDto[]> => {
    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'DOCTOR')
      .eq('is_active', true);

    if (serviceId) {
      const { data: mappings } = await supabase
        .from('doctor_services')
        .select('doctor_id')
        .eq('service_id', serviceId);

      const doctorIds = mappings?.map((m: any) => m.doctor_id) || [];
      if (doctorIds.length === 0) {
        return [];
      }
      query = query.in('id', doctorIds);
    }

    const { data: doctors, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch active doctors: ${error.message}`);
    }

    return (doctors || []).map((d: any) => ({
      id: d.id,
      email: d.email,
      firstName: d.first_name,
      lastName: d.last_name,
      role: d.role,
      isActive: d.is_active ?? true,
    }));
  };
};

// Deprecated class for backwards compatibility
export class GetActiveDoctorsQueries {
  constructor(private readonly supabase: SupabaseClient) {}
  async getActiveDoctors(serviceId?: string): Promise<UserProfileResponseDto[]> {
    return getActiveDoctorsQuery(this.supabase)(serviceId);
  }
}
