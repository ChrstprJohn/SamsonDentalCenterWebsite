import { SubmitBookingDto } from '../../dtos';
import { AppointmentBookingCommands } from '../../repositories';
import { GetAvailabilityUseCase } from '../availability/get-availability.use-case';
import { ValidationError } from '@/shared/errors';

export const submitBookingUseCase = (deps: {
  createAppointment: (userId: string, data: SubmitBookingDto) => Promise<any>;
  getAvailableTimeSlots: (dto: { serviceId: string; doctorId: string; date: string }) => Promise<any>;
}) => {
  return async (userId: string, dto: SubmitBookingDto) => {
    const { serviceId, doctorId, date, startTime, endTime } = dto;

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

    try {
      return await deps.createAppointment(userId, dto);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('duplicate key value')) {
        throw new ValidationError('This slot is already booked!', 'SLOT_ALREADY_BOOKED');
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === '23505'
      ) {
        throw new ValidationError('This slot is already booked!', 'SLOT_ALREADY_BOOKED');
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

  /**
   * Executes appointment booking atomic verification and record insertion.
   * Prevents double-booking at the business logic layer.
   */
  async execute(userId: string, dto: SubmitBookingDto) {
    return submitBookingUseCase({
      createAppointment: (uid, d) => this.bookingCommands.createAppointment(uid, d),
      getAvailableTimeSlots: (d) => this.availabilityUseCase.getAvailableTimeSlots(d),
    })(userId, dto);
  }
}
