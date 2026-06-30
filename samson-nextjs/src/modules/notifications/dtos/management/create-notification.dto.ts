import { z } from 'zod';

export const createNotificationSchema = z.object({
  recipientRole: z.string().default('SECRETARY'),
  recipientId: z.string().uuid().optional().nullable(),
  type: z.string(),
  priority: z.enum(['HIGH', 'STANDARD']).default('STANDARD'),
  title: z.string(),
  message: z.string(),
  linkUrl: z.string(),
  entityId: z.string().optional().nullable(),
});

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;
