import {
  GetAvailableTimeSlotsDto,
  GetAvailableTimeSlotsResponseDto,
  AvailableSlotDto,
} from '../../dtos';
import { generateAvailableSlotsForDay } from '../../utils/availability.utils';

/**
 * Functional use case to retrieve available booking timeslots for a single date.
 */
export const getAvailableTimeSlotsUseCase = (deps: {
  getServiceDuration: (serviceId: string) => Promise<number>;
  getDoctorSchedules: (date: string, doctorId?: string, serviceId?: string) => Promise<any[]>;
  getExistingAppointments: (date: string, doctorId?: string) => Promise<any[]>;
  resolveDoctorDisplayName: (doctorId: string) => Promise<string>;
}) => {
  return async (dto: GetAvailableTimeSlotsDto): Promise<GetAvailableTimeSlotsResponseDto> => {
    const { serviceId, doctorId, date } = dto;

    const duration = await deps.getServiceDuration(serviceId);
    const schedules = await deps.getDoctorSchedules(date, doctorId, serviceId);
    const appointments = await deps.getExistingAppointments(date, doctorId);

    const availableSlots: AvailableSlotDto[] = [];

    for (const schedule of schedules) {
      const docId = schedule.doctorId;
      if (!docId) continue;

      // Resolve the display name once per schedule (doctor) rather than per slot
      const doctorName = await deps.resolveDoctorDisplayName(docId);

      // Map single schedule to utility input shape
      const mappedSchedules = [{
        staffId: schedule.doctorId,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        breakStartTime: schedule.breakStartTime,
        breakEndTime: schedule.breakEndTime,
      }];

      // Generate slots for this schedule
      const rawSlots = generateAvailableSlotsForDay({
        date,
        duration,
        schedules: mappedSchedules,
        appointments,
      });

      for (const slot of rawSlots) {
        availableSlots.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
          doctorId: slot.doctorId,
          doctorName: doctorName.trim(),
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
