import { z } from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const getCalendarNotesSchema = z.object({
  dateFrom: z.string().regex(DATE_REGEX, 'Start date must be in YYYY-MM-DD format'),
  dateTo: z.string().regex(DATE_REGEX, 'End date must be in YYYY-MM-DD format'),
});

export type GetCalendarNotesDto = z.infer<typeof getCalendarNotesSchema>;