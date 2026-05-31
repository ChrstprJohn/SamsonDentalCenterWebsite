import { z } from 'zod';

export const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Phone number must be in E.164 format (e.g. +1234567890)'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format (e.g. 1990-01-01)'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  acceptTerms: z.literal(true, {
    message: 'You must accept the Terms and Privacy Policy',
  }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
