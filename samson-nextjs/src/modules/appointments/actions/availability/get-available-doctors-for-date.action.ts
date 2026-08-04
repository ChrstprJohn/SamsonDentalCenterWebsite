'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getAvailableDoctorsForDateSchema, GetAvailableDoctorsForDateDto } from '../../dtos/exports';
import { getDoctorSchedulesQuery } from '../../repositories/exports';

/**
 * Server Action for fetching available doctors for a given date and service.
 * Restricts access to SECRETARY or ADMIN roles.
 * Deduplicates and returns a distinct list of { doctorId, doctorName }.
 */
export async function getAvailableDoctorsForDateAction(formData: GetAvailableDoctorsForDateDto) {
  try {
    // 1. Zod input validation
    const parsed = getAvailableDoctorsForDateSchema.parse(formData);

    // 2. Auth boundary verification
    await authorizeRole('SECRETARY');

    // 3. DI Setup
    const supabase = await createClient();
    const fetchSchedules = getDoctorSchedulesQuery(supabase);

    // 4. Execution — secretary can see HIDDEN doctors for internal booking
    const schedules = await fetchSchedules(parsed.date, undefined, parsed.serviceId, true);

    // Deduplicate doctors
    const doctorsMap = new Map<string, string>();
    for (const s of schedules) {
      if (s.doctorId && s.doctorName) {
        doctorsMap.set(s.doctorId, s.doctorName);
      }
    }

    const data = Array.from(doctorsMap.entries()).map(([doctorId, doctorName]) => ({
      doctorId,
      doctorName,
    }));

    return { success: true, data };
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
    console.error('ACTION ERROR (getAvailableDoctorsForDateAction):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
