'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
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
    const user = await authorizeRole('SECRETARY');

    // 2. Parse & validate input
    const validData = staffUpdateAppointmentStatusSchema.parse(formData);
    const supabase = await createClient();

    // 3. DI setup — single ACID transaction command replaces 3 separate calls
    const useCase = updateAppointmentStatusUseCase({
      getAppointmentById: getAppointmentByIdQuery(supabase),
      updateAppointmentStatusTransaction: updateAppointmentStatusTransactionCommand(supabase),
    });

    // The appointment status trigger creates cancellation/reschedule/rejection
    // notifications. Persist the selected channel first so the trigger sees
    // the channel chosen for this status transition (including NONE).
    if (validData.confirmationChannel) {
      const { createAdminClient } = await import('@/shared/database/server');
      const adminDb = await createAdminClient();
      const { error: channelError } = await adminDb
        .from('appointments')
        .update({ confirmation_channel: validData.confirmationChannel })
        .eq('id', validData.appointmentId);
      if (channelError) {
        throw new Error(`Failed to update confirmation channel: ${channelError.message}`);
      }
    }

    let rescheduleMetadata: { date: string; startTime: string; endTime: string; doctorId: string; serviceId?: string } | undefined = undefined;

    if (validData.newDate && validData.newStartTime && validData.newEndTime && validData.newDoctorId) {
      rescheduleMetadata = {
        date: validData.newDate,
        startTime: validData.newStartTime,
        endTime: validData.newEndTime,
        doctorId: validData.newDoctorId,
        serviceId: validData.newServiceId,
      };
    } else if (validData.newDate || validData.newStartTime || validData.newEndTime || validData.newDoctorId) {
      const getAppt = getAppointmentByIdQuery(supabase);
      const existingAppt = await getAppt(validData.appointmentId);
      if (existingAppt) {
        const date = validData.newDate || existingAppt.date;
        const doctorId = validData.newDoctorId || existingAppt.doctorId;
        const serviceId = validData.newServiceId || existingAppt.serviceId;
        const startTime = validData.newStartTime || (existingAppt.startTime ? `${date}T${existingAppt.startTime}` : undefined);
        const endTime = validData.newEndTime || (existingAppt.endTime ? `${date}T${existingAppt.endTime}` : undefined);

        if (date && startTime && endTime && doctorId) {
          rescheduleMetadata = { date, startTime, endTime, doctorId, serviceId };
        }
      }
    }

    // 4. Execute
    const result = await useCase(
      validData.appointmentId,
      user.id,
      'STAFF',
      validData.status,
      validData.statusReason || undefined,
      rescheduleMetadata
    );

    // CANCEL_BOOKING, RESCHEDULE_BOOKING, and REJECT_INQUIRY
    // → All emitted automatically by Postgres DB trigger trigger_on_appointment_status_change_outbox().
    //
    // APPOINTMENT_COMPLETED_POST_CARE (email + SMS) → emitted here upon completion.
    if (validData.status === 'COMPLETED') {
      try {
        const { outboxCommands } = await import('@/shared/outbox/outbox.commands');
        const { createAdminClient } = await import('@/shared/database/server');
        const adminDb = await createAdminClient();

        const appointment = await adminDb
          .from('appointments')
          .select('patient_id, guest_contacts(email, phone_number), confirmation_channel')
          .eq('id', validData.appointmentId)
          .single();

        const aptData = appointment.data as any;
        const patientId = aptData?.patient_id || null;
        const guestEmail = aptData?.guest_contacts?.[0]?.email || null;
        const guestPhone = aptData?.guest_contacts?.[0]?.phone_number || null;

        const completionChannel = aptData?.confirmation_channel || 'EMAIL';
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
        console.warn('Failed to emit post-care outbox events:', err);
      }
    }

    const { scheduleAppointmentOutboxDispatch } = await import('@/shared/outbox/dispatch-appointment-outbox');
    await scheduleAppointmentOutboxDispatch(validData.appointmentId);

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
