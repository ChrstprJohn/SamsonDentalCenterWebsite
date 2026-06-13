import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { AppointmentDto, mapAppointmentRecord } from '../../dtos/exports';

export type AppointmentStatusValue = AppointmentDto['status'];

export const updateStatusCommand = (supabase: SupabaseClient) => {
  return async (
    appointmentId: string,
    status: AppointmentStatusValue,
    reason?: string,
    rescheduleMetadata?: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
    },
    rescheduleCount?: number,
    proposedRescheduleMetadata?: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
    },
    clearProposedMetadata?: boolean
  ): Promise<AppointmentDto> => {
    const payload: Record<string, string | number | null> = {
      status,
      status_reason: reason ?? null,
      updated_at: new Date().toISOString(),
    };

    if (rescheduleMetadata) {
      payload.date = rescheduleMetadata.date;
      payload.start_time = rescheduleMetadata.startTime;
      payload.end_time = rescheduleMetadata.endTime;
      payload.doctor_id = rescheduleMetadata.doctorId;
    }

    if (rescheduleCount !== undefined) {
      payload.reschedule_count = rescheduleCount;
    }

    if (proposedRescheduleMetadata) {
      payload.proposed_date = proposedRescheduleMetadata.date;
      payload.proposed_start_time = proposedRescheduleMetadata.startTime;
      payload.proposed_end_time = proposedRescheduleMetadata.endTime;
      payload.proposed_doctor_id = proposedRescheduleMetadata.doctorId;
    }

    if (clearProposedMetadata) {
      payload.proposed_date = null;
      payload.proposed_start_time = null;
      payload.proposed_end_time = null;
      payload.proposed_doctor_id = null;
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(payload)
      .eq('id', appointmentId)
      .select('*')
      .single();

    if (error || !appointment) {
      throw new DomainError(
        `Failed to update appointment status: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return mapAppointmentRecord(appointment as Record<string, unknown>);
  };
};
