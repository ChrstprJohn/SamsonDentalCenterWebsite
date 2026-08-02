'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getAppointmentByIdQuery } from '../../repositories/exports';

const getStaffAppointmentByIdSchema = z.object({
  appointmentId: z.string().uuid(),
});

/**
 * Retrieves a full appointment record by ID for staff/secretary.
 * Includes doctor, service, patient, dependent, guest contacts, and status history.
 */
export async function getStaffAppointmentByIdAction(appointmentId: string) {
  try {
    await authorizeRole('SECRETARY');
    const { appointmentId: parsedId } = getStaffAppointmentByIdSchema.parse({ appointmentId });
    const supabase = await createClient();

    const getAppointmentById = getAppointmentByIdQuery(supabase);
    const appointment = await getAppointmentById(parsedId);

    return { success: true, data: appointment };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getStaffAppointmentById):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
