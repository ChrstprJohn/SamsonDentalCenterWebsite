import { SupabaseClient } from '@supabase/supabase-js';
import { DoctorScheduleDto, DayOfWeekMap } from '../../dtos';
import { DomainError } from '@/shared/errors';

export class StaffScheduleCommands {
    constructor(private readonly supabase: SupabaseClient) {}

    async upsertSchedule(data: DoctorScheduleDto) {
        // Upsert based on doctor_id and day_of_week
        const payload = {
            doctor_id: data.doctorId,
            day_of_week: DayOfWeekMap[data.dayOfWeek], // Map MONDAY to 1
            start_time: data.startTime,
            end_time: data.endTime,
            break_start_time: data.breakStartTime || null,
            break_end_time: data.breakEndTime || null,
        };

        const { data: schedule, error } = await this.supabase
            .from('doctor_schedules')
            .upsert(payload, { onConflict: 'doctor_id,day_of_week' })
            .select('*')
            .single();

        if (error || !schedule) {
            throw new DomainError(
                `Failed to update doctor schedule: ${error?.message || 'Unknown database error'}`,
                'DATABASE_ERROR'
            );
        }

        return schedule;
    }
}