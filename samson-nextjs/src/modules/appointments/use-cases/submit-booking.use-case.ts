import { SubmitBookingDto } from '../dtos/submit-booking.dto';
import { AppointmentBookingCommands } from '../repositories/appointment-booking.commands';
import { GetAvailabilityUseCase } from './get-availability.use-case';
import { DomainError, ValidationError } from '@/shared/errors';

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

    // 1. Verify availability of the requested slot on the given date
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
      // 2. Perform database insertion
      const appointment = await this.bookingCommands.createAppointment(userId, dto);
      return appointment;
    } catch (error: any) {
      // Handle Postgres unique constraint violation on doctor_id, date, start_time
      if (error?.message?.includes('duplicate key value') || error?.code === '23505') {
        throw new ValidationError(
          'This slot is already booked!',
          'SLOT_ALREADY_BOOKED'
        );
      }
      throw error;
    }
  }
}
