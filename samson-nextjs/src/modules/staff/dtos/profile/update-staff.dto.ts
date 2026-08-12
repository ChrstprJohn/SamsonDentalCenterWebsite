import { z } from 'zod';
import { StaffRoleEnum } from './create-staff.dto';

export const updateStaffSchema = z.object({
    id: z.string().uuid('Invalid staff ID'),
    email: z.string().trim().toLowerCase().email('Invalid email').optional(),
    firstName: z.string().trim().min(1, 'First name is required').optional(),
    lastName: z.string().trim().min(1, 'Last name is required').optional(),
    middleName: z.string().trim().optional().nullable(),
    suffix: z.string().trim().optional().nullable(),
    phoneNumber: z
        .string()
        .trim()
        .transform((val) => val.replace(/\D/g, ''))
        .refine((val) => /^09\d{9}$/.test(val), 'Invalid phone number format (09XX XXX XXXX expected)')
        .optional(),
    role: StaffRoleEnum.optional(),
});

export type UpdateStaffDto = z.infer<typeof updateStaffSchema>;
