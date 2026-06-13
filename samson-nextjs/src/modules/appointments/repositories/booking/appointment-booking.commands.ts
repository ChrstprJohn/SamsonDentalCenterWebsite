import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { SubmitBookingDto, AppointmentDto, mapAppointmentRecord } from '../../dtos';
import { outboxCommands } from '@/shared/outbox/outbox.commands';

export const createAppointmentCommand = (supabase: SupabaseClient) => {
  return async (userId: string, data: SubmitBookingDto & { resolvedDependentId?: string }): Promise<AppointmentDto> => {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: userId,
        status: 'PENDING',
        service_id: data.serviceId,
        doctor_id: data.doctorId,
        dependent_id: data.resolvedDependentId || data.dependentId || null,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        user_note: data.userNote || null,
      })
      .select('*')
      .single();

    if (error || !appointment) {
      throw new DomainError(
        `Failed to create appointment: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    // Emit domain event for async side effects (like email notifications)
    await outboxCommands(supabase).emitEvent('APPOINTMENT_BOOKED', {
      appointmentId: appointment.id,
      patientId: appointment.patient_id,
      serviceId: appointment.service_id,
      doctorId: appointment.doctor_id,
      date: appointment.date,
      startTime: appointment.start_time,
    });

    return mapAppointmentRecord(appointment as Record<string, unknown>);
  };
};
