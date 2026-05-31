'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { userUpdateAppointmentStatusSchema, UserUpdateAppointmentStatusDto } from '../../dtos';
import { getAppointmentByIdQuery, updateStatusCommand, incrementUserCredibilityMetricCommand } from '../../repositories';
import { updateAppointmentStatusUseCase } from '../../use-cases';

/**
 * Requests a reschedule for an appointment on behalf of the patient.
 * Verifies ownership of the appointment prior to execution.
 */
export async function requestRescheduleAction(formData: UserUpdateAppointmentStatusDto) {
  try {
    const validData = userUpdateAppointmentStatusSchema.parse(formData);
    if (validData.status !== 'RESCHEDULE_REQUESTED') {
      return { success: false, error: 'Invalid action for reschedule request endpoint' };
    }

    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const getAppointmentById = getAppointmentByIdQuery(supabase);
    const appointment = await getAppointmentById(validData.appointmentId);
    const appointmentOwner = appointment.patientId;
    if (appointmentOwner !== user.id) {
      return { success: false, error: 'You are not authorized to reschedule this appointment' };
    }

    const useCase = updateAppointmentStatusUseCase({
      getAppointmentById,
      updateStatus: updateStatusCommand(supabase),
      incrementUserCredibilityMetric: incrementUserCredibilityMetricCommand(supabase),
    });

    const result = await useCase(
      validData.appointmentId,
      'RESCHEDULE_REQUESTED',
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
    console.error('ACTION ERROR (requestReschedule):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
