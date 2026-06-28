import { AppointmentStatusValue } from '../../repositories/exports';
import { ValidationError } from '@/shared/errors';
import { AppointmentDto } from '../../dtos/exports';

export const cancelAppointmentUseCase = (deps: {
  executeAtomicCancel: (
    appointmentId: string,
    actorId: string,
    actorRole: string,
    reason?: string
  ) => Promise<AppointmentDto>;
}) => {
  return async (
    appointmentId: string,
    actorId: string | null,
    actorRole: string,
    reason?: string
  ) => {
    const updatedAppointment = await deps.executeAtomicCancel(
      appointmentId,
      actorId || '',
      actorRole,
      reason
    );

    return updatedAppointment;
  };
};
