import { SupabaseClient } from '@supabase/supabase-js';
import { AppointmentAvailabilityQueries } from '../repositories/appointment-availability.queries';
import {
  GetAvailableTimeSlotsDto,
  GetAvailableTimeSlotsResponseDto,
  AvailableSlotDto,
  GetAvailableDaysDto,
  GetAvailableDaysResponseDto,
} from '../dtos/get-availability.dto';
import { DomainError } from '@/shared/errors';

export class GetAvailabilityUseCase {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly availabilityQueries: AppointmentAvailabilityQueries
  ) {}

  /**
   * Calculates monthly days that have at least one doctor scheduled and one available booking slot.
   */
  async getAvailableDays(dto: GetAvailableDaysDto): Promise<GetAvailableDaysResponseDto> {
    const { month, serviceId, doctorId } = dto;
    const yearMonth = month; // Format: YYYY-MM

    let query = this.supabase
      .from('staff_schedules')
      .select('*')
      .eq('is_working', true)
      .like('date', `${yearMonth}-%`);

    if (doctorId) {
      query = query.eq('staff_id', doctorId);
    }

    const { data: schedules, error } = await query;
    if (error) {
      throw new DomainError(`Failed to fetch schedules: ${error.message}`, 'DATABASE_ERROR');
    }

    if (!schedules || schedules.length === 0) {
      return { month, serviceId, availableDates: [] };
    }

    // Get unique dates that have working schedules
    const datesWithSchedules = Array.from(new Set(schedules.map((s) => s.date))).sort();
    const availableDates: string[] = [];

    // For each date, check if there are available time slots
    for (const date of datesWithSchedules) {
      const slotsResponse = await this.getAvailableTimeSlots({
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
  }

  /**
   * Calculates and returns available sliced time slots for a given date, service, and doctor.
   */
  async getAvailableTimeSlots(
    dto: GetAvailableTimeSlotsDto
  ): Promise<GetAvailableTimeSlotsResponseDto> {
    const { serviceId, doctorId, date } = dto;

    // 1. Fetch service duration
    const { data: service, error: serviceError } = await this.supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      throw new DomainError(
        `Service not found: ${serviceError?.message || 'Unknown error'}`,
        'NOT_FOUND'
      );
    }

    const duration = service.duration_minutes;

    // 2. Fetch doctor schedules
    const schedules = await this.availabilityQueries.getDoctorSchedules(date, doctorId);

    // 3. Fetch existing appointments
    const appointments = await this.availabilityQueries.getExistingAppointments(date, doctorId);

    const availableSlots: AvailableSlotDto[] = [];

    // 4. Slice slots for each scheduled doctor
    for (const schedule of schedules) {
      const docId = schedule.staff_id || schedule.doctor_id || doctorId;
      if (!docId) continue;

      // Determine doctor name
      let doctorName = 'Doctor';
      if (schedule.doctor_name) {
        doctorName = schedule.doctor_name;
      } else if (schedule.first_name || schedule.last_name) {
        const parts = [];
        if (schedule.prefix) parts.push(schedule.prefix);
        if (schedule.first_name) parts.push(schedule.first_name);
        if (schedule.last_name) parts.push(schedule.last_name);
        if (schedule.suffix) parts.push(schedule.suffix);
        doctorName = parts.join(' ');
      } else {
        // Fallback: Query doctor details from users table
        const { data: user } = await this.supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', docId)
          .single();

        if (user) {
          doctorName = `Dr. ${user.first_name} ${user.last_name}`;
        } else {
          // Check doctors table
          const { data: doctor } = await this.supabase
            .from('doctors')
            .select('first_name, last_name')
            .eq('id', docId)
            .single();

          if (doctor) {
            doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
          }
        }
      }

      // Convert start and end times to Date objects
      const schedStartStr = schedule.start_time.includes(':')
        ? schedule.start_time
        : `${schedule.start_time}:00`;
      const schedEndStr = schedule.end_time.includes(':')
        ? schedule.end_time
        : `${schedule.end_time}:00`;

      const dayStart = new Date(
        `${date}T${schedStartStr.length === 5 ? schedStartStr + ':00' : schedStartStr}Z`
      );
      const dayEnd = new Date(
        `${date}T${schedEndStr.length === 5 ? schedEndStr + ':00' : schedEndStr}Z`
      );

      // Handle breaks
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
          `${date}T${bStartStr.length === 5 ? bStartStr + ':00' : bStartStr}Z`
        );
        breakEnd = new Date(
          `${date}T${bEndStr.length === 5 ? bEndStr + ':00' : bEndStr}Z`
        );
      }

      // Slice the day into slots
      let currentStart = new Date(dayStart.getTime());
      while (currentStart.getTime() + duration * 60 * 1000 <= dayEnd.getTime()) {
        const currentEnd = new Date(currentStart.getTime() + duration * 60 * 1000);

        // Check if slot falls within break time
        const fallsInBreak =
          breakStart &&
          breakEnd &&
          currentStart.getTime() < breakEnd.getTime() &&
          currentEnd.getTime() > breakStart.getTime();

        if (!fallsInBreak) {
          // Check if slot overlaps with any existing appointments for THIS doctor
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

        // Advance to next slot
        currentStart = new Date(currentStart.getTime() + duration * 60 * 1000);
      }
    }

    return {
      date,
      serviceId,
      availableSlots,
    };
  }
}
