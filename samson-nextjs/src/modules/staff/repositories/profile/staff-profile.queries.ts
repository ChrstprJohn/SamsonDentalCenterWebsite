import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@/shared/errors';
import { StaffProfileDto, mapStaffProfile } from '../../dtos';

export class StaffProfileQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Fetches a staff profile by their ID.
   */
  async getProfileById(staffId: string): Promise<StaffProfileDto> {
    const { data: staff, error } = await this.supabase
      .from('staff')
      .select('*')
      .eq('id', staffId)
      .single();

    if (error || !staff) {
      throw new NotFoundError('Staff profile not found.');
    }

    return mapStaffProfile(staff as Record<string, unknown>);
  }
}
