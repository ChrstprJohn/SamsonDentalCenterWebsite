import { z } from 'zod';

const emptyStringToUndefined = z.literal('').transform(() => undefined);
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const getAvailableTimeSlotsSchema = z.object({
  serviceId: z.string().uuid('Invalid Service ID format'),
  // Omit or pass undefined for 'Any Doctor'
  doctorId: z.string().uuid('Invalid Doctor ID format').optional().nullable().or(emptyStringToUndefined),
  // Specific date clicked on the calendar wizard
  date: z.string().regex(DATE_REGEX, 'Date must be in YYYY-MM-DD format'),
});

export type GetAvailableTimeSlotsDto = z.infer<typeof getAvailableTimeSlotsSchema>;

// Shared Slot Entity
export const availableSlotSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Must be HH:MM format' }),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Must be HH:MM format' }),
  // Houses the implicitly assigned least-busy doctor if 'Any Doctor' was picked
  doctorId: z.string().uuid(),
  doctorName: z.string().trim(),
});

// Output DTO: Sliced and load-balanced time windows returned to the public picker
export const getAvailableTimeSlotsResponseSchema = z.object({
  date: z.string().regex(DATE_REGEX),
  serviceId: z.string().uuid(),
  availableSlots: z.array(availableSlotSchema),
});

export type AvailableSlotDto = z.infer<typeof availableSlotSchema>;
export type GetAvailableTimeSlotsResponseDto = z.infer<typeof getAvailableTimeSlotsResponseSchema>;
