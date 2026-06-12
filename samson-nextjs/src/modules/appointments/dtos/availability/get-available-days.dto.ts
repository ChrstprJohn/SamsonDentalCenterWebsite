import { z } from 'zod';
import { availableSlotSchema } from './get-available-time-slots.dto';

const emptyStringToUndefined = z.literal('').transform(() => undefined);
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_REGEX = /^\d{4}-\d{2}$/;

export const getAvailableDaysSchema = z.object({
  serviceId: z.string().uuid('Invalid Service ID format'),
  // Omit or pass undefined for 'Any Doctor'
  doctorId: z.string().uuid('Invalid Doctor ID format').optional().or(emptyStringToUndefined),
  // Expects YYYY-MM to query an entire calendar page efficiently
  month: z.string().regex(MONTH_REGEX, 'Month must be in YYYY-MM format'),
});

export type GetAvailableDaysDto = z.infer<typeof getAvailableDaysSchema>;

export const availabilityMapSchema = z.record(
  z.string().regex(DATE_REGEX),
  z.array(availableSlotSchema)
);

export type AvailabilityMapDto = z.infer<typeof availabilityMapSchema>;

// Output DTO: Lightweight array of enabled calendar dates
export const getAvailableDaysResponseSchema = z.object({
  month: z.string().regex(MONTH_REGEX),
  serviceId: z.string().uuid(),
  // Array of dates containing inventory (e.g., ["2026-06-01", "2026-06-03"])
  availableDates: z.array(z.string().regex(DATE_REGEX)),
  // Date-keyed cache of computed slots for instant date selection in the picker
  availabilityMap: availabilityMapSchema,
});

export type GetAvailableDaysResponseDto = z.infer<typeof getAvailableDaysResponseSchema>;
