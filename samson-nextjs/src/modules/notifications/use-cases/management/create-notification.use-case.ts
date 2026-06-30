import { SupabaseClient } from '@supabase/supabase-js';
import { CreateNotificationDto } from '../../dtos/management/create-notification.dto';
import { NotificationResponseDto } from '../../dtos/management/notification-response.dto';
import { insertNotification } from '../../repositories/management/notifications.commands';

export const createNotificationUseCase = (supabase: SupabaseClient) => async (
  dto: CreateNotificationDto
): Promise<NotificationResponseDto> => {
  return insertNotification(supabase)(dto);
};
