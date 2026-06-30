import { SupabaseClient } from '@supabase/supabase-js';
import { UpdateNotificationDto } from '../../dtos/management/update-notification.dto';
import { NotificationResponseDto } from '../../dtos/management/notification-response.dto';
import { updateNotification } from '../../repositories/management/notifications.commands';

export const markReadUseCase = (supabase: SupabaseClient) => async (
  dto: UpdateNotificationDto
): Promise<NotificationResponseDto> => {
  return updateNotification(supabase)({ ...dto, isRead: true });
};
