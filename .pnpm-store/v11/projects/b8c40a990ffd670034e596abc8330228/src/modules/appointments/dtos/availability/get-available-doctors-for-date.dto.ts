import { z } from 'zod';

export const getAvailableDoctorsForDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  serviceId: z.string().uuid('Invalid service ID format'),
});

export type GetAvailableDoctorsForDateDto = z.infer<typeof getAvailableDoctorsForDateSchema>;
