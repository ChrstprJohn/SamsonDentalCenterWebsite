'use server';

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { DomainError } from '@/shared/errors';
import { getClinicAppointmentsPageSchema, type GetClinicAppointmentsPageDto } from '../../dtos/exports';
import { getAppointmentsPageByClinicQuery } from '../../repositories/clinic/clinic-appointments-page.queries';

export async function getClinicAppointmentsPageAction(params: GetClinicAppointmentsPageDto) {
  try {
    await authorizeRole('SECRETARY');
    const validated = getClinicAppointmentsPageSchema.parse(params);
    const supabase = await createClient();
    const result = await getAppointmentsPageByClinicQuery(supabase)(validated);
    return { success: true as const, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
    }
    if (error instanceof DomainError) return { success: false as const, error: error.message };
    console.error('ACTION ERROR (getClinicAppointmentsPage):', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Could not load appointments.' };
  }
}
