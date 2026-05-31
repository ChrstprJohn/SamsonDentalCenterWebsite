'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { createStaffSchema, CreateStaffDto } from '../../dtos';
import { createStaffCommand } from '../../repositories';
import { createStaffUseCase } from '../../use-cases';

export async function createStaffAction(formData: CreateStaffDto) {
    try {
        const validData = createStaffSchema.parse(formData);
        const user = await authorizeRole('ADMIN');

        const supabase = await createClient();
        const repo = createStaffCommand(supabase);
        const useCase = createStaffUseCase(repo);

        const newStaff = await useCase(user.id, validData);
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
