import { SupabaseClient } from '@supabase/supabase-js';

export class UserManagementCommands {
  constructor(private readonly supabase: SupabaseClient) {}

  async deactivateUser(userId: string, reason?: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ is_active: false, deactivation_reason: reason })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }

    return true;
  }
}
