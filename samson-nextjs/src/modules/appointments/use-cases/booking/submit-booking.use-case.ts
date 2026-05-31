import { SubmitBookingDto } from '../../dtos';
import { AppointmentBookingCommands } from '../../repositories';
import { GetAvailabilityUseCase } from '../availability/get-availability.use-case';
import { ValidationError } from '@/shared/errors';

export const submitBookingUseCase = (deps: {
  createAppointment: (userId: string, data: SubmitBookingDto & { resolvedDependentId?: string }) => Promise<any>;
  createDependent?: (data: any) => Promise<any>; // Optional dependency to support dependent creation
  getAvailableTimeSlots: (dto: { serviceId: string; doctorId: string; date: string }) => Promise<any>;
}) => {
  return async (userId: string, dto: SubmitBookingDto) => {
    const { serviceId, doctorId, date, startTime, endTime, patientType } = dto;

    const availability = await deps.getAvailableTimeSlots({
      serviceId,
      doctorId,
      date,
    });

    const isSlotAvailable = availability.availableSlots.some(
      (slot: any) => slot.startTime === startTime && slot.endTime === endTime
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

/** @deprecated Use submitBookingUseCase directly instead */
export class SubmitBookingUseCase {
  constructor(
    private readonly bookingCommands: AppointmentBookingCommands,
    private readonly availabilityUseCase: GetAvailabilityUseCase
  ) {}

  async execute(userId: string, dto: SubmitBookingDto) {
    return submitBookingUseCase({
      createAppointment: (uid, d) => this.bookingCommands.createAppointment(uid, d),
      getAvailableTimeSlots: (d) => this.availabilityUseCase.getAvailableTimeSlots(d),
    })(userId, dto);
  }
}
