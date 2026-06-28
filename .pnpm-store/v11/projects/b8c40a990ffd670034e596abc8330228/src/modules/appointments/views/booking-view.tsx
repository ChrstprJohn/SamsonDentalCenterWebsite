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
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { DependentProfileDto } from '@/modules/patients/dtos/exports';
import { getPatientName, getPatientRelationship } from '../utils/booking-helpers';

interface BookingViewProps {
  services: ServiceResponseDto[];
  userProfile?: any;
  userDependents?: DependentProfileDto[];
  reschedulingAppointment?: any;
  clinicConfig?: any;
}

export function BookingView({ services, userProfile, userDependents, reschedulingAppointment, clinicConfig }: BookingViewProps) {
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
    availableDates,
    availableSlots,
    doctors,
    isLoadingAvailability,
    isLoadingDoctors,
    isSubmitting,
    isSuccess,
    createdAppointmentId,
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
    handleSubmit,
  } = useUserBooking(services, userProfile, userDependents, reschedulingAppointment, clinicConfig);

  if (isSuccess) {
    return (
      <BookingSuccessView
        appointmentId={createdAppointmentId}
        service={selectedService}
        slot={selectedSlot}
        date={selectedDate}
        patientName={getPatientName(patientType, selectedDependentId, newDependentData, userProfile, userDependents)}
        patientType={patientType}
        relationship={getPatientRelationship(patientType, selectedDependentId, newDependentData, userDependents)}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-10 rounded-3xl border border-card-border bg-card/75 backdrop-blur-2xl shadow-2xl flex flex-col gap-8 text-left">
      {reschedulingAppointment && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3">
          <span>⚠️</span>
          <div>
            <strong>Reschedule Request Mode:</strong> You are requesting a reschedule for appointment Ref ID:{' '}
            <code className="font-mono text-[10px] bg-amber-500/10 px-1 py-0.5 rounded">
              {reschedulingAppointment.id.slice(0, 8)}
            </code>
            . The treatment service cannot be altered.
          </div>
        </div>
      )}
      <BookingProgressTabs currentStep={currentStep} goToStep={goToStep} isNextDisabled={isNextDisabled} />

      {/* step views */}
      <div className="flex-1 min-h-[300px]">
        {currentStep === 1 && (
          <ServiceStep services={services} selectedService={selectedService} onSelect={selectService} />
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
            userProfile={userProfile}
            userDependents={userDependents}
            userNote={userNote}
            onEditStep={goToStep}
          />
        )}
      </div>

      {/* footer controls */}
      <BookingFooterControls
        currentStep={currentStep}
        isNextDisabled={isNextDisabled}
        isSubmitting={isSubmitting}
        prevStep={prevStep}
        nextStep={nextStep}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
