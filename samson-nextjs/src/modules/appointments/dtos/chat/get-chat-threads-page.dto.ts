import { z } from 'zod';

export const getChatThreadsPageSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().max(512).optional().nullable(),
  tab: z.enum(['ACTIVE', 'ARCHIVE']).default('ACTIVE'),
  search: z.string().trim().max(120).optional().or(z.literal('').transform(() => undefined)),
  unreadOnly: z.boolean().default(false),
});

export type GetChatThreadsPageDto = z.infer<typeof getChatThreadsPageSchema>;
