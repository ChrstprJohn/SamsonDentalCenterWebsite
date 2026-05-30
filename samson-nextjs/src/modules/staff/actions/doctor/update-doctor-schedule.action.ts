'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { doctorScheduleSchema, DoctorScheduleDto } from '../../dtos';
import { StaffScheduleCommands } from '../../repositories';
import { UpdateDoctorScheduleUseCase } from '../../use-cases';

export async function updateDoctorScheduleAction(formData: DoctorScheduleDto) {
    try {
        const validData = doctorScheduleSchema.parse(formData);

        // This is specific to doctors (or admins theoretically, but keeping isolated)
        await authorizeRole('DOCTOR');

        const supabase = await createClient();
        const repository = new StaffScheduleCommands(supabase);
        const useCase = new UpdateDoctorScheduleUseCase(repository);

        const schedule = await useCase.execute(validData);
        return { success: true, data: schedule };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Validation failed: ' + error.issues[0].message };
        }
        if (error instanceof DomainError) return { success: false, error: error.message };
        return { success: false, error: 'An unexpected system error occurred' };
    }
}
