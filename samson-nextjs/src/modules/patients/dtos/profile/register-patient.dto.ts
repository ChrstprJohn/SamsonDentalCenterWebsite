import { z } from 'zod';

export const registerPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  middleName: z.string().trim().optional(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  suffix: z.string().trim().optional(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  // E.164-like validation: optional '+' followed by 10-15 digits
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
  dateOfBirth: z.string().date('Invalid date format. Expected YYYY-MM-DD'),
});

export type RegisterPatientDto = z.infer<typeof registerPatientSchema>;