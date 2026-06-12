import { SubmitBookingDto, GetAvailableTimeSlotsResponseDto } from '../../dtos';
import { ValidationError } from '@/shared/errors';

export const submitBookingUseCase = (deps: {
  createAppointment: (userId: string, data: SubmitBookingDto & { resolvedDependentId?: string }) => Promise<any>;
  createDependent?: (data: {
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    relationship: string;
  }) => Promise<{ id: string }>;
  getAvailableTimeSlots: (dto: { serviceId: string; doctorId: string; date: string }) => Promise<GetAvailableTimeSlotsResponseDto>;
}) => {
  return async (userId: string, dto: SubmitBookingDto) => {
    const { serviceId, doctorId, date, startTime, endTime, patientType } = dto;

    const availability = await deps.getAvailableTimeSlots({
      serviceId,
      doctorId,
      date,
    });

    const isSlotAvailable = availability.availableSlots.some(
      (slot) => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!isSlotAvailable) {
      throw new ValidationError(
        'The requested appointment time slot is already taken or unavailable.',
        'SLOT_UNAVAILABLE'
      );
    }

    let resolvedDependentId = dto.dependentId;

    // Handle dynamic dependent creation if patient type is NEW_DEPENDENT
    if (patientType === 'NEW_DEPENDENT' && deps.createDependent) {
      const newDependent = await deps.createDependent({
        patientId: userId,
        firstName: dto.dependentFirstName!,
        lastName: dto.dependentLastName!,
        dateOfBirth: dto.dependentBirthday!,
        relationship: dto.dependentRelationship!
      });
      resolvedDependentId = newDependent.id;
    }

    try {
      return await deps.createAppointment(userId, { ...dto, resolvedDependentId });
    } catch (error: unknown) {
      // Catch Postgres Exclusion Constraint violation (23P01) for overlapping appointments
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        ((error as { code?: string }).code === '23P01' || (error as { code?: string }).code === '23505')
      ) {
        throw new ValidationError('This slot was just booked by someone else!', 'SLOT_ALREADY_BOOKED');
      }

      throw error;
    }
  };
};
