// src/app/(portals)/secretary/book/page.tsx
'use client';

import React from 'react';
import { useSecretary } from '@/modules/staff/hooks/use-secretary.hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export default function BookAppointmentPage() {
  const {
    bookingStep,
    setBookingStep,
    manualSearchQuery,
    setManualSearchQuery,
    selectedPatient,
    setSelectedPatient,
    isNewGuest,
    setIsNewGuest,
    guestForm,
    setGuestForm,
    manualService,
    setManualService,
    manualDoctor,
    setManualDoctor,
    manualDate,
    setManualDate,
    manualTime,
    setManualTime,
    handleManualBookingSubmit,
    resetBookingWizard,
    patients,
    isSubmitting,
  } = useSecretary();

  const filteredPatients = patients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
      p.lastName.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
      p.phoneNumber?.includes(manualSearchQuery)
  );

  return (
    <div className="border border-card-border bg-card rounded-3xl p-8 max-w-2xl mx-auto shadow-md flex flex-col gap-6">
      {/* Header & Step progress */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-text-primary">Book Appointment</h1>
          <span className="text-xs text-text-muted">Step {bookingStep} of 3</span>
        </div>

        {/* Stepper Breadcrumbs */}
        <div className="flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${bookingStep >= 1 ? 'bg-primary-start' : 'bg-secondary-bg'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${bookingStep >= 2 ? 'bg-primary-start' : 'bg-secondary-bg'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${bookingStep >= 3 ? 'bg-primary-start' : 'bg-secondary-bg'}`} />
        </div>
      </div>

      {/* STEP 1: Patient Identity */}
      {bookingStep === 1 && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-text-secondary">Step 1: Patient Search-First Threshold</h2>
            <p className="text-xs text-text-muted">
              Verify if the patient has an active account. If no account matches, create a Guest.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Search by Patient Name, Email, or Phone..."
              value={manualSearchQuery}
              onChange={(e) => setManualSearchQuery(e.target.value)}
              className="text-xs"
            />

            {manualSearchQuery && (
              <div className="border border-card-border/60 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <div className="p-3 text-xs text-text-muted text-center">No matching patient found.</div>
                ) : (
                  filteredPatients.map((pat) => (
                    <div
                      key={pat.id}
                      onClick={() => {
                        setSelectedPatient(pat);
                        setIsNewGuest(false);
                        setBookingStep(2);
                      }}
                      className="p-3 border-b border-card-border/40 hover:bg-secondary-bg/30 cursor-pointer text-xs flex justify-between items-center transition-colors"
                    >
                      <span className="font-semibold text-text-primary">
                        {pat.firstName} {pat.lastName}
                      </span>
                      <span className="text-[10px] text-text-muted">{pat.email}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-card-border/50 pt-4">
              <span className="text-xs text-text-muted">Not registered? Continue as Guest</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedPatient(null);
                  setIsNewGuest(true);
                }}
              >
                Guest Registration
              </Button>
            </div>

            {isNewGuest && (
              <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-3 transition-all">
                <div className="text-xs font-bold text-text-primary">New Guest Information</div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="First Name"
                    value={guestForm.firstName}
                    onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })}
                    className="text-xs"
                  />
                  <Input
                    placeholder="Last Name"
                    value={guestForm.lastName}
                    onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Phone (Required)"
                    value={guestForm.phoneNumber}
                    onChange={(e) => setGuestForm({ ...guestForm, phoneNumber: e.target.value })}
                    className="text-xs"
                  />
                  <Input
                    placeholder="Email (Optional)"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <Button
                  onClick={() => setBookingStep(2)}
                  disabled={!guestForm.firstName || !guestForm.lastName || !guestForm.phoneNumber}
                  variant="primary"
                  className="w-full text-xs font-bold py-2 mt-2"
                >
                  Continue to Schedule
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Service & Schedule Selection */}
      {bookingStep === 2 && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-text-secondary">Step 2: Service & Live Scheduling</h2>
            <p className="text-xs text-text-muted">
              Select treatment service and pick available timeslot.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Service</label>
              <Select
                value={manualService}
                onChange={(e) => setManualService(e.target.value)}
                className="text-xs"
                options={[
                  { value: '', label: 'Select Service...' },
                  { value: 'srv-1', label: 'Routine Teeth Cleaning (30 mins)' },
                  { value: 'srv-2', label: 'Root Canal Treatment (60 mins)' },
                  { value: 'srv-3', label: 'Dental Implants Consult (45 mins)' },
                ]}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Doctor</label>
              <Select
                value={manualDoctor}
                onChange={(e) => setManualDoctor(e.target.value)}
                className="text-xs"
                options={[
                  { value: '', label: 'Select Dentist...' },
                  { value: 'doc-1', label: 'Dr. Christopher Samson' },
                  { value: 'doc-2', label: 'Dr. Sarah Samson' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Date</label>
                <Input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="text-xs" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Time Slot</label>
                <Select
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="text-xs"
                  options={[
                    { value: '', label: 'Select Time...' },
                    { value: '09:00 AM', label: '09:00 AM' },
                    { value: '10:30 AM', label: '10:30 AM' },
                    { value: '02:00 PM', label: '02:00 PM' },
                  ]}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button type="button" variant="secondary" className="flex-1 text-xs" onClick={() => setBookingStep(1)}>
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1 text-xs"
                disabled={!manualService || !manualDoctor || !manualDate || !manualTime}
                onClick={handleManualBookingSubmit}
              >
                {isSubmitting ? 'Booking...' : 'Book Walk-In Appointment'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Success / Confirmation */}
      {bookingStep === 3 && (
        <div className="flex flex-col gap-6 text-center py-6">
          <div className="text-4xl text-emerald-500">✨</div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-text-primary">Appointment Booked Successfully!</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              The appointment has been registered and auto-approved in the database scheduler.
            </p>
          </div>

          <div className="bg-secondary-bg/20 border border-card-border/60 rounded-2xl p-4 text-xs flex flex-col gap-2 text-left max-w-sm mx-auto w-full">
            <div>
              <span className="text-text-muted font-medium">Patient:</span>{' '}
              <span className="font-semibold text-text-primary">
                {selectedPatient
                  ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                  : `${guestForm.firstName} ${guestForm.lastName}`}
              </span>
            </div>
            <div>
              <span className="text-text-muted font-medium">Schedule Slot:</span>{' '}
              <span className="font-semibold text-text-primary">
                {manualDate} @ {manualTime}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            className="text-xs font-bold py-3 max-w-xs mx-auto w-full"
            onClick={resetBookingWizard}
          >
            Book Another Appointment
          </Button>
        </div>
      )}
    </div>
  );
}
