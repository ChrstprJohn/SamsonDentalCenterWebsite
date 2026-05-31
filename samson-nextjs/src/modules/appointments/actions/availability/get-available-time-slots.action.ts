'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { DomainError } from '@/shared/errors';
import { getAvailableTimeSlotsSchema, GetAvailableTimeSlotsDto } from '../../dtos';
import {
  getWorkingSchedulesForMonthQuery,
  getDoctorSchedulesQuery,
  getExistingAppointmentsQuery,
  getServiceDurationQuery,
  resolveDoctorDisplayNameQuery,
} from '../../repositories';
import { getAvailabilityUseCase } from '../../use-cases';

/**
 * Retrieves the available time slots for booking on a specific date.
 */
export async function getAvailableTimeSlotsAction(formData: GetAvailableTimeSlotsDto) {
  try {
    const validData = getAvailableTimeSlotsSchema.parse(formData);
    const supabase = await createClient();
    
    const useCase = getAvailabilityUseCase({
      getWorkingSchedulesForMonth: getWorkingSchedulesForMonthQuery(supabase),
      getDoctorSchedules: getDoctorSchedulesQuery(supabase),
      getExistingAppointments: getExistingAppointmentsQuery(supabase),
      getServiceDuration: getServiceDurationQuery(supabase),
      resolveDoctorDisplayName: resolveDoctorDisplayNameQuery(supabase),
    });

    const result = await useCase.getAvailableTimeSlots(validData);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed: ' + error.issues[0].message,
      };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getAvailableTimeSlots):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
