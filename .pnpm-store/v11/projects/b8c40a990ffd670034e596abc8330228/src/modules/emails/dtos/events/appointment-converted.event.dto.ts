import { z } from 'zod';

export const appointmentConvertedEventSchema = z.object({
  appointmentId: z.string().uuid(),
  serviceId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.string(),
  startTime: z.string(),
  durationMinutes: z.number().int().positive(),
  inquiryId: z.string().uuid(),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(1),
});

export type AppointmentConvertedEventDto = z.infer<typeof appointmentConvertedEventSchema>;
