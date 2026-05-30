'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { createStaffSchema, CreateStaffDto } from '../../dtos';
import { StaffProfileCommands } from '../../repositories';
import { CreateStaffUseCase } from '../../use-cases';

export async function createStaffAction(formData: CreateStaffDto) {
    try {
        const validData = createStaffSchema.parse(formData);
        const user = await authorizeRole('ADMIN');

        const supabase = await createClient();
        const staffRepository = new StaffProfileCommands(supabase);
        const createStaffUseCase = new CreateStaffUseCase(staffRepository);

        const newStaff = await createStaffUseCase.execute(user.id, validData);
        return { success: true, data: newStaff };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed: ' + error.issues[0].message,
            };
        }
        if (error instanceof DomainError) return { success: false, error: error.message };

        console.error('ACTION ERROR:', error);
        return { success: false, error: 'An unexpected system error occurred' };
    }
}
