import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { BookingSlot, NewDependentInput } from './use-user-booking';
import type { SubmitBookingDto } from '../../dtos/booking/submit-booking.dto';
import { calculateEndTimeFromIso } from '@/shared/utils/date.util';

interface PayloadMapperParams {
  selectedService: ServiceResponseDto;
  selectedSlot: BookingSlot;
  selectedDate: string;
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  selectedDependentId: string | null;
  newDependentData: NewDependentInput | null;
  userNote: string;
  selectedDoctorId: string;
}

export function createBookingPayload({
  selectedService,
  selectedSlot,
  selectedDate,
  patientType,
  selectedDependentId,
  newDependentData,
  userNote,
  selectedDoctorId,
}: PayloadMapperParams): SubmitBookingDto {
  const payload: SubmitBookingDto = {
    idempotencyKey: crypto.randomUUID(),
    serviceId: selectedService.id,
    doctorId: selectedSlot.doctorId,
    isPreferredDoctor: selectedSlot.isPreferred ?? false,
    doctorAssignmentSource: selectedDoctorId === 'ANY' ? 'SYSTEM' : 'USER',
    date: selectedDate,
    startTime: selectedSlot.originalStartTime,
    endTime: calculateEndTimeFromIso(selectedSlot.originalStartTime, selectedService.durationMinutes).toISOString(),
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
    payload.dependentRelationship = newDependentData.relationship as any;
    payload.dependentBirthday = newDependentData.birthday;
  }

  return payload;
}
