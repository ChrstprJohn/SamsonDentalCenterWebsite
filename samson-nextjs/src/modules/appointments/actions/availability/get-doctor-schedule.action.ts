'use server';

import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getExistingAppointmentsQuery } from '../../repositories/exports';

export async function getDoctorScheduleAction(doctorId: string, date: string) {
  try {
    // 1. Auth Validation (SECRETARY or above role)
    await authorizeRole('SECRETARY');

    const supabase = await createClient();

    // 2. Fetch existing appointments for doctor on specific date
    const appointments = await getExistingAppointmentsQuery(supabase)(date, doctorId);

    return {
      success: true,
      data: appointments,
    };
  } catch (error) {
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getDoctorSchedule):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
