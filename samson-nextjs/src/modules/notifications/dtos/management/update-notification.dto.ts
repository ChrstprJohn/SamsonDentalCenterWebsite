import { z } from 'zod';

export const updateNotificationSchema = z.object({
  id: z.string().uuid(),
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export type UpdateNotificationDto = z.infer<typeof updateNotificationSchema>;
