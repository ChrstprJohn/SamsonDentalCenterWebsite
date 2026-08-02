import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfileResponseDto } from '../../dtos/exports';

export const getActiveDoctorsQuery = (supabase: SupabaseClient) => {
  const fetchActiveDoctors = async (serviceId?: string, includeHidden = false): Promise<UserProfileResponseDto[]> => {
    let query = supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, status')
      .eq('role', 'DOCTOR');

    if (includeHidden) {
      // Staff internal: ACTIVE + HIDDEN (exclude ARCHIVED only)
      query = query.neq('status', 'ARCHIVED');
    } else {
      // Public: ACTIVE only (status=ACTIVE or null pre-migration with is_active=true)
      query = query.or('status.eq.ACTIVE,status.is.null').eq('is_active', true);
    }

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

  // This read intentionally remains uncached. Doctor visibility and status are
  // operational data, and callers may request hidden doctors for staff flows.
  return fetchActiveDoctors;
};
