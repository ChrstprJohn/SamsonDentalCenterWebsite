import { AppointmentAvailabilityQueries } from '../../repositories';
import {
  GetAvailableTimeSlotsDto,
  GetAvailableTimeSlotsResponseDto,
  GetAvailableDaysDto,
  GetAvailableDaysResponseDto,
} from '../../dtos';
import { getAvailableDaysUseCase } from './get-available-days.use-case';
import { getAvailableTimeSlotsUseCase } from './get-available-time-slots.use-case';

/**
 * Backward compatibility wrapper grouping the split availability use cases.
 */
export const getAvailabilityUseCase = (deps: {
  getWorkingSchedulesForMonth: (month: string, doctorId?: string, serviceId?: string) => Promise<any[]>;
  getDoctorSchedules: (date: string, doctorId?: string, serviceId?: string) => Promise<any[]>;
  getExistingAppointments: (date: string, doctorId?: string) => Promise<any[]>;
  getServiceDuration: (serviceId: string) => Promise<number>;
  resolveDoctorDisplayName: (doctorId: string) => Promise<string>;
  getExistingAppointmentsForMonth?: (month: string, doctorId?: string) => Promise<any[]>;
}) => {
  const getAvailableTimeSlots = getAvailableTimeSlotsUseCase(deps);
  
  const getAvailableDays = getAvailableDaysUseCase({
    ...deps,
    getAvailableTimeSlots,
  });

  return {
    getAvailableDays,
    getAvailableTimeSlots,
  };
};

/** @deprecated Use getAvailableDaysUseCase or getAvailableTimeSlotsUseCase functional pipelines directly instead */
export class GetAvailabilityUseCase {
  constructor(private readonly availabilityQueries: AppointmentAvailabilityQueries) {}

  async getAvailableDays(dto: GetAvailableDaysDto): Promise<GetAvailableDaysResponseDto> {
    return getAvailabilityUseCase({
      getWorkingSchedulesForMonth: (m, d, s) => this.availabilityQueries.getWorkingSchedulesForMonth(m, d, s),
      getDoctorSchedules: (dt, d, s) => this.availabilityQueries.getDoctorSchedules(dt, d, s),
      getExistingAppointments: (dt, d) => this.availabilityQueries.getExistingAppointments(dt, d),
      getServiceDuration: (s) => this.availabilityQueries.getServiceDuration(s),
      resolveDoctorDisplayName: (d) => this.availabilityQueries.resolveDoctorDisplayName(d),
      getExistingAppointmentsForMonth: this.availabilityQueries.getExistingAppointmentsForMonth
        ? (m, d) => this.availabilityQueries.getExistingAppointmentsForMonth(m, d)
        : undefined,
    }).getAvailableDays(dto);
  }

  async getAvailableTimeSlots(dto: GetAvailableTimeSlotsDto): Promise<GetAvailableTimeSlotsResponseDto> {
    return getAvailabilityUseCase({
      getWorkingSchedulesForMonth: (m, d, s) => this.availabilityQueries.getWorkingSchedulesForMonth(m, d, s),
      getDoctorSchedules: (dt, d, s) => this.availabilityQueries.getDoctorSchedules(dt, d, s),
      getExistingAppointments: (dt, d) => this.availabilityQueries.getExistingAppointments(dt, d),
      getServiceDuration: (s) => this.availabilityQueries.getServiceDuration(s),
      resolveDoctorDisplayName: (d) => this.availabilityQueries.resolveDoctorDisplayName(d),
      getExistingAppointmentsForMonth: this.availabilityQueries.getExistingAppointmentsForMonth
        ? (m, d) => this.availabilityQueries.getExistingAppointmentsForMonth(m, d)
        : undefined,
    }).getAvailableTimeSlots(dto);
  }
}
