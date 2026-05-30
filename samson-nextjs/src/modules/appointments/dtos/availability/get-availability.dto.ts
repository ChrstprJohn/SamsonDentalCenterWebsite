import { z } from 'zod';

// Utility helper to clear empty form or query parameters cleanly
const emptyStringToUndefined = z.literal('').transform(() => undefined);
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_REGEX = /^\d{4}-\d{2}$/;

// ==========================================
// 1. MONTHLY CALENDAR AVAILABILITY (DAYS)
// ==========================================

export const getAvailableDaysSchema = z.object({
    serviceId: z.string().uuid('Invalid Service ID format'),
    // Omit or pass undefined for 'Any Doctor'
    doctorId: z.string().uuid('Invalid Doctor ID format').optional().or(emptyStringToUndefined),
    // Expects YYYY-MM to query an entire calendar page efficiently
    month: z.string().regex(MONTH_REGEX, 'Month must be in YYYY-MM format'),
});

export type GetAvailableDaysDto = z.infer<typeof getAvailableDaysSchema>;

// Output DTO: Lightweight array of enabled calendar dates
export const getAvailableDaysResponseSchema = z.object({
    month: z.string().regex(MONTH_REGEX),
    serviceId: z.string().uuid(),
    // Array of dates containing inventory (e.g., ["2026-06-01", "2026-06-03"])
    availableDates: z.array(z.string().regex(DATE_REGEX)),
});

export type GetAvailableDaysResponseDto = z.infer<typeof getAvailableDaysResponseSchema>;

// ==========================================
// 2. DAILY AVAILABILITY (TIME SLOTS)
// ==========================================

export const getAvailableTimeSlotsSchema = z.object({
    serviceId: z.string().uuid('Invalid Service ID format'),
    // Omit or pass undefined for 'Any Doctor'
    doctorId: z.string().uuid('Invalid Doctor ID format').optional().or(emptyStringToUndefined),
    // Specific date clicked on the calendar wizard
    date: z.string().regex(DATE_REGEX, 'Date must be in YYYY-MM-DD format'),
});

export type GetAvailableTimeSlotsDto = z.infer<typeof getAvailableTimeSlotsSchema>;

// Shared Slot Entity
export const availableSlotSchema = z.object({
    startTime: z.string().datetime({ message: 'Must be a valid ISO UTC timestamp' }),
    endTime: z.string().datetime({ message: 'Must be a valid ISO UTC timestamp' }),
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
