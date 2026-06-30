import { SupabaseClient } from '@supabase/supabase-js';
import { CreateNotificationDto } from '../../dtos/management/create-notification.dto';
import { UpdateNotificationDto } from '../../dtos/management/update-notification.dto';
import { notificationResponseSchema, NotificationResponseDto } from '../../dtos/management/notification-response.dto';

export const insertNotification = (supabase: SupabaseClient) => async (
  dto: CreateNotificationDto
): Promise<NotificationResponseDto> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      recipient_role: dto.recipientRole,
      recipient_id: dto.recipientId,
      type: dto.type,
      priority: dto.priority,
      title: dto.title,
      message: dto.message,
      link_url: dto.linkUrl,
      entity_id: dto.entityId,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to insert notification: ${error.message}`);
  return notificationResponseSchema.parse(data);
};

export const updateNotification = (supabase: SupabaseClient) => async (
  dto: UpdateNotificationDto
): Promise<NotificationResponseDto> => {
  const updates: Record<string, any> = {};
  if (dto.isRead !== undefined) updates.is_read = dto.isRead;
  if (dto.isArchived !== undefined) updates.is_archived = dto.isArchived;

  const { data, error } = await supabase
    .from('notifications')
    .update(updates)
    .eq('id', dto.id)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to update notification: ${error.message}`);
  return notificationResponseSchema.parse(data);
};

export const markAllNotificationsRead = (supabase: SupabaseClient) => async (
  userId: string | null,
  role: string
): Promise<void> => {
  let query = supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (userId) {
    query = query.or(`recipient_id.eq.${userId},recipient_role.eq.${role}`);
  } else {
    query = query.eq('recipient_role', role);
  }

  const { error } = await query;
  if (error) throw new Error(`Failed to mark all read: ${error.message}`);
};
