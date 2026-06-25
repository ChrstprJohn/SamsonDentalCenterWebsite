// src/app/(portals)/secretary/book/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getAvailableDaysAction } from '@/modules/appointments/actions/availability/get-available-days.action';
import { getAvailableDoctorsForDateAction } from '@/modules/appointments/actions/availability/get-available-doctors-for-date.action';
import { getAvailableTimeSlotsAction } from '@/modules/appointments/actions/availability/get-available-time-slots.action';
import { searchPatientsAction } from '@/modules/patients/actions/profile/search-patients.action';
import { createManualBookingAction } from '@/modules/appointments/actions/booking/create-manual-booking.action';

export default function BookAppointmentPage() {
  // Patient identity
  const [patientMode, setPatientMode] = useState<'SEARCH' | 'GUEST'>('SEARCH');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  // Guest form
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // Scheduling
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDoctors, setAvailableDoctors] = useState<{ doctorId: string; doctorName: string }[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [timeslots, setTimeslots] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [patientNote, setPatientNote] = useState('');

  // Loading
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingDays, setIsLoadingDays] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state
  const [inlineError, setInlineError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [booked, setBooked] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Load services
  useEffect(() => {
    async function load() {
      setIsLoadingServices(true);
      const res = await getServicesAction();
      setIsLoadingServices(false);
      if (res.data) setServices(res.data);
    }
    load();
  }, []);

  // Available days
  useEffect(() => {
    if (!selectedService) { setAvailableDates([]); return; }
    let active = true;
    async function load() {
      setIsLoadingDays(true);
      const monthStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
      const res = await getAvailableDaysAction({ serviceId: selectedService, month: monthStr });
      if (active) {
        setIsLoadingDays(false);
        setAvailableDates(res.success && res.data ? res.data.availableDates || [] : []);
      }
    }
    load();
    return () => { active = false; };
  }, [selectedService, currentMonth]);

  // Available doctors
  useEffect(() => {
    if (!selectedDate || !selectedService) { setAvailableDoctors([]); return; }
    let active = true;
    async function load() {
      setIsLoadingDoctors(true);
      const res = await getAvailableDoctorsForDateAction({ date: selectedDate, serviceId: selectedService });
      if (active) {
        setIsLoadingDoctors(false);
        setAvailableDoctors(res.success && res.data ? res.data : []);
      }
    }
    load();
    return () => { active = false; };
  }, [selectedDate, selectedService]);

  // Timeslots
  useEffect(() => {
    if (!selectedService || !selectedDoctor || !selectedDate) { setTimeslots([]); return; }
    let active = true;
    async function load() {
      setIsLoadingSlots(true);
      const res = await getAvailableTimeSlotsAction({ serviceId: selectedService, doctorId: selectedDoctor, date: selectedDate });
      if (active) {
        setIsLoadingSlots(false);
        setTimeslots(res.success && res.data ? res.data.availableSlots || [] : []);
      }
    }
    load();
    return () => { active = false; };
  }, [selectedService, selectedDoctor, selectedDate]);

  // Patient search debounce
  useEffect(() => {
    if (patientSearchQuery.trim().length < 2) { setPatientSearchResults([]); return; }
    let active = true;
    const timer = setTimeout(async () => {
      setIsSearchingPatients(true);
      const res = await searchPatientsAction({ query: patientSearchQuery });
      if (active) {
        setIsSearchingPatients(false);
        setPatientSearchResults(res.success && res.data ? res.data : []);
      }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [patientSearchQuery]);

  const resetForm = () => {
    setSelectedPatient(null);
    setPatientMode('SEARCH');
    setPatientSearchQuery('');
    setPatientSearchResults([]);
    setFirstName(''); setMiddleName(''); setLastName(''); setSuffix(''); setPhoneNumber(''); setEmail('');
    setSelectedService(''); setSelectedDate(''); setSelectedDoctor(''); setSelectedTime(''); setSelectedEndTime('');
    setPatientNote('');
    setBooked(false);
    setInlineError('');
  };

  const handleSubmit = async () => {
    setInlineError('');
    setIsSubmitting(true);
    try {
      const payload = {
        serviceId: selectedService,
        doctorId: selectedDoctor,
        date: selectedDate,
        startTime: selectedTime,
        endTime: selectedEndTime,
        patientNote: patientNote || undefined,
        // Patient identity
        ...(patientMode === 'SEARCH' && selectedPatient
          ? { patientId: selectedPatient.id }
          : {
              firstName,
              middleName: middleName || undefined,
              lastName,
              suffix: suffix || undefined,
              phoneNumber,
              email: email || undefined,
            }),
      };

      const res = await createManualBookingAction(payload as any);
      if (res.success) {
        setBooked(true);
        showToast('Appointment booked successfully!', 'success');
      } else {
        setInlineError(res.error || 'Booking failed');
        showToast(res.error || 'Booking failed', 'error');
      }
    } catch (err: any) {
      setInlineError(err.message || 'Unexpected error');
      showToast(err.message || 'Unexpected error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex });
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const formatTimeLabel = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
    } catch { return isoStr; }
  };

  const isReadyToSubmit =
    selectedService && selectedDate && selectedDoctor && selectedTime &&
    (patientMode === 'SEARCH'
      ? !!selectedPatient
      : !!(firstName && lastName && phoneNumber));

  if (booked) {
    return (
      <div className="flex flex-col gap-8 h-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Book Appointment</h1>
          <p className="text-xs text-text-muted">Manually book appointment for walk-in or phone-in patient.</p>
        </div>
        <div className="border border-card-border bg-card rounded-3xl p-8 max-w-md mx-auto shadow-md flex flex-col gap-6 text-center">
          <div className="text-4xl text-emerald-500">✨</div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-text-primary">Appointment Booked!</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Appointment registered and auto-approved. Email confirmation sent if email was provided.
            </p>
          </div>
          <div className="bg-secondary-bg/20 border border-card-border/60 rounded-2xl p-4 text-xs flex flex-col gap-2 text-left w-full">
            <div>
              <span className="text-text-muted">Patient: </span>
              <span className="font-semibold text-text-primary">
                {patientMode === 'SEARCH' && selectedPatient
                  ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                  : `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}${suffix ? ' ' + suffix : ''}`}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Date: </span>
              <span className="font-semibold text-text-primary">{selectedDate} @ {formatTimeLabel(selectedTime)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1 text-xs font-bold py-3" onClick={resetForm}>
              Book Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Book Appointment</h1>
        <p className="text-xs text-text-muted">Manually book appointment for walk-in or phone-in patient.</p>
      </div>

      {inlineError && (
        <div className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
          ⚠️ {inlineError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
        {/* LEFT: Patient Identity */}
        <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-text-secondary">Patient Identity</h2>
            <p className="text-xs text-text-muted">Search registered patient or fill guest info.</p>
          </div>

          {/* Toggle */}
          <div className="flex bg-secondary-bg/25 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => { setPatientMode('SEARCH'); setSelectedPatient(null); setPatientSearchQuery(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${patientMode === 'SEARCH' ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              🔍 Search Patient
            </button>
            <button
              type="button"
              onClick={() => { setPatientMode('GUEST'); setSelectedPatient(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${patientMode === 'GUEST' ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              👤 Register Guest
            </button>
          </div>

          {patientMode === 'SEARCH' ? (
            <div className="flex flex-col gap-3">
              {!selectedPatient ? (
                <>
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search by name, email, or phone..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="text-xs pr-8"
                    />
                    {isSearchingPatients && (
                      <span className="absolute right-2.5 top-2.5 text-xs text-text-muted animate-spin">⌛</span>
                    )}
                  </div>

                  {patientSearchResults.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto border border-card-border/60 rounded-xl bg-card divide-y divide-card-border/40 text-xs">
                      {patientSearchResults.map((pat) => (
                        <div
                          key={pat.id}
                          onClick={() => { setSelectedPatient(pat); setPatientSearchQuery(''); }}
                          className="p-2.5 hover:bg-secondary-bg/20 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-text-primary">{pat.firstName} {pat.lastName}</div>
                            <div className="text-[10px] text-text-muted">{pat.email}</div>
                          </div>
                          <div className="text-[10px] text-text-muted font-mono">{pat.phoneNumber}</div>
                        </div>
                      ))}
                    </div>
                  ) : patientSearchQuery.trim().length >= 2 && !isSearchingPatients ? (
                    <div className="text-center py-4 text-xs text-text-muted bg-card border border-card-border/40 rounded-xl">
                      No patient accounts found.
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">🟢 Linked Account</span>
                    <span className="text-xs font-semibold text-text-primary">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                    <span className="text-[10px] text-text-muted block">{selectedPatient.email}</span>
                    <span className="text-[10px] text-text-muted">{selectedPatient.phoneNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(null)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">🟡 Creating as Guest</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[9px] font-bold text-text-muted uppercase">First Name *</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="text-xs py-1.5 px-2.5" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Middle Name</label>
                  <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="text-xs py-1.5 px-2.5" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Last Name *</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="text-xs py-1.5 px-2.5" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Suffix</label>
                  <Input value={suffix} onChange={(e) => setSuffix(e.target.value)} className="text-xs py-1.5 px-2.5" />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Phone *</label>
                  <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="text-xs py-1.5 px-2.5" placeholder="+639..." />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Email (Optional)</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-xs py-1.5 px-2.5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Service & Schedule */}
        <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-text-secondary">Service & Schedule</h2>
              <p className="text-xs text-text-muted">Select service, date, doctor, and time slot.</p>
            </div>

            {/* Service chips */}
            <div className="border border-card-border/60 rounded-2xl p-4 bg-secondary-bg/10 flex flex-col gap-2">
              <label className="text-[9px] font-bold text-text-secondary uppercase">Service</label>
              {isLoadingServices ? (
                <div className="text-xs text-text-muted animate-pulse">Loading services...</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {services.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => { setSelectedService(srv.id); setSelectedDate(''); setSelectedDoctor(''); setSelectedTime(''); setSelectedEndTime(''); setTimeslots([]); }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${selectedService === srv.id ? 'bg-primary-start text-white border-primary-start shadow-sm' : 'bg-card border-card-border text-text-secondary hover:text-text-primary'}`}
                    >
                      {srv.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className="border border-card-border/60 rounded-2xl p-4 bg-secondary-bg/10 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Select Date</label>
                <div className="p-3 bg-card border border-card-border rounded-2xl">
                  <div className="flex justify-between items-center text-xs text-text-primary mb-3 font-bold bg-secondary-bg/10 p-2 rounded-xl">
                    <button type="button" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="px-2.5 py-1 rounded hover:bg-secondary-bg/40 font-bold">◀ Prev</button>
                    <div className="font-extrabold uppercase tracking-wide">{monthLabel}</div>
                    <button type="button" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="px-2.5 py-1 rounded hover:bg-secondary-bg/40 font-bold">Next ▶</button>
                  </div>
                  {isLoadingDays ? (
                    <div className="text-center text-xs text-text-muted py-6 animate-pulse">Scanning available dates...</div>
                  ) : (
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                      {['S','M','T','W','T','F','S'].map((d, i) => (
                        <div key={`${d}-${i}`} className="font-bold text-text-muted py-1">{d}</div>
                      ))}
                      {blankDays.map((_, i) => <div key={`b-${i}`} className="py-1.5" />)}
                      {daysArray.map((d) => {
                        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                        const isAvailable = availableDates.includes(dateStr);
                        const isSelected = selectedDate === dateStr;
                        return (
                          <button
                            key={d}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => { setSelectedDate(dateStr); setSelectedDoctor(''); setSelectedTime(''); setSelectedEndTime(''); setTimeslots([]); }}
                            className={`py-1.5 rounded-lg font-semibold transition-colors ${isSelected ? 'bg-primary-start text-white' : isAvailable ? 'text-text-secondary hover:bg-secondary-bg/50 cursor-pointer font-bold border border-emerald-500/20 bg-emerald-500/5' : 'text-text-muted/40 opacity-40 cursor-not-allowed'}`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Doctors */}
              {selectedDate && (
                <div className="flex flex-col gap-2 animate-fadeIn relative">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Available Dentist</label>
                  {isLoadingDoctors && (
                    <div className="absolute inset-0 bg-card/60 z-10 flex items-center justify-center rounded-xl">
                      <span className="text-xs font-bold text-primary-start animate-pulse">Scanning schedules...</span>
                    </div>
                  )}
                  {availableDoctors.length === 0 && !isLoadingDoctors ? (
                    <div className="text-xs text-rose-500 font-medium bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                      No doctors scheduled for this service on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableDoctors.map((doc) => {
                        const isSelected = selectedDoctor === doc.doctorId;
                        return (
                          <div
                            key={doc.doctorId}
                            onClick={() => { if (isLoadingDoctors) return; setSelectedDoctor(doc.doctorId); setSelectedTime(''); setSelectedEndTime(''); setTimeslots([]); }}
                            className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col gap-1 ${isSelected ? 'bg-primary-start/10 border-primary-start/50' : 'bg-card border-card-border hover:border-text-muted/30'} ${isLoadingDoctors ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span className="text-xs font-bold text-text-primary">{doc.doctorName}</span>
                            <span className="text-[9px] text-text-muted">Shift scheduled</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Timeslots */}
              {selectedDoctor && (
                <div className="flex flex-col gap-2 animate-fadeIn relative">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Timeslot</label>
                  {isLoadingSlots && (
                    <div className="absolute inset-0 bg-card/60 z-10 flex items-center justify-center rounded-xl">
                      <span className="text-xs font-bold text-primary-start animate-pulse">Retrieving slots...</span>
                    </div>
                  )}
                  {timeslots.length === 0 && !isLoadingSlots ? (
                    <div className="text-xs text-text-muted p-3 bg-secondary-bg/10 rounded-xl">No available timeslots for this dentist on this date.</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {timeslots.map((slot) => {
                        const isSelected = selectedTime === slot.startTime;
                        return (
                          <button
                            key={slot.startTime}
                            type="button"
                            disabled={isLoadingSlots}
                            onClick={() => { setSelectedTime(slot.startTime); setSelectedEndTime(slot.endTime); }}
                            className={`py-2 text-xs font-semibold rounded-lg border transition-all ${isSelected ? 'bg-primary-start text-white border-primary-start shadow-sm' : 'border-card-border bg-card text-text-secondary hover:text-text-primary'} ${isLoadingSlots ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {formatTimeLabel(slot.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Patient Note */}
            <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-2">
              <label className="text-xs font-bold text-text-primary uppercase">Patient Note (Optional)</label>
              <textarea
                value={patientNote}
                onChange={(e) => setPatientNote(e.target.value)}
                placeholder="e.g. tooth sensitivity, prefers mornings, urgent..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-card-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-start/50"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="button"
            variant="primary"
            className="w-full text-xs font-bold py-3 mt-2"
            disabled={isSubmitting || !isReadyToSubmit}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slideUp ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
