import { AppointmentAvailabilityQueries } from '../../repositories';
import {
  GetAvailableTimeSlotsDto,
  GetAvailableTimeSlotsResponseDto,
  AvailableSlotDto,
  GetAvailableDaysDto,
  GetAvailableDaysResponseDto,
} from '../../dtos';

export const getAvailabilityUseCase = (deps: {
  getWorkingSchedulesForMonth: (month: string, doctorId?: string) => Promise<any[]>;
  getDoctorSchedules: (date: string, doctorId?: string) => Promise<any[]>;
  getExistingAppointments: (date: string, doctorId?: string) => Promise<any[]>;
  getServiceDuration: (serviceId: string) => Promise<number>;
  resolveDoctorDisplayName: (doctorId: string) => Promise<string>;
}) => {
  const getAvailableTimeSlots = async (
    dto: GetAvailableTimeSlotsDto
  ): Promise<GetAvailableTimeSlotsResponseDto> => {
    const { serviceId, doctorId, date } = dto;

    const duration = await deps.getServiceDuration(serviceId);
    const schedules = await deps.getDoctorSchedules(date, doctorId);
    const appointments = await deps.getExistingAppointments(date, doctorId);

    const availableSlots: AvailableSlotDto[] = [];

    for (const schedule of schedules) {
      const docId = schedule.staff_id || schedule.doctor_id || doctorId;
      if (!docId) continue;

      const doctorName = await deps.resolveDoctorDisplayName(docId);

      const schedStartStr = schedule.start_time.includes(':')
        ? schedule.start_time
        : `${schedule.start_time}:00`;
      const schedEndStr = schedule.end_time.includes(':')
        ? schedule.end_time
        : `${schedule.end_time}:00`;

      const dayStart = new Date(
        `${date}T${schedStartStr.length === 5 ? `${schedStartStr}:00` : schedStartStr}Z`
      );
      const dayEnd = new Date(
        `${date}T${schedEndStr.length === 5 ? `${schedEndStr}:00` : schedEndStr}Z`
      );

      let breakStart: Date | null = null;
      let breakEnd: Date | null = null;
      if (schedule.break_start_time && schedule.break_end_time) {
        const bStartStr = schedule.break_start_time.includes(':')
          ? schedule.break_start_time
          : `${schedule.break_start_time}:00`;
        const bEndStr = schedule.break_end_time.includes(':')
          ? schedule.break_end_time
          : `${schedule.break_end_time}:00`;
        breakStart = new Date(
          `${date}T${bStartStr.length === 5 ? `${bStartStr}:00` : bStartStr}Z`
        );
        breakEnd = new Date(
          `${date}T${bEndStr.length === 5 ? `${bEndStr}:00` : bEndStr}Z`
        );
      }

      let currentStart = new Date(dayStart.getTime());
      while (currentStart.getTime() + duration * 60 * 1000 <= dayEnd.getTime()) {
        const currentEnd = new Date(currentStart.getTime() + duration * 60 * 1000);

        const fallsInBreak =
          breakStart &&
          breakEnd &&
          currentStart.getTime() < breakEnd.getTime() &&
          currentEnd.getTime() > breakStart.getTime();

        if (!fallsInBreak) {
          const docAppointments = appointments.filter((appt) => appt.doctor_id === docId);
          const hasOverlap = docAppointments.some((appt) => {
            const apptStart = new Date(appt.start_time);
            const apptEnd = new Date(appt.end_time);
            return (
              currentStart.getTime() < apptEnd.getTime() &&
              currentEnd.getTime() > apptStart.getTime()
            );
          });

          if (!hasOverlap) {
            availableSlots.push({
              startTime: currentStart.toISOString(),
              endTime: currentEnd.toISOString(),
              doctorId: docId,
              doctorName: doctorName.trim(),
            });
          }
        }

        currentStart = new Date(currentStart.getTime() + duration * 60 * 1000);
      }
    }

    return {
      date,
      serviceId,
      availableSlots,
    };
  };

  const getAvailableDays = async (dto: GetAvailableDaysDto): Promise<GetAvailableDaysResponseDto> => {
    const { month, serviceId, doctorId } = dto;
    const schedules = await deps.getWorkingSchedulesForMonth(month, doctorId);

    if (!schedules || schedules.length === 0) {
      return { month, serviceId, availableDates: [] };
    }

    const datesWithSchedules = Array.from(new Set(schedules.map((schedule) => schedule.date))).sort();
    const availableDates: string[] = [];

    for (const date of datesWithSchedules) {
      const slotsResponse = await getAvailableTimeSlots({
        serviceId,
        doctorId,
        date,
      });

      if (slotsResponse.availableSlots.length > 0) {
        availableDates.push(date);
      }
    }

    return {
      month,
      serviceId,
      availableDates,
    };
  };

  return {
    getAvailableDays,
    getAvailableTimeSlots,
  };
};

export class GetAvailabilityUseCase {
  constructor(private readonly availabilityQueries: AppointmentAvailabilityQueries) {}

  async getAvailableDays(dto: GetAvailableDaysDto): Promise<GetAvailableDaysResponseDto> {
    return getAvailabilityUseCase({
      getWorkingSchedulesForMonth: (m, d) => this.availabilityQueries.getWorkingSchedulesForMonth(m, d),
      getDoctorSchedules: (dt, d) => this.availabilityQueries.getDoctorSchedules(dt, d),
      getExistingAppointments: (dt, d) => this.availabilityQueries.getExistingAppointments(dt, d),
      getServiceDuration: (s) => this.availabilityQueries.getServiceDuration(s),
      resolveDoctorDisplayName: (d) => this.availabilityQueries.resolveDoctorDisplayName(d),
    }).getAvailableDays(dto);
  }

  async getAvailableTimeSlots(dto: GetAvailableTimeSlotsDto): Promise<GetAvailableTimeSlotsResponseDto> {
    return getAvailabilityUseCase({
      getWorkingSchedulesForMonth: (m, d) => this.availabilityQueries.getWorkingSchedulesForMonth(m, d),
      getDoctorSchedules: (dt, d) => this.availabilityQueries.getDoctorSchedules(dt, d),
      getExistingAppointments: (dt, d) => this.availabilityQueries.getExistingAppointments(dt, d),
      getServiceDuration: (s) => this.availabilityQueries.getServiceDuration(s),
      resolveDoctorDisplayName: (d) => this.availabilityQueries.resolveDoctorDisplayName(d),
    }).getAvailableTimeSlots(dto);
  }
}
