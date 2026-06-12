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
  getServiceDuration: (serviceId: string) => Promise<number>;
  getDoctorSchedules: (date: string, doctorId?: string, serviceId?: string) => Promise<DoctorScheduleResponseDto[]>;
  getExistingAppointments: (date: string, doctorId?: string) => Promise<AppointmentResponseDto[]>;
  resolveDoctorDisplayName: (doctorId: string) => Promise<string>;
}) => {
  return async (dto: GetAvailableTimeSlotsDto): Promise<GetAvailableTimeSlotsResponseDto> => {
    const { serviceId, doctorId, date } = dto;

    // Execute initial asynchronous fetches concurrently in parallel
    const [duration, schedules, appointments] = await Promise.all([
      deps.getServiceDuration(serviceId),
      deps.getDoctorSchedules(date, doctorId, serviceId),
      deps.getExistingAppointments(date, doctorId),
    ]);

    const availableSlots: AvailableSlotDto[] = [];

    // Resolve doctor display names concurrently in parallel to prevent sequential DB queries inside the loop
    const docIds = Array.from(new Set(schedules.map((s) => s.doctorId).filter(Boolean)));
    const resolvedDoctors = await Promise.all(
      docIds.map(async (id) => {
        const name = await deps.resolveDoctorDisplayName(id);
        return { id, name: name.trim() };
      })
    );
    const doctorNameMap = new Map(resolvedDoctors.map((d) => [d.id, d.name]));

    for (const schedule of schedules) {
      const docId = schedule.doctorId;
      if (!docId) continue;

      const doctorName = doctorNameMap.get(docId) || 'Doctor';

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
