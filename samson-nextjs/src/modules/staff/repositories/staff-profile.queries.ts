import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@/shared/errors';

export class StaffProfileQueries {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Fetches a staff profile by their ID.
   */
  async getProfileById(staffId: string) {
    const { data: staff, error } = await this.supabase
      .from('staff') // Ensure this points to the correct table
      .select('*')
      .eq('id', staffId)
      .single();

    if (error || !staff) {
      throw new NotFoundError('Staff profile not found.');
    }

    return staff;
  }
}