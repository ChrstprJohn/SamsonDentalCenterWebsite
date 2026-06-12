import {
  GetAvailableTimeSlotsDto,
  GetAvailableTimeSlotsResponseDto,
  AvailableSlotDto,
  DoctorScheduleResponseDto,
  AppointmentResponseDto,
} from '../../dtos';
import { generateAvailableSlotsForDay } from '../../utils/availability.utils';

/**
 * Functional use case to retrieve available booking timeslots for a single date.
 */
export const getAvailableTimeSlotsUseCase = (deps: {
  duration: number | Promise<number>;
  getDoctorSchedules: (date: string, doctorId?: string, serviceId?: string) => Promise<DoctorScheduleResponseDto[]>;
  getExistingAppointments: (date: string, doctorId?: string) => Promise<AppointmentResponseDto[]>;
}) => {
  return async (dto: GetAvailableTimeSlotsDto): Promise<GetAvailableTimeSlotsResponseDto> => {
    const { serviceId, doctorId, date } = dto;

    // Execute initial asynchronous fetches concurrently in parallel
    const [duration, schedules, appointments] = await Promise.all([
      deps.duration,
      deps.getDoctorSchedules(date, doctorId, serviceId),
      deps.getExistingAppointments(date, doctorId),
    ]);

    const availableSlots: AvailableSlotDto[] = [];

    for (const schedule of schedules) {
      const docId = schedule.doctorId;
      if (!docId) continue;

      const doctorName = schedule.doctorName || 'Doctor';

      // Generate slots for this schedule
      const rawSlots = generateAvailableSlotsForDay({
        date,
        duration,
        schedules: [schedule],
        appointments,
      });

      for (const slot of rawSlots) {
        availableSlots.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
          doctorId: slot.doctorId,
          doctorName,
        });
      }
    }

    return {
      date,
      serviceId,
      availableSlots,
    };
  };
};
