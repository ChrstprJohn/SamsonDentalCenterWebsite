import { z } from 'zod';

const calendarNoteDbSchema = z.object({
  id: z.string().uuid(),
  date: z.string(),
  start_time: z.string().nullable().optional(),
  note: z.string(),
  doctor_id: z.string().uuid().nullable().optional(),
  created_by: z.string().uuid().nullable().optional(),
  created_at: z.string(),
});

export const calendarNoteResponseSchema = calendarNoteDbSchema.transform((data) => ({
  id: data.id,
  date: data.date,
  startTime: data.start_time ?? null,
  note: data.note,
  doctorId: data.doctor_id ?? null,
  createdBy: data.created_by ?? undefined,
  createdAt: data.created_at,
}));

export type CalendarNoteResponseDto = z.infer<typeof calendarNoteResponseSchema>;