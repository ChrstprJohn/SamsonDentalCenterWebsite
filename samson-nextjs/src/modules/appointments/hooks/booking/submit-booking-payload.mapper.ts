import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { BookingSlot, NewDependentInput } from './use-user-booking';
import type { SubmitBookingDto } from '../../dtos/booking/submit-booking.dto';

interface PayloadMapperParams {
  selectedService: ServiceResponseDto;
  selectedSlot: BookingSlot;
  selectedDate: string;
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  selectedDependentId: string | null;
  newDependentData: NewDependentInput | null;
  userNote: string;
}

export function createBookingPayload({
  selectedService,
  selectedSlot,
  selectedDate,
  patientType,
  selectedDependentId,
  newDependentData,
  userNote,
}: PayloadMapperParams): SubmitBookingDto {
  const payload: SubmitBookingDto = {
    idempotencyKey: crypto.randomUUID(),
    serviceId: selectedService.id,
    doctorId: selectedSlot.doctorId,
    isPreferredDoctor: selectedSlot.isPreferred ?? false,
    date: selectedDate,
    startTime: new Date(`${selectedDate} ${selectedSlot.time}`).toISOString(),
    endTime: new Date(new Date(`${selectedDate} ${selectedSlot.time}`).getTime() + selectedService.durationMinutes * 60000).toISOString(),
    patientType,
    userNote: userNote || undefined,
  };

  if (patientType === 'EXISTING_DEPENDENT') {
    payload.dependentId = selectedDependentId || undefined;
  } else if (patientType === 'NEW_DEPENDENT' && newDependentData) {
    payload.dependentFirstName = newDependentData.firstName;
    payload.dependentLastName = newDependentData.lastName;
    payload.dependentMiddleName = newDependentData.middleName;
    payload.dependentSuffix = newDependentData.suffix;
    payload.dependentRelationship = newDependentData.relationship;
    payload.dependentBirthday = newDependentData.birthday;
  }

  return payload;
}
