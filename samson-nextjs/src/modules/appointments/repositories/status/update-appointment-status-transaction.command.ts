import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { AppointmentDto, mapAppointmentRecord } from '../../dtos/exports';
import { AppointmentStatusValue } from './update-status.commands';

export const updateAppointmentStatusTransactionCommand = (supabase: SupabaseClient) => {
  return async (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    newStatus: AppointmentStatusValue,
    reason?: string,
    rescheduleMetadata?: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
    },
    clearProposedMetadata?: boolean,
    rescheduleCount?: number
  ): Promise<AppointmentDto> => {
    const { data, error } = await supabase.rpc('update_appointment_status_transaction', {
      p_appointment_id:   appointmentId,
      p_actor_id:         actorId,
      p_actor_role:       actorRole,
      p_new_status:       newStatus,
      p_reason:           reason ?? null,
      p_reschedule_date:  rescheduleMetadata?.date ?? null,
      p_reschedule_start: rescheduleMetadata?.startTime ?? null,
      p_reschedule_end:   rescheduleMetadata?.endTime ?? null,
      p_reschedule_doctor: rescheduleMetadata?.doctorId ?? null,
      p_clear_proposed:   clearProposedMetadata ?? false,
      p_reschedule_count: rescheduleCount ?? null,
    });

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      throw new DomainError(
        `Failed to update appointment status: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    const row = Array.isArray(data) ? data[0] : data;
    return mapAppointmentRecord(row as Record<string, unknown>);
  };
};
