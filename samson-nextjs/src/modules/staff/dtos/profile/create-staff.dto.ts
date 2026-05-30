import { z } from 'zod';

export const StaffRoleEnum = z.enum(['ADMIN', 'DOCTOR', 'SECRETARY']);

export const createStaffSchema = z.object({
    firstName: z.string().trim().min(1, 'First name is required'),
    middleName: z.string().trim().optional().nullable(),
    lastName: z.string().trim().min(1, 'Last name is required'),
    suffix: z.string().trim().optional().nullable(),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    role: StaffRoleEnum,
    phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
    // specializations removed - handled by a separate update action well focus on account creation here
});

export type CreateStaffDto = z.infer<typeof createStaffSchema>;
