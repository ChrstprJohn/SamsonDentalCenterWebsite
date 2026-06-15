import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { AppointmentDto, mapAppointmentRecord } from '../../dtos/exports';

export const cancelAppointmentAtomicCommand = (supabase: SupabaseClient) => {
  return async (
    appointmentId: string,
    actorId: string,
    actorRole: string,
    reason?: string
  ): Promise<AppointmentDto> => {
    const { data: appointment, error } = await supabase.rpc('cancel_appointment_transaction', {
      p_appointment_id: appointmentId,
      p_actor_id: actorId,
      p_actor_role: actorRole,
      p_reason: reason || null,
    });

    if (error) {
      if (error.message.includes('Cannot cancel appointment from terminal status')) {
        throw new DomainError(error.message, 'STATE_CONFLICT');
      }
      throw new DomainError(
        `Failed to cancel appointment atomically: ${error.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    if (!appointment) {
      throw new DomainError('Appointment not found or failed to return from transaction', 'NOT_FOUND');
    }

    return mapAppointmentRecord(appointment as Record<string, unknown>);
  };
};
