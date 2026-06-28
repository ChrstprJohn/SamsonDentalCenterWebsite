import { z } from 'zod';

export const patientRegisteredEventSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  otpCode: z.string().min(6),
});

export type PatientRegisteredEventDto = z.infer<typeof patientRegisteredEventSchema>;
