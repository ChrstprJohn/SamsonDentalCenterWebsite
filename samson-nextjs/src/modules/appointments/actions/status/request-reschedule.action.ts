'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { requestRescheduleSchema, RequestRescheduleDto } from '../../dtos/status/request-reschedule.dto';
import { getAppointmentByIdQuery, updateStatusCommand, incrementUserCredibilityMetricCommand, insertLedgerEntryCommand } from '../../repositories/exports';
import { requestRescheduleUseCase } from '../../use-cases/status/request-reschedule.use-case';

/**
 * Requests a reschedule for an appointment on behalf of the patient.
 * Verifies ownership of the appointment prior to execution.
 */
export async function requestRescheduleAction(formData: RequestRescheduleDto) {
  try {
    const validData = requestRescheduleSchema.parse(formData);
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

    const useCase = requestRescheduleUseCase({
      getAppointmentById,
      updateStatus: updateStatusCommand(supabase),
      incrementUserCredibilityMetric: incrementUserCredibilityMetricCommand(supabase),
      insertLedgerEntry: insertLedgerEntryCommand(supabase),
    });

    const result = await useCase(
      validData.appointmentId,
      user.id,
      'PATIENT',
      validData.statusReason,
      {
        date: validData.newDate,
        startTime: validData.newStartTime,
        endTime: validData.newEndTime,
        doctorId: validData.newDoctorId,
      }
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
