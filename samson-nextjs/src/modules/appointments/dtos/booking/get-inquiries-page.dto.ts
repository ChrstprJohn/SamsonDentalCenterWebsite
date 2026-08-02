import { z } from 'zod';

export const getInquiriesPageSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().max(512).optional().nullable(),
  status: z.enum(['NEW', 'CONVERTED', 'DROPPED']).optional(),
  search: z.string().trim().max(120).optional().or(z.literal('').transform(() => undefined)),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

export type GetInquiriesPageDto = z.infer<typeof getInquiriesPageSchema>;
