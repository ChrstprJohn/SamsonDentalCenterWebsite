import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms and Privacy Policy',
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
