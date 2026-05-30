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
        .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format')
        .optional(),
    role: StaffRoleEnum.optional(),
});

export type UpdateStaffDto = z.infer<typeof updateStaffSchema>;
