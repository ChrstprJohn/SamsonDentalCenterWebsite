import { SupabaseClient } from '@supabase/supabase-js';
import { notificationResponseSchema, NotificationResponseDto } from '../../dtos/management/notification-response.dto';

export const getUnreadNotifications = (supabase: SupabaseClient) => async (
  userId: string | null,
  role: string,
  limit = 10
): Promise<NotificationResponseDto[]> => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.or(`recipient_id.eq.${userId},recipient_role.eq.${role}`);
  } else {
    query = query.eq('recipient_role', role);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);

  return (data || []).map((row) => notificationResponseSchema.parse(row));
};

export const getUnreadCount = (supabase: SupabaseClient) => async (
  userId: string | null,
  role: string
): Promise<number> => {
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
    .eq('is_archived', false);

  if (userId) {
    query = query.or(`recipient_id.eq.${userId},recipient_role.eq.${role}`);
  } else {
    query = query.eq('recipient_role', role);
  }

  const { count, error } = await query;
  if (error) throw new Error(`Failed to count unread notifications: ${error.message}`);

  return count || 0;
};
