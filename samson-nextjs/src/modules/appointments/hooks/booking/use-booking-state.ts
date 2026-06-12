import { useState } from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { BookingStep, BookingSlot, NewDependentInput } from './use-user-booking';

export function useBookingState() {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<ServiceResponseDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ANY');
  
  const [patientType, setPatientType] = useState<'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT'>('SELF');
  const [selectedDependentId, setSelectedDependentId] = useState<string | null>(null);
  const [newDependentData, setNewDependentData] = useState<NewDependentInput | null>(null);
  
  const [userNote, setUserNote] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);

  const resetState = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedDoctorId('ANY');
    setPatientType('SELF');
    setSelectedDependentId(null);
    setNewDependentData(null);
    setUserNote('');
    setTermsAccepted(false);
    setPrivacyAccepted(false);
  };

  return {
    currentStep, setCurrentStep,
    selectedService, setSelectedService,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    selectedDoctorId, setSelectedDoctorId,
    patientType, setPatientType,
    selectedDependentId, setSelectedDependentId,
    newDependentData, setNewDependentData,
    userNote, setUserNote,
    termsAccepted, setTermsAccepted,
    privacyAccepted, setPrivacyAccepted,
    resetState,
  };
}
