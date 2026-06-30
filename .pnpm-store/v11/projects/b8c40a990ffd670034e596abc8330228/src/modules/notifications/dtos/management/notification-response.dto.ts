import { z } from 'zod';

export const notificationResponseSchema = z.object({
  id: z.string().uuid(),
  recipient_role: z.string(),
  recipient_id: z.string().uuid().nullable().optional(),
  type: z.string(),
  priority: z.enum(['HIGH', 'STANDARD']),
  title: z.string(),
  message: z.string(),
  link_url: z.string(),
  entity_id: z.string().nullable().optional(),
  is_read: z.boolean(),
  is_archived: z.boolean(),
  created_at: z.string().or(z.date()).transform((val) => new Date(val).toISOString()),
}).transform((data) => ({
  id: data.id,
  recipientRole: data.recipient_role,
  recipientId: data.recipient_id,
  type: data.type,
  priority: data.priority,
  title: data.title,
  message: data.message,
  linkUrl: data.link_url,
  entityId: data.entity_id,
  isRead: data.is_read,
  isArchived: data.is_archived,
  createdAt: data.created_at,
}));

export type NotificationResponseDto = z.output<typeof notificationResponseSchema>;
