import { z } from 'zod';

export const listNotificationsPageSchema = z.object({
  status: z.enum(['UNREAD', 'READ']).optional(),
  type: z.enum(['INQUIRY', 'EMAIL', 'CHAT']).optional(),
  cursor: z.string().optional(),
  search: z.string().max(120).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListNotificationsPageDto = z.infer<typeof listNotificationsPageSchema>;