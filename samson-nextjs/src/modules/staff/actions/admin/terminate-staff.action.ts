'use server';

import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { StaffProfileCommands } from '../../repositories';
import { TerminateStaffUseCase } from '../../use-cases';

export async function terminateStaffAction(staffId: string) {
    try {
        await authorizeRole('ADMIN');

        const supabase = await createClient();
        const staffRepository = new StaffProfileCommands(supabase);
        const terminateStaffUseCase = new TerminateStaffUseCase(staffRepository);

        await terminateStaffUseCase.execute(staffId);
        return { success: true };
    } catch (error) {
        if (error instanceof DomainError) return { success: false, error: error.message };
        return { success: false, error: 'An unexpected system error occurred' };
    }
}
