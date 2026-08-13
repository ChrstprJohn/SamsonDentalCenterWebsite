'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { resolveNoShowSchema, ResolveNoShowDto } from '../../dtos/status/resolve-no-show.dto';
import { getAppointmentByIdQuery, updateAppointmentStatusTransactionCommand } from '../../repositories/exports';
import { resolveNoShowUseCase } from '../../use-cases/status/resolve-no-show.use-case';

export async function resolveNoShowAction(formData: ResolveNoShowDto) {
  try {
    const user = await authorizeRole('SECRETARY');

    const validData = resolveNoShowSchema.parse(formData);
    const supabase = await createClient();

    const useCase = resolveNoShowUseCase({
      getAppointmentById: getAppointmentByIdQuery(supabase),
      updateAppointmentStatusTransaction: updateAppointmentStatusTransactionCommand(supabase),
    });

    let rescheduleMetadata: { date: string; startTime: string; endTime: string; doctorId: string } | undefined = undefined;

    if (validData.newDate && validData.newStartTime && validData.newEndTime && validData.newDoctorId) {
      rescheduleMetadata = {
        date: validData.newDate,
        startTime: validData.newStartTime,
        endTime: validData.newEndTime,
        doctorId: validData.newDoctorId,
      };
    } else if (validData.newDate || validData.newStartTime || validData.newEndTime || validData.newDoctorId) {
      const getAppt = getAppointmentByIdQuery(supabase);
      const existingAppt = await getAppt(validData.appointmentId);
      if (existingAppt) {
        const date = validData.newDate || existingAppt.date;
        const doctorId = validData.newDoctorId || existingAppt.doctorId;
        const startTime = validData.newStartTime || (existingAppt.startTime ? `${date}T${existingAppt.startTime}` : undefined);
        const endTime = validData.newEndTime || (existingAppt.endTime ? `${date}T${existingAppt.endTime}` : undefined);

        if (date && startTime && endTime && doctorId) {
          rescheduleMetadata = { date, startTime, endTime, doctorId };
        }
      }
    }

    const result = await useCase(
      validData.appointmentId,
      user.id,
      'STAFF',
      validData.resolution,
      validData.reason,
      rescheduleMetadata
    );

    // `NO_SHOW` is intentionally retained when the secretary confirms it.
    // Persist the decision separately so only no-shows that still need follow-up
    // appear in the Past Appointment Follow-ups queue.
    if (validData.resolution === 'CONFIRMED_NO_SHOW' || validData.resolution === 'CHECKED_IN') {
      const { error: resolutionError } = await supabase
        .from('appointments')
        .update({
          no_show_resolved_at: new Date().toISOString(),
          no_show_resolution: validData.resolution,
        })
        .eq('id', validData.appointmentId);

      if (resolutionError) {
        throw new DomainError(`Failed to record no-show resolution: ${resolutionError.message}`, 'DATABASE_ERROR');
      }
    }

    if (validData.resolution === 'CONFIRMED_NO_SHOW') {
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
        // Use the channel passed from the UI to avoid a race condition where
        // the channel may not yet have been persisted when this action runs.
        const noShowChannel = validData.confirmationChannel || 'EMAIL';
        if (noShowChannel === 'EMAIL' || noShowChannel === 'BOTH') {
          await outboxCommands(adminDb).emitEvent('APPOINTMENT_NO_SHOW', {
            appointmentId: validData.appointmentId,
            patientId,
            email: guestEmail,
          });
        }
        if (noShowChannel === 'SMS' || noShowChannel === 'BOTH') {
          await outboxCommands(adminDb).emitEvent('APPOINTMENT_NO_SHOW_SMS', {
            appointmentId: validData.appointmentId,
            patientId,
            phoneNumber: guestPhone,
          });
        }
      } catch (err) {
        console.warn('Failed to emit no-show notification events:', err);
      }
    }

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
        // Use the channel passed from the UI to avoid a race condition where
        // the channel may not yet have been persisted when this action runs.
        const completionChannel = validData.confirmationChannel || 'EMAIL';
        if (completionChannel === 'EMAIL' || completionChannel === 'BOTH') {
          await outboxCommands(adminDb).emitEvent('APPOINTMENT_COMPLETED_POST_CARE', {
            appointmentId: validData.appointmentId,
            patientId,
            email: guestEmail,
          });
        }
        if (completionChannel === 'SMS' || completionChannel === 'BOTH') {
          await outboxCommands(adminDb).emitEvent('APPOINTMENT_COMPLETED_POST_CARE_SMS', {
            appointmentId: validData.appointmentId,
            patientId,
            phoneNumber: guestPhone,
          });
        }
      } catch (err) {
        console.warn('Failed to emit post-care resolution events:', err);
      }
    }

    const { scheduleAppointmentOutboxDispatch } = await import('@/shared/outbox/dispatch-appointment-outbox');
    await scheduleAppointmentOutboxDispatch(validData.appointmentId);

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
