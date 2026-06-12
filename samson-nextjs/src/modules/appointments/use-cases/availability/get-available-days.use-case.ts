import { GetAvailableDaysDto, GetAvailableDaysResponseDto } from '../../dtos';
import { generateAvailableSlotsForDay } from '../../utils/availability.utils';

/**
 * Functional use case to retrieve available calendar days for booking.
 * Calculates daily calendar cell eligibility in-memory by pre-fetching schedules/appointments.
 */
export const getAvailableDaysUseCase = (deps: {
  getWorkingSchedulesForMonth: (month: string, doctorId?: string, serviceId?: string) => Promise<any[]>;
  getServiceDuration: (serviceId: string) => Promise<number>;
  getExistingAppointmentsForMonth?: (month: string, doctorId?: string) => Promise<any[]>;
  getAvailableTimeSlots?: (dto: { serviceId: string; doctorId: string; date: string }) => Promise<any>;
}) => {
  return async (dto: GetAvailableDaysDto): Promise<GetAvailableDaysResponseDto> => {
    const { month, serviceId, doctorId } = dto;
    const duration = await deps.getServiceDuration(serviceId);
    const schedules = await deps.getWorkingSchedulesForMonth(month, doctorId, serviceId);

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

    let appointments: any[] = [];
    if (canUseInMemory && deps.getExistingAppointmentsForMonth) {
      appointments = await deps.getExistingAppointmentsForMonth(month, doctorId);
    }

    const availableDates: string[] = [];

    if (canUseInMemory) {
      const datesWithSchedules = Array.from(new Set(schedules.map((schedule) => schedule.date))).sort();

      for (const date of datesWithSchedules) {
        const daySchedules = schedules.filter((s) => s.date === date);

        // Map schedules to match utility input shape
        const mappedSchedules = daySchedules.map((s) => ({
          staffId: s.staffId,
          startTime: s.startTime,
          endTime: s.endTime,
          breakStartTime: s.breakStartTime,
          breakEndTime: s.breakEndTime,
        }));

        const slots = generateAvailableSlotsForDay({
          date,
          duration,
          schedules: mappedSchedules,
          appointments,
        });

        if (slots.length > 0) {
          availableDates.push(date);
        }
      }
    } else {
      // Fallback behavior: sequential checking using daily availability calls
      const datesWithSchedules = Array.from(new Set(schedules.map((schedule) => schedule.date))).sort();
      for (const date of datesWithSchedules) {
        if (deps.getAvailableTimeSlots) {
          const slotsResponse = await deps.getAvailableTimeSlots({
            serviceId,
            doctorId,
            date,
          });

          if (slotsResponse.availableSlots.length > 0) {
            availableDates.push(date);
          }
        }
      }
    }

    return {
      month,
      serviceId,
      availableDates,
    };
  };
};
