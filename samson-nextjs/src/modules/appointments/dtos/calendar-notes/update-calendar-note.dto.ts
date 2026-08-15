import { z } from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

export const updateCalendarNoteSchema = z.object({
  id: z.string().uuid('Invalid note ID'),
  title: z.string().trim().max(100, 'Title too long').optional().nullable(),
  date: z.string().regex(DATE_REGEX, 'Date must be in YYYY-MM-DD format'),
  startTime: z
    .string()
    .regex(TIME_REGEX, 'Start time must be in HH:MM format')
    .optional()
    .nullable(),
  doctorId: z.string().uuid('Invalid doctor ID').optional().nullable(),
  note: z.string().trim().max(1000, 'Note too long').optional().nullable().default(''),
}).refine(data => (data.title?.trim() || data.note?.trim()), {
  message: 'Title or description is required',
  path: ['note'],
});

export type UpdateCalendarNoteDto = z.infer<typeof updateCalendarNoteSchema>;
