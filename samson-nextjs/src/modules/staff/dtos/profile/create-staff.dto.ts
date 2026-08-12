import { z } from 'zod';

export const StaffRoleEnum = z.enum(['ADMIN', 'DOCTOR', 'SECRETARY']);

export const createStaffSchema = z.object({
    firstName: z.string().trim().min(1, 'First name is required'),
    middleName: z.string().trim().optional().nullable(),
    lastName: z.string().trim().min(1, 'Last name is required'),
    suffix: z.string().trim().optional().nullable(),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    role: StaffRoleEnum,
    phoneNumber: z
      .string()
      .trim()
      .transform((val) => val.replace(/\D/g, ''))
      .refine((val) => /^09\d{9}$/.test(val), 'Invalid phone number format (09XX XXX XXXX expected)'),
    // specializations removed - handled by a separate update action well focus on account creation here
});

export type CreateStaffDto = z.infer<typeof createStaffSchema>;
