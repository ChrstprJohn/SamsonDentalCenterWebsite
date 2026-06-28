import { z } from 'zod';

const emptyStringToUndefined = z.literal('').transform(() => undefined);
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const getClinicAppointmentsSchema = z.object({
  date: z
    .string()
    .regex(DATE_REGEX, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(emptyStringToUndefined),
  status: z.string().trim().optional().or(emptyStringToUndefined),
  doctorId: z
    .string()
    .uuid('Invalid Doctor ID format')
    .optional()
    .or(emptyStringToUndefined),
});

export type GetClinicAppointmentsDto = z.infer<typeof getClinicAppointmentsSchema>;
