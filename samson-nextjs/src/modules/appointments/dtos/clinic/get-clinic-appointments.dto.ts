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

const appointmentDirectoryStatuses = z.array(z.string().trim().min(1)).max(20).optional();

export const getClinicAppointmentsPageSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().max(512).optional().nullable(),
  search: z.string().trim().max(120).optional().or(emptyStringToUndefined),
  statuses: appointmentDirectoryStatuses,
  status: z.string().trim().optional().or(emptyStringToUndefined),
  doctorId: z
    .string()
    .uuid('Invalid Doctor ID format')
    .optional()
    .or(emptyStringToUndefined),
  date: z
    .string()
    .regex(DATE_REGEX, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(emptyStringToUndefined),
  dateBefore: z
    .string()
    .regex(DATE_REGEX, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(emptyStringToUndefined),
  noShowUnresolvedOnly: z.boolean().optional(),
});

export type GetClinicAppointmentsPageDto = z.infer<typeof getClinicAppointmentsPageSchema>;
