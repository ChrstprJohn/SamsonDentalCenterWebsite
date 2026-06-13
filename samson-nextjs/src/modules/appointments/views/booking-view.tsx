'use client';

import React from 'react';
import { useUserBooking } from '../hooks/booking/use-user-booking';
import { ServiceStep } from '../components/booking/service-step';
import { DateTimeStep } from '../components/booking/date-time-step';
import { PatientDetailsStep } from '../components/booking/patient-details-step';
import { ReviewStep } from '../components/booking/review-step';
import { BookingSuccessView } from '../components/booking/booking-success-view';
import { BookingProgressTabs } from '../components/booking/booking-progress-tabs';
import { BookingFooterControls } from '../components/booking/booking-footer-controls';
import { Button } from '@/components/ui/button';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { DependentProfileDto } from '@/modules/patients/dtos';

interface BookingViewProps {
  services: ServiceResponseDto[];
  userProfile?: any;
  userDependents?: DependentProfileDto[];
}

export function BookingView({ services, userProfile, userDependents }: BookingViewProps) {
  const {
    currentStep,
    selectedService,
    selectedDate,
    selectedSlot,
    selectedDoctorId,
    patientType,
    selectedDependentId,
    newDependentData,
    userNote,
    termsAccepted,
    privacyAccepted,
    availableDates,
    availableSlots,
    doctors,
    isLoadingAvailability,
    isLoadingDoctors,
    isSubmitting,
    isSuccess,
    isNextDisabled,

    nextStep,
    prevStep,
    goToStep,
    selectService,
    selectDate,
    selectSlot,
    selectDoctor,
    setPatientType,
    setSelectedDependentId,
    setNewDependentData,
    setUserNote,
    setTermsAccepted,
    setPrivacyAccepted,
    handleSubmit,
  } = useUserBooking(services, userProfile, userDependents);

  if (isSuccess) {
    return (
      <BookingSuccessView 
        service={selectedService}
        slot={selectedSlot}
        date={selectedDate}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-10 rounded-3xl border border-card-border bg-card/75 backdrop-blur-2xl shadow-2xl flex flex-col gap-8">
      <BookingProgressTabs 
        currentStep={currentStep}
        goToStep={goToStep}
        isNextDisabled={isNextDisabled}
      />

      {/* step views */}
      <div className="flex-1 min-h-[300px]">
        {currentStep === 1 && (
          <ServiceStep
            services={services}
            selectedService={selectedService}
            onSelect={selectService}
          />
        )}
        {currentStep === 2 && (
          <DateTimeStep
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            selectedDoctorId={selectedDoctorId}
            doctors={doctors}
            availableDates={availableDates}
            availableSlots={availableSlots}
            isLoading={isLoadingAvailability}
            isLoadingDoctors={isLoadingDoctors}
            onSelectDate={selectDate}
            onSelectSlot={selectSlot}
            onSelectDoctor={selectDoctor}
          />
        )}
        {currentStep === 3 && (
          <PatientDetailsStep
            patientType={patientType}
            selectedDependentId={selectedDependentId}
            newDependentData={newDependentData}
            userNote={userNote}
            userProfile={userProfile}
            userDependents={userDependents}
            onSetPatientType={setPatientType}
            onSelectDependent={setSelectedDependentId}
            onSetNewDependent={setNewDependentData}
            onSetUserNote={setUserNote}
          />
        )}
        {currentStep === 4 && (
          <ReviewStep
            service={selectedService}
            date={selectedDate}
            slot={selectedSlot}
            patientType={patientType}
            selectedDependentId={selectedDependentId}
            newDependentData={newDependentData}
            userNote={userNote}
            termsAccepted={termsAccepted}
            privacyAccepted={privacyAccepted}
            onSetTermsAccepted={setTermsAccepted}
            onSetPrivacyAccepted={setPrivacyAccepted}
          />
        )}
      </div>

      {/* footer controls */}
      <BookingFooterControls
        currentStep={currentStep}
        isNextDisabled={isNextDisabled}
        isSubmitting={isSubmitting}
        termsAccepted={termsAccepted}
        privacyAccepted={privacyAccepted}
        prevStep={prevStep}
        nextStep={nextStep}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
