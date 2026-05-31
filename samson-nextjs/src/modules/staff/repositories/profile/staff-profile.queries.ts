import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@/shared/errors';
import { StaffProfileDto, staffProfileSchema } from '../../dtos';

export const getProfileByIdQuery = (supabase: SupabaseClient) => {
  return async (staffId: string): Promise<StaffProfileDto> => {
    const { data: staff, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', staffId)
      .in('role', ['DOCTOR', 'SECRETARY', 'ADMIN'])
      .single();

    if (error || !staff) {
      throw new NotFoundError('Staff profile not found.');
    }

    return staffProfileSchema.parse(staff);
  };
};

// Deprecated class for backwards compatibility
export class StaffProfileQueries {
  constructor(private readonly supabase: SupabaseClient) {}
  async getProfileById(staffId: string): Promise<StaffProfileDto> {
    return getProfileByIdQuery(this.supabase)(staffId);
  }
}
