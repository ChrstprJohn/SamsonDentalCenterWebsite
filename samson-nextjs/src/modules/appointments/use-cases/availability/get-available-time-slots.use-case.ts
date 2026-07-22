import { GetAvailableTimeSlotsDto, GetAvailableTimeSlotsResponseDto, AvailableSlotDto, DoctorScheduleResponseDto, AppointmentResponseDto } from '../../dtos/exports';
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
      deps.getDoctorSchedules(date, doctorId ?? undefined, serviceId),
      deps.getExistingAppointments(date, doctorId ?? undefined),
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
        schedules: [{
          ...schedule,
          startTime: schedule.startTime || '09:00',
          endTime: schedule.endTime || '17:00',
        }],
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
