import { z } from 'zod';

export const queueEmailSchema = z.object({
  recipient: z.string().email(),
  subject: z.string().min(1),
  templateName: z.enum(['signup_otp']),
  payload: z.record(z.string(), z.any()),
});

export type QueueEmailDto = z.infer<typeof queueEmailSchema>;
