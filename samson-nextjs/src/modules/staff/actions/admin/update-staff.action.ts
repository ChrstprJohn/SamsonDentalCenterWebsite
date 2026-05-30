'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { updateStaffSchema, UpdateStaffDto } from '../../dtos';
import { StaffProfileCommands } from '../../repositories';
import { UpdateStaffUseCase } from '../../use-cases';

export async function updateStaffAction(formData: UpdateStaffDto) {
    try {
        const validData = updateStaffSchema.parse(formData);
        await authorizeRole('ADMIN');

        const supabase = await createClient();
        const staffRepository = new StaffProfileCommands(supabase);
        const updateStaffUseCase = new UpdateStaffUseCase(staffRepository);

        const updatedStaff = await updateStaffUseCase.execute(validData.id, validData);
        return { success: true, data: updatedStaff };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Validation failed: ' + error.issues[0].message };
        }
        if (error instanceof DomainError) return { success: false, error: error.message };
        return { success: false, error: 'An unexpected system error occurred' };
    }
}
