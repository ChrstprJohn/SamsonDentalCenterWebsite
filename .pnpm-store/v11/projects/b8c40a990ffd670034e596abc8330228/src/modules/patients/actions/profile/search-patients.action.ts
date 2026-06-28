'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { searchPatientsQuery } from '../../repositories/exports';

const searchPatientsInputSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters long'),
});

/**
 * Action to search registered patients by name or email.
 * Authorization restriction: SECRETARY or ADMIN role only.
 */
export async function searchPatientsAction(data: { query: string }) {
  try {
    // 1. Zod input validation
    const parsed = searchPatientsInputSchema.parse(data);

    // 2. Auth boundary verification
    const user = await getAuthenticatedUser();
    const role = user.user_metadata?.role || user.role;
    if (role !== 'SECRETARY' && role !== 'ADMIN') {
      throw new DomainError('Unauthorized: Access restricted to clinic staff.', 'UNAUTHORIZED_ACCESS');
    }

    // 3. DI Setup
    const supabase = await createClient();
    const queryExecutor = searchPatientsQuery(supabase);

    // 4. Execution
    const result = await queryExecutor(parsed);

    return { success: true, data: result };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed: ' + error.issues[0].message,
      };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (searchPatientsAction):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
