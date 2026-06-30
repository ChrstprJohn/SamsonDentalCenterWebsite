import { SupabaseClient } from '@supabase/supabase-js';
import { markAllNotificationsRead } from '../../repositories/management/notifications.commands';

export const markAllReadUseCase = (supabase: SupabaseClient) => async (
  userId: string | null,
  role: string
): Promise<void> => {
  return markAllNotificationsRead(supabase)(userId, role);
};
