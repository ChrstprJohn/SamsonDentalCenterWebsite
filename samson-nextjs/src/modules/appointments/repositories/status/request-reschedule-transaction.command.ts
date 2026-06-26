import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { AppointmentDto, mapAppointmentRecord } from '../../dtos/exports';

export const requestRescheduleTransactionCommand = (supabase: SupabaseClient) => {
  return async (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    reason: string,
    proposedMetadata: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
    }
  ): Promise<AppointmentDto> => {
    const { data, error } = await supabase.rpc('request_reschedule_transaction', {
      p_appointment_id:       appointmentId,
      p_actor_id:             actorId,
      p_actor_role:           actorRole,
      p_reason:               reason,
      p_proposed_date:        proposedMetadata.date,
      p_proposed_start_time:  proposedMetadata.startTime,
      p_proposed_end_time:    proposedMetadata.endTime,
      p_proposed_doctor_id:   proposedMetadata.doctorId,
    });

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      throw new DomainError(
        `Failed to request reschedule: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    // RPC returns SETOF appointments — take the first (and only) row
    const row = Array.isArray(data) ? data[0] : data;
    return mapAppointmentRecord(row as Record<string, unknown>);
  };
};
