import { z } from 'zod';

export const appointmentConvertedEventSchema = z.object({
  appointmentId: z.string().uuid(),
  serviceId: z.string().uuid(),
  doctorId: z.string().uuid().nullable().optional(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable().optional(),
  durationMinutes: z.number().int().positive().optional().nullable(),
  inquiryId: z.string().uuid().optional().nullable(),
  guestName: z.string().optional().nullable(),
  guestEmail: z.string().email().optional().nullable(),
  guestPhone: z.string().optional().nullable(),
  patientId: z.string().uuid().optional().nullable(),
});

export type AppointmentConvertedEventDto = z.infer<typeof appointmentConvertedEventSchema>;
