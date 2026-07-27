'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole, getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { resolveNoShowSchema, ResolveNoShowDto } from '../../dtos/status/resolve-no-show.dto';
import { getAppointmentByIdQuery, updateAppointmentStatusTransactionCommand } from '../../repositories/exports';
import { resolveNoShowUseCase } from '../../use-cases/status/resolve-no-show.use-case';

export async function resolveNoShowAction(formData: ResolveNoShowDto) {
  try {
    await authorizeRole('SECRETARY');
    const user = await getAuthenticatedUser();

    const validData = resolveNoShowSchema.parse(formData);
    const supabase = await createClient();

    const useCase = resolveNoShowUseCase({
      getAppointmentById: getAppointmentByIdQuery(supabase),
      updateAppointmentStatusTransaction: updateAppointmentStatusTransactionCommand(supabase),
    });

    const rescheduleMetadata = validData.newDate && validData.newStartTime && validData.newEndTime && validData.newDoctorId
      ? {
          date: validData.newDate,
          startTime: validData.newStartTime,
          endTime: validData.newEndTime,
          doctorId: validData.newDoctorId,
        }
      : undefined;

    const result = await useCase(
      validData.appointmentId,
      user.id,
      'STAFF',
      validData.resolution,
      validData.reason,
      rescheduleMetadata
    );

    if (validData.resolution === 'COMPLETED') {
      try {
        const { outboxCommands } = await import('@/shared/outbox/outbox.commands');
        const { createAdminClient } = await import('@/shared/database/server');
        const adminDb = await createAdminClient();
        const { data: appointment } = await adminDb
          .from('appointments')
          .select('patient_id, guest_contacts(email, phone_number)')
          .eq('id', validData.appointmentId)
          .single();
        const aptData = appointment as any;
        const patientId = aptData?.patient_id || null;
        const guestEmail = aptData?.guest_contacts?.[0]?.email || null;
        const guestPhone = aptData?.guest_contacts?.[0]?.phone_number || null;
        await outboxCommands(adminDb).emitEvent('APPOINTMENT_COMPLETED_POST_CARE', {
          appointmentId: validData.appointmentId,
          patientId,
          email: guestEmail,
        });
        await outboxCommands(adminDb).emitEvent('APPOINTMENT_COMPLETED_POST_CARE_SMS', {
          appointmentId: validData.appointmentId,
          patientId,
          phoneNumber: guestPhone,
        });
      } catch (err) {
        console.warn('Failed to emit post-care resolution events:', err);
      }
    }

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (resolveNoShowAction):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
