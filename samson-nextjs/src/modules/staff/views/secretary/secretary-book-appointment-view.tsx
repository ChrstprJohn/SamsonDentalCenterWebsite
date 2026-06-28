'use client';

import { useSecretaryBookAppointment } from '../../hooks/secretary/use-secretary-book-appointment';
import { BookPatientIdentityPanel } from './sub-components/book-patient-identity-panel';
import { BookSchedulePanel } from './sub-components/book-schedule-panel';
import { BookSuccessPanel } from './sub-components/book-success-panel';
import { BookToast } from './sub-components/book-toast';

export function SecretaryBookAppointmentView() {
  const view = useSecretaryBookAppointment();

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Book Appointment</h1>
        <p className="text-xs text-text-muted">Manually book appointment for walk-in or phone-in patient.</p>
      </div>

      {view.booked ? (
        <BookSuccessPanel
          patientLabel={view.bookedPatientLabel}
          selectedDate={view.selectedDate}
          selectedTime={view.selectedTime}
          onReset={view.resetForm}
        />
      ) : (
        <>
          {view.inlineError && (
            <div className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {view.inlineError}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
            <BookPatientIdentityPanel
              patientMode={view.patientMode}
              switchPatientMode={view.switchPatientMode}
              patientSearchQuery={view.patientSearchQuery}
              setPatientSearchQuery={view.setPatientSearchQuery}
              patientSearchResults={view.patientSearchResults}
              isSearchingPatients={view.isSearchingPatients}
              selectedPatient={view.selectedPatient}
              selectPatient={view.selectPatient}
              clearSelectedPatient={view.clearSelectedPatient}
              dependents={view.dependents}
              isLoadingDependents={view.isLoadingDependents}
              bookingFor={view.bookingFor}
              setBookingFor={view.setBookingFor}
              selectedDependent={view.selectedDependent}
              setSelectedDependent={view.setSelectedDependent}
              resetNewDepForm={view.resetNewDepForm}
              newDependent={{
                firstName: view.newDepFirstName,
                setFirstName: view.setNewDepFirstName,
                middleName: view.newDepMiddleName,
                setMiddleName: view.setNewDepMiddleName,
                lastName: view.newDepLastName,
                setLastName: view.setNewDepLastName,
                suffix: view.newDepSuffix,
                setSuffix: view.setNewDepSuffix,
                dob: view.newDepDOB,
                setDob: view.setNewDepDOB,
                relationship: view.newDepRelationship,
                setRelationship: view.setNewDepRelationship,
              }}
              guest={{
                firstName: view.firstName,
                setFirstName: view.setFirstName,
                middleName: view.middleName,
                setMiddleName: view.setMiddleName,
                lastName: view.lastName,
                setLastName: view.setLastName,
                suffix: view.suffix,
                setSuffix: view.setSuffix,
                phoneNumber: view.phoneNumber,
                setPhoneNumber: view.setPhoneNumber,
                email: view.email,
                setEmail: view.setEmail,
              }}
            />
            <BookSchedulePanel
              services={view.services}
              selectedService={view.selectedService}
              selectService={view.selectService}
              currentMonth={view.currentMonth}
              setCurrentMonth={view.setCurrentMonth}
              availableDates={view.availableDates}
              selectedDate={view.selectedDate}
              selectDate={view.selectDate}
              availableDoctors={view.availableDoctors}
              selectedDoctor={view.selectedDoctor}
              selectDoctor={view.selectDoctor}
              timeslots={view.timeslots}
              selectedTime={view.selectedTime}
              selectTimeslot={view.selectTimeslot}
              patientNote={view.patientNote}
              setPatientNote={view.setPatientNote}
              isLoadingServices={view.isLoadingServices}
              isLoadingDays={view.isLoadingDays}
              isLoadingDoctors={view.isLoadingDoctors}
              isLoadingSlots={view.isLoadingSlots}
              isSubmitting={view.isSubmitting}
              isReadyToSubmit={view.isReadyToSubmit}
              onSubmit={view.submit}
            />
          </div>
          <BookToast toast={view.toast} />
        </>
      )}
    </div>
  );
}
