'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { DomainError } from '@/shared/errors';
import { getAvailableDaysSchema, GetAvailableDaysDto } from '../../dtos/exports';
import { getWorkingSchedulesForMonthQuery, getDoctorSchedulesQuery, getExistingAppointmentsQuery, getServiceDurationQuery, getExistingAppointmentsForMonthQuery } from '../../repositories/exports';
import { getAvailableDaysUseCase, getAvailableTimeSlotsUseCase } from '../../use-cases/exports';
import { getActiveDoctorsQuery } from '@/modules/staff/repositories/exports';
import { getDoctorsUseCase } from '@/modules/staff/use-cases/exports';

/**
 * Consolidates step two availability and doctor preference data in a single flight.
 */
export async function getStepTwoDataAction(formData: GetAvailableDaysDto) {
  try {
    const validData = getAvailableDaysSchema.parse(formData);
    const supabase = await createClient();

    // Initialize Use Cases
    const getDoctors = getDoctorsUseCase(getActiveDoctorsQuery(supabase));
    const duration = getServiceDurationQuery(supabase)(validData.serviceId);

    const getAvailableTimeSlots = getAvailableTimeSlotsUseCase({
      duration,
      getDoctorSchedules: getDoctorSchedulesQuery(supabase),
      getExistingAppointments: getExistingAppointmentsQuery(supabase),
    });

    const getAvailableDays = getAvailableDaysUseCase({
      getWorkingSchedulesForMonth: getWorkingSchedulesForMonthQuery(supabase),
      duration,
      getExistingAppointmentsForMonth: getExistingAppointmentsForMonthQuery(supabase),
      getAvailableTimeSlots,
    });

    // Execute concurrently in parallel
    const [doctors, availability] = await Promise.all([
      getDoctors(validData.serviceId),
      getAvailableDays(validData),
    ]);

    return {
      success: true,
      data: {
        doctors,
        availability,
      },
    };
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
    console.error('ACTION ERROR (getStepTwoData):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
