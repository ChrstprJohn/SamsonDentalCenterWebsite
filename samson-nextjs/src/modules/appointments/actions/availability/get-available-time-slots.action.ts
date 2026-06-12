'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { DomainError } from '@/shared/errors';
import { getAvailableTimeSlotsSchema, GetAvailableTimeSlotsDto } from '../../dtos';
import {
  getDoctorSchedulesQuery,
  getExistingAppointmentsQuery,
  getServiceDurationQuery,
} from '../../repositories';
import { getAvailableTimeSlotsUseCase } from '../../use-cases';

/**
 * Retrieves the available time slots for booking on a specific date.
 */
export async function getAvailableTimeSlotsAction(formData: GetAvailableTimeSlotsDto) {
  try {
    const validData = getAvailableTimeSlotsSchema.parse(formData);
    const supabase = await createClient();
    const duration = getServiceDurationQuery(supabase)(validData.serviceId);
    
    const useCase = getAvailableTimeSlotsUseCase({
      duration,
      getDoctorSchedules: getDoctorSchedulesQuery(supabase),
      getExistingAppointments: getExistingAppointmentsQuery(supabase),
    });

    const result = await useCase(validData);
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
