import { z } from 'zod';

export const manualBookingGuestEventSchema = z.object({
  appointmentId: z.string().uuid(),
  serviceId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.string(),
  startTime: z.string(),
  durationMinutes: z.number().int().positive(),
  guestContactId: z.string().uuid(),
  guestName: z.string().min(1),
  guestEmail: z.string().email().nullable().optional(),
  guestPhone: z.string().min(1),
});

export type ManualBookingGuestEventDto = z.infer<typeof manualBookingGuestEventSchema>;
