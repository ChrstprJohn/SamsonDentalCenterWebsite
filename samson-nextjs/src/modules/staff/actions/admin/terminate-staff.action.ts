'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { terminateStaffSchema, TerminateStaffDto } from '../../dtos';
import { terminateStaffCommand } from '../../repositories';
import { terminateStaffUseCase } from '../../use-cases';

export async function terminateStaffAction(formData: TerminateStaffDto | string) {
    try {
        await authorizeRole('ADMIN');
        const validData = terminateStaffSchema.parse(
            typeof formData === 'string' ? { staffId: formData } : formData
        );

        const supabase = await createClient();
        const repo = terminateStaffCommand(supabase);
        const useCase = terminateStaffUseCase(repo);

        await useCase(validData.staffId);
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Validation failed: ' + error.issues[0].message };
        }
        if (error instanceof DomainError) return { success: false, error: error.message };
        return { success: false, error: 'An unexpected system error occurred' };
    }
}

