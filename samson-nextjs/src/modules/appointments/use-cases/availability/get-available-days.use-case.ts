import {
  GetAvailableDaysDto,
  GetAvailableDaysResponseDto,
  AppointmentResponseDto,
  GetAvailableTimeSlotsResponseDto,
  WorkingScheduleMonthItem,
} from '../../dtos';
import { generateAvailableSlotsForDay } from '../../utils/availability.utils';

/**
 * Functional use case to retrieve available calendar days for booking.
 * Calculates daily calendar cell eligibility in-memory by pre-fetching schedules/appointments.
 */
export const getAvailableDaysUseCase = (deps: {
  getWorkingSchedulesForMonth: (
    month: string,
    doctorId?: string,
    serviceId?: string
  ) => Promise<WorkingScheduleMonthItem[]>;
  getServiceDuration: (serviceId: string) => Promise<number>;
  getExistingAppointmentsForMonth?: (
    month: string,
    doctorId?: string
  ) => Promise<AppointmentResponseDto[]>;
  getAvailableTimeSlots?: (dto: {
    serviceId: string;
    doctorId?: string;
    date: string;
  }) => Promise<GetAvailableTimeSlotsResponseDto>;
}) => {
  return async (dto: GetAvailableDaysDto): Promise<GetAvailableDaysResponseDto> => {
    const { month, serviceId, doctorId } = dto;

    // Eliminate async waterfall by running initial fetches concurrently in parallel
    const [duration, schedules] = await Promise.all([
      deps.getServiceDuration(serviceId),
      deps.getWorkingSchedulesForMonth(month, doctorId, serviceId),
    ]);

    if (!schedules || schedules.length === 0) {
      return { month, serviceId, availableDates: [] };
    }

    // Determine if we can do in-memory calculations (requires the monthly helper and complete schedules)
    const useInMemoryAppointments = typeof deps.getExistingAppointmentsForMonth === 'function';
    const canUseInMemory =
      useInMemoryAppointments &&
      schedules.every(
        (s) => s.startTime !== undefined && s.endTime !== undefined
      );

    let appointments: AppointmentResponseDto[] = [];
    if (canUseInMemory && deps.getExistingAppointmentsForMonth) {
      appointments = await deps.getExistingAppointmentsForMonth(month, doctorId);
    }

    const availableDates: string[] = [];

    if (canUseInMemory) {
      const datesWithSchedules = Array.from(new Set(schedules.map((schedule) => schedule.date))).sort();

      for (const date of datesWithSchedules) {
        const daySchedules = schedules.filter((s) => s.date === date);

        // Pre-filter appointments down to the specific date to optimize performance
        const dayAppointments = appointments.filter((appt) => appt.date === date);

        const slots = generateAvailableSlotsForDay({
          date,
          duration,
          schedules: daySchedules,
          appointments: dayAppointments,
        });

        if (slots.length > 0) {
          availableDates.push(date);
        }
      }
    } else {
      // Fallback behavior: parallel checking using daily availability calls to avoid async waterfall
      const datesWithSchedules = Array.from(new Set(schedules.map((schedule) => schedule.date))).sort();
      if (deps.getAvailableTimeSlots) {
        const checkAvailabilityPromises = datesWithSchedules.map(async (date) => {
          const slotsResponse = await deps.getAvailableTimeSlots!({
            serviceId,
            doctorId,
            date,
          });
          return slotsResponse.availableSlots.length > 0 ? date : null;
        });

        const results = await Promise.all(checkAvailabilityPromises);
        availableDates.push(...results.filter((date): date is string => date !== null));
      }
    }

    return {
      month,
      serviceId,
      availableDates,
    };
  };
};
