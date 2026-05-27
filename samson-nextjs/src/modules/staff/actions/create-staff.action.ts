'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { createStaffSchema, CreateStaffDto } from '../dtos/create-staff.dto';
import { StaffProfileCommands } from '../repositories/staff-profile.commands';
import { CreateStaffUseCase } from '../use-cases/create-staff.use-case';

export async function createStaffAction(formData: CreateStaffDto) {
    try {
        // 1. Zod Validation or Form Validation
        const validData = createStaffSchema.parse(formData);

        // 2. Auth Validation
        const user = await getAuthenticatedUser();

        // 3. Instantiate Repositories and Use-Cases (inject dependencies)
        const supabase = await createClient();
        const staffRepository = new StaffProfileCommands(supabase);
        const createStaffUseCase = new CreateStaffUseCase(staffRepository);

        // 4. Execution
        const newStaff = await createStaffUseCase.execute(user.id, validData);

        // 5. Output mapping
        return { success: true, data: newStaff };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const zodError = error as z.ZodError;
            return {
                success: false,
                error: 'Validation failed: ' + zodError.issues[0].message,
            };
        }

        if (error instanceof DomainError) {
            return { success: false, error: error.message };
        }

        // Catch-all
        console.error('ACTION ERROR:', error);
        return { success: false, error: 'An unexpected system error occurred' };
    }
}
