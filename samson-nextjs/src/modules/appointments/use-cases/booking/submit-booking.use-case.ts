import { SubmitBookingDto } from '../../dtos';
import { AppointmentBookingCommands } from '../../repositories';
import { GetAvailabilityUseCase } from '../availability/get-availability.use-case';
import { ValidationError } from '@/shared/errors';

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
    const { serviceId, doctorId, date, startTime, endTime } = dto;

    const availability = await this.availabilityUseCase.getAvailableTimeSlots({
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

    try {
      return await this.bookingCommands.createAppointment(userId, dto);
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
  }
}
