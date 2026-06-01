'use client';

import React from 'react';
import { useUserBooking } from '../hooks/booking/use-user-booking';
import { ServiceStep } from '../components/booking/service-step';
import { DateTimeStep } from '../components/booking/date-time-step';
import { PatientDetailsStep } from '../components/booking/patient-details-step';
import { ReviewStep } from '../components/booking/review-step';
import { BookingSuccessView } from '../components/booking/booking-success-view';
import { BookingProgressTabs } from '../components/booking/booking-progress-tabs';
import { Button } from '@/components/ui/button';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface BookingViewProps {
  services: ServiceResponseDto[];
}

export function BookingView({ services }: BookingViewProps) {
  const {
    currentStep,
    selectedService,
    selectedDate,
    selectedSlot,
    slotHoldRemaining,
    isSlotHoldActive,
    patientType,
    selectedDependentId,
    newDependentData,
    userNote,
    termsAccepted,
    privacyAccepted,
    availableDates,
    availableSlots,
    isLoadingAvailability,
    isSubmitting,
    isSuccess,
    isNextDisabled,

    nextStep,
    prevStep,
    goToStep,
    selectService,
    selectDate,
    selectSlot,
    setPatientType,
    setSelectedDependentId,
    setNewDependentData,
    setUserNote,
    setTermsAccepted,
    setPrivacyAccepted,
    handleSubmit,
  } = useUserBooking(services);

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
    <div className="w-full max-w-2xl mx-auto p-6 md:p-10 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl flex flex-col gap-8">
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
            availableDates={availableDates}
            availableSlots={availableSlots}
            isLoading={isLoadingAvailability}
            slotHoldRemaining={slotHoldRemaining}
            isSlotHoldActive={isSlotHoldActive}
            onSelectDate={selectDate}
            onSelectSlot={selectSlot}
          />
        )}
        {currentStep === 3 && (
          <PatientDetailsStep
            patientType={patientType}
            selectedDependentId={selectedDependentId}
            newDependentData={newDependentData}
            userNote={userNote}
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
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6 mt-4">
        <Button
          variant="secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={nextStep}
            disabled={isNextDisabled()}
          >
            Next Step
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !termsAccepted || !privacyAccepted}
          >
            {isSubmitting ? 'Finalizing...' : 'Submit Booking'}
          </Button>
        )}
      </div>
    </div>
  );
}
