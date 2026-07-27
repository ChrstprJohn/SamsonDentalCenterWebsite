import { z } from 'zod';

export const doctorFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  middleName: z.string().trim().optional().nullable(),
  lastName: z.string().trim().min(1, 'Last name is required'),
  suffix: z.string().trim().optional().nullable(),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  phoneNumber: z.string().optional().nullable(),
  specialization: z.string().trim().optional().nullable(),
  defaultPassword: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')).optional().nullable(),
  serviceIds: z.array(z.string().uuid()).default([]),
  status: z.enum(['ACTIVE', 'HIDDEN', 'ARCHIVED']).default('ACTIVE'),
  avatarUrl: z.string().nullable().optional(),
  imageFile: z.any().optional(),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;
