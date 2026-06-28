import { z } from 'zod';

export const staffLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type StaffLoginDto = z.infer<typeof staffLoginSchema>;
