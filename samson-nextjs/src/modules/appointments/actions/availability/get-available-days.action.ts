'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { DomainError } from '@/shared/errors';
import { getAvailableDaysSchema, GetAvailableDaysDto } from '../../dtos';
import {
  getWorkingSchedulesForMonthQuery,
  getDoctorSchedulesQuery,
  getExistingAppointmentsQuery,
  getServiceDurationQuery,
  resolveDoctorDisplayNameQuery,
  getExistingAppointmentsForMonthQuery,
} from '../../repositories';
import { getAvailableDaysUseCase, getAvailableTimeSlotsUseCase } from '../../use-cases';

/**
 * Retrieves the available calendar days for booking in a given month.
 */
export async function getAvailableDaysAction(formData: GetAvailableDaysDto) {
  try {
    const validData = getAvailableDaysSchema.parse(formData);
    const supabase = await createClient();
    
    const getAvailableTimeSlots = getAvailableTimeSlotsUseCase({
      getServiceDuration: getServiceDurationQuery(supabase),
      getDoctorSchedules: getDoctorSchedulesQuery(supabase),
      getExistingAppointments: getExistingAppointmentsQuery(supabase),
      resolveDoctorDisplayName: resolveDoctorDisplayNameQuery(supabase),
    });

    const useCase = getAvailableDaysUseCase({
      getWorkingSchedulesForMonth: getWorkingSchedulesForMonthQuery(supabase),
      getServiceDuration: getServiceDurationQuery(supabase),
      getExistingAppointmentsForMonth: getExistingAppointmentsForMonthQuery(supabase),
      getAvailableTimeSlots,
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
    console.error('ACTION ERROR (getAvailableDays):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
