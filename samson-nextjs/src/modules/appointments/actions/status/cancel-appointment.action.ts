'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { cancelAppointmentSchema, CancelAppointmentDto } from '../../dtos/status/cancel-appointment.dto';
import { getAppointmentByIdQuery, updateStatusCommand, incrementUserCredibilityMetricCommand, insertLedgerEntryCommand } from '../../repositories';
import { cancelAppointmentUseCase } from '../../use-cases/status/cancel-appointment.use-case';

/**
 * Cancels an appointment on behalf of the patient.
 * Verifies ownership of the appointment prior to execution.
 */
export async function cancelAppointmentAction(formData: CancelAppointmentDto) {
  try {
    const validData = cancelAppointmentSchema.parse(formData);
    if (validData.status !== 'CANCELLED') {
      return { success: false, error: 'Invalid action for cancellation endpoint' };
    }

    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const getAppointmentById = getAppointmentByIdQuery(supabase);
    const appointment = await getAppointmentById(validData.appointmentId);
    const appointmentOwner = appointment.patientId;
    if (appointmentOwner !== user.id) {
      return { success: false, error: 'You are not authorized to cancel this appointment' };
    }

    const useCase = cancelAppointmentUseCase({
      getAppointmentById,
      updateStatus: updateStatusCommand(supabase),
      incrementUserCredibilityMetric: incrementUserCredibilityMetricCommand(supabase),
      insertLedgerEntry: insertLedgerEntryCommand(supabase),
    });

    const result = await useCase(
      validData.appointmentId,
      user.id,
      'PATIENT',
      validData.statusReason
    );

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (cancelAppointment):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
