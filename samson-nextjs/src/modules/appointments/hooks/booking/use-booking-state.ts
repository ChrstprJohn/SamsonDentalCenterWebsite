import { useState } from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { BookingStep, BookingSlot, NewDependentInput } from './use-user-booking';

export function useBookingState() {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<ServiceResponseDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [preferredStartTime, setPreferredStartTime] = useState<string>('09:00');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ANY');
  
  const [patientType, setPatientType] = useState<'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT'>('SELF');
  const [selectedDependentId, setSelectedDependentId] = useState<string | null>(null);
  const [newDependentData, setNewDependentData] = useState<NewDependentInput | null>(null);
  
  const [userNote, setUserNote] = useState<string>('');

  const resetState = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setPreferredStartTime('09:00');
    setSelectedDoctorId('ANY');
    setPatientType('SELF');
    setSelectedDependentId(null);
    setNewDependentData(null);
    setUserNote('');
  };

  return {
    currentStep, setCurrentStep,
    selectedService, setSelectedService,
    selectedDate, setSelectedDate,
    preferredStartTime, setPreferredStartTime,
    selectedDoctorId, setSelectedDoctorId,
    patientType, setPatientType,
    selectedDependentId, setSelectedDependentId,
    newDependentData, setNewDependentData,
    userNote, setUserNote,
    resetState,
  };
}
