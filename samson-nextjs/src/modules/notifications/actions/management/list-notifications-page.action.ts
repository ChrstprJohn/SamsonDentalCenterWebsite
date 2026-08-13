'use server';

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { listNotificationsPageSchema, type ListNotificationsPageDto } from '../../dtos/management/list-notifications-page.dto';
import { getNotificationsPage } from '../../repositories/management/notifications.queries';

export async function getNotificationsPageAction(params: ListNotificationsPageDto) {
  try {
    const user = await authorizeRole('SECRETARY');
    const validated = listNotificationsPageSchema.parse(params);
    const supabase = await createClient();
    const data = await getNotificationsPage(supabase)(user.id, 'SECRETARY', validated);
    return { success: true as const, data };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
    console.error('getNotificationsPageAction error:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Failed to fetch notifications' };
  }
}