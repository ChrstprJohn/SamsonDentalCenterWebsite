'use server';

import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError, NotFoundError } from '@/shared/errors';
import { getPatientProfileForStaffQuery } from '../../repositories/exports';
import { getAppointmentsByUserQuery } from '@/modules/appointments/repositories/exports';

export async function getPatientDetailsForStaffAction(patientId: string, dependentId?: string) {
  try {
    // 1. Auth Validation (SECRETARY or above role)
    await authorizeRole('SECRETARY');

    const supabase = await createClient();

    // 2. Fetch Profile & reliability fields from users table
    const profile = await getPatientProfileForStaffQuery(supabase)(patientId);

    // 3. Fetch appointments list to get history and completed count
    const appointments = await getAppointmentsByUserQuery(supabase)(patientId);

    // Filter to target patient (either dependent or account owner themselves)
    const targetAppointments = dependentId
      ? appointments.filter((a) => a.dependentId === dependentId)
      : appointments.filter((a) => !a.dependentId);

    const completedCount = targetAppointments.filter((a) => a.status === 'COMPLETED').length;
    const history = targetAppointments.slice(0, 5);

    return {
      success: true,
      data: {
        profile,
        reliability: {
          completedCount,
          cancelCount: profile.cancelCount,
          noShowCount: profile.noShowCount,
          rescheduleCount: profile.rescheduleCount,
        },
        history,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { success: false, error: error.message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getPatientDetailsForStaff):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
