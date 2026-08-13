import { SupabaseClient } from '@supabase/supabase-js';
import { notificationResponseSchema, NotificationResponseDto } from '../../dtos/management/notification-response.dto';
import { decodeCursor, encodeCursor, type PageResult } from '@/shared/pagination/page-result';

// Guest-only business: only these notification types are shown.
export const KEPT_NOTIFICATION_TYPES = ['NEW_INQUIRY', 'NEW_MESSAGE', 'FAILED_EMAIL_ALERT'];

export const getUnreadNotifications = (supabase: SupabaseClient) => async (
  userId: string | null,
  role: string,
  limit = 10
): Promise<NotificationResponseDto[]> => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('is_archived', false)
    .in('type', KEPT_NOTIFICATION_TYPES)
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
    .eq('is_archived', false)
    .in('type', KEPT_NOTIFICATION_TYPES);

  if (userId) {
    query = query.or(`recipient_id.eq.${userId},recipient_role.eq.${role}`);
  } else {
    query = query.eq('recipient_role', role);
  }

  const { count, error } = await query;
  if (error) throw new Error(`Failed to count unread notifications: ${error.message}`);

  return count || 0;
};

export interface NotificationsPageParams {
  status?: 'UNREAD' | 'READ';
  cursor?: string;
  search?: string;
  limit?: number;
}

function escapeIlike(value: string): string {
  return value.replace(/[\\%_,]/g, (character) => `\\${character}`);
}

export const getNotificationsPage = (supabase: SupabaseClient) => async (
  userId: string | null,
  role: string,
  params: NotificationsPageParams = {}
): Promise<PageResult<NotificationResponseDto>> => {
  const limit = params.limit ?? 25;

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('is_archived', false)
    .in('type', KEPT_NOTIFICATION_TYPES)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });

  if (userId) {
    query = query.or(`recipient_id.eq.${userId},recipient_role.eq.${role}`);
  } else {
    query = query.eq('recipient_role', role);
  }
  if (params.status === 'READ') query = query.eq('is_read', true);
  if (params.status === 'UNREAD') query = query.eq('is_read', false);
  if (params.search) {
    const pattern = `%${escapeIlike(params.search)}%`;
    query = query.or(`title.ilike.${pattern},message.ilike.${pattern}`);
  }

  let countQuery = supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_archived', false)
    .in('type', KEPT_NOTIFICATION_TYPES);
  if (userId) {
    countQuery = countQuery.or(`recipient_id.eq.${userId},recipient_role.eq.${role}`);
  } else {
    countQuery = countQuery.eq('recipient_role', role);
  }
  if (params.status === 'READ') countQuery = countQuery.eq('is_read', true);
  if (params.status === 'UNREAD') countQuery = countQuery.eq('is_read', false);
  if (params.search) {
    const pattern = `%${escapeIlike(params.search)}%`;
    countQuery = countQuery.or(`title.ilike.${pattern},message.ilike.${pattern}`);
  }

  const cursor = decodeCursor(params.cursor);
  if (params.cursor && !cursor) throw new Error('Invalid notifications cursor.');
  if (cursor) {
    const cursorFilter = `created_at.lt.${cursor.sortValue},and(created_at.eq.${cursor.sortValue},id.lt.${cursor.id})`;
    query = query.or(cursorFilter);
  }

  const [pageResult, countResult] = await Promise.all([query.range(0, limit), countQuery]);
  if (pageResult.error) throw new Error(`Failed to fetch notifications: ${pageResult.error.message}`);
  if (countResult.error) throw new Error(`Failed to count notifications: ${countResult.error.message}`);

  const records = (pageResult.data || []) as Array<Record<string, unknown>>;
  const pageRecords = records.length > limit ? records.slice(0, limit) : records;
  const items = pageRecords.map((row) => notificationResponseSchema.parse(row));
  const lastRecord = pageRecords.at(-1);
  // range(0, limit) yields limit+1 rows; extra row proves more pages exist.
  const hasMore = records.length > limit && !!lastRecord?.created_at;
  const nextCursor = hasMore && lastRecord
    ? encodeCursor({ sortValue: String(lastRecord.created_at), id: String(lastRecord.id) })
    : null;

  return { items, nextCursor, hasMore, total: countResult.count ?? items.length };
};
