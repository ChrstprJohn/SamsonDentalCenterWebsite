'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { staffUpdateAppointmentStatusSchema, StaffUpdateAppointmentStatusDto } from '../../dtos/exports';
import { getAppointmentByIdQuery, updateAppointmentStatusTransactionCommand } from '../../repositories/exports';
import { updateAppointmentStatusUseCase } from '../../use-cases/exports';

/**
 * Updates an appointment status on behalf of a clinic staff member.
 * Restricts access to SECRETARY and ADMIN roles.
 * All DB side-effects (status update, ledger, credibility metric) run in one ACID transaction.
 */
export async function updateAppointmentStatusAction(formData: StaffUpdateAppointmentStatusDto) {
  try {
    // 1. Assert SECRETARY or above role
    await authorizeRole('SECRETARY');
    const user = await getAuthenticatedUser();

    // 2. Parse & validate input
    const validData = staffUpdateAppointmentStatusSchema.parse(formData);
    const supabase = await createClient();

    // 3. DI setup — single ACID transaction command replaces 3 separate calls
    const useCase = updateAppointmentStatusUseCase({
      getAppointmentById: getAppointmentByIdQuery(supabase),
      updateAppointmentStatusTransaction: updateAppointmentStatusTransactionCommand(supabase),
    });

    const rescheduleMetadata =
      validData.newDate && validData.newStartTime && validData.newEndTime && validData.newDoctorId
        ? {
            date: validData.newDate,
            startTime: validData.newStartTime,
            endTime: validData.newEndTime,
            doctorId: validData.newDoctorId,
            serviceId: validData.newServiceId,
          }
        : undefined;

    // 4. Execute
    const result = await useCase(
      validData.appointmentId,
      user.id,
      'STAFF',
      validData.status,
      validData.statusReason || undefined,
      rescheduleMetadata
    );

    // Emit outbox event if appointment is completed
    if (validData.status === 'COMPLETED') {
      try {
        const { outboxCommands } = await import('@/shared/outbox/outbox.commands');
        const { createAdminClient } = await import('@/shared/database/server');
        const adminDb = await createAdminClient();
        await outboxCommands(adminDb).emitEvent('APPOINTMENT_COMPLETED_POST_CARE', {
          appointmentId: validData.appointmentId,
        });
      } catch (err) {
        console.warn('Failed to emit APPOINTMENT_COMPLETED_POST_CARE event:', err);
      }
    }

    // Non-blocking outbox processing for side effects (e.g. reschedule email, post-care review email)
    try {
      const { after } = await import('next/server');
      after(async () => {
        const { bootstrapEventSubscribers } = await import('@/orchestrators/event-subscribers');
        const { globalOutboxDispatcher } = await import('@/shared/outbox/outbox.dispatcher');
        const { createAdminClient } = await import('@/shared/database/server');
        bootstrapEventSubscribers();
        await globalOutboxDispatcher(await createAdminClient())();
      });
    } catch {
      // In test environments or outside Next.js request scope, run directly
      try {
        const { bootstrapEventSubscribers } = await import('@/orchestrators/event-subscribers');
        const { globalOutboxDispatcher } = await import('@/shared/outbox/outbox.dispatcher');
        const { createAdminClient } = await import('@/shared/database/server');
        bootstrapEventSubscribers();
        await globalOutboxDispatcher(await createAdminClient())();
      } catch (err) {
        console.warn('Could not run outbox dispatcher in background:', err);
      }
    }

    return { success: true, data: result };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      if (error.message.includes('no_overlapping_appointments') || error.message.includes('23P01')) {
        return {
          success: false,
          error: 'The selected dentist already has a confirmed appointment at this date and time. Please choose another time slot or dentist.',
        };
      }
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (updateAppointmentStatus):', error);
    return { success: false, error: error.message || 'An unexpected system error occurred' };
  }
}
