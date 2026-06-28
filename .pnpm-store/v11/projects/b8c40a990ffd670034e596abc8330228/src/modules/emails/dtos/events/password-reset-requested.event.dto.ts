import { z } from 'zod';

export const passwordResetRequestedEventSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  otpCode: z.string().min(6),
});

export type PasswordResetRequestedEventDto = z.infer<typeof passwordResetRequestedEventSchema>;
