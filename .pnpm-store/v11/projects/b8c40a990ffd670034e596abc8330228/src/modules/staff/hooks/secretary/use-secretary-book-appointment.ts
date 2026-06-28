'use client';

import { useEffect, useMemo, useState } from 'react';
import { createManualBookingAction } from '@/modules/appointments/actions/booking/create-manual-booking.action';
import { useBookingScheduler } from '@/modules/appointments/hooks/shared/use-booking-scheduler';
import { getUserDependentsAction } from '@/modules/patients/actions/dependents/get-user-dependents.action';
import { searchPatientsAction } from '@/modules/patients/actions/profile/search-patients.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';

export type BookingFor = 'SELF' | 'EXISTING_DEP' | 'NEW_DEP';
export type PatientMode = 'SEARCH' | 'GUEST';

export function useSecretaryBookAppointment() {
  const scheduler = useBookingScheduler();
  const { loadAvailableDates, loadDoctorsForDate, loadAvailableSlots } = scheduler;
  const [patientMode, setPatientMode] = useState<PatientMode>('SEARCH');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [dependents, setDependents] = useState<any[]>([]);
  const [isLoadingDependents, setIsLoadingDependents] = useState(false);
  const [bookingFor, setBookingFor] = useState<BookingFor>('SELF');
  const [selectedDependent, setSelectedDependent] = useState<any | null>(null);
  const [newDepFirstName, setNewDepFirstName] = useState('');
  const [newDepMiddleName, setNewDepMiddleName] = useState('');
  const [newDepLastName, setNewDepLastName] = useState('');
  const [newDepSuffix, setNewDepSuffix] = useState('');
  const [newDepDOB, setNewDepDOB] = useState('');
  const [newDepRelationship, setNewDepRelationship] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [patientNote, setPatientNote] = useState('');
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [booked, setBooked] = useState(false);

  const availableDates = selectedService ? scheduler.availableDates : [];
  const availableDoctors = selectedDate ? scheduler.availableDoctors as { doctorId: string; doctorName: string }[] : [];
  const timeslots = selectedDoctor ? scheduler.availableSlots as any[] : [];

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    async function loadServices() {
      setIsLoadingServices(true);
      const res = await getServicesAction();
      setIsLoadingServices(false);
      if (res.data) setServices(res.data);
    }
    loadServices();
  }, []);

  useEffect(() => {
    if (!selectedService) return;
    const month = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    loadAvailableDates({ serviceId: selectedService, month });
  }, [selectedService, currentMonth, loadAvailableDates]);

  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    loadDoctorsForDate({ date: selectedDate, serviceId: selectedService });
  }, [selectedDate, selectedService, loadDoctorsForDate]);

  useEffect(() => {
    if (!selectedService || !selectedDoctor || !selectedDate) return;
    loadAvailableSlots({ serviceId: selectedService, doctorId: selectedDoctor, date: selectedDate });
  }, [selectedService, selectedDoctor, selectedDate, loadAvailableSlots]);

  useEffect(() => {
    if (patientSearchQuery.trim().length < 2) {
      setPatientSearchResults([]);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setIsSearchingPatients(true);
      const res = await searchPatientsAction({ query: patientSearchQuery });
      if (!active) return;
      setIsSearchingPatients(false);
      setPatientSearchResults(res.success && res.data ? res.data : []);
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [patientSearchQuery]);

  const resetNewDepForm = () => {
    setNewDepFirstName('');
    setNewDepMiddleName('');
    setNewDepLastName('');
    setNewDepSuffix('');
    setNewDepDOB('');
    setNewDepRelationship('');
  };

  const loadDependents = async (patientId: string) => {
    setIsLoadingDependents(true);
    setDependents([]);
    const res = await getUserDependentsAction(patientId);
    setIsLoadingDependents(false);
    if (res.success && res.data) setDependents(res.data);
  };

  const selectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setPatientSearchQuery('');
    setBookingFor('SELF');
    setSelectedDependent(null);
    resetNewDepForm();
    loadDependents(patient.id);
  };

  const switchPatientMode = (mode: PatientMode) => {
    setPatientMode(mode);
    setSelectedPatient(null);
    setDependents([]);
    if (mode === 'SEARCH') {
      setPatientSearchQuery('');
      resetNewDepForm();
      setBookingFor('SELF');
    }
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    setDependents([]);
    setBookingFor('SELF');
    resetNewDepForm();
    setSelectedDependent(null);
  };

  const selectService = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedDate('');
    setSelectedDoctor('');
    setSelectedTime('');
    setSelectedEndTime('');
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedDoctor('');
    setSelectedTime('');
    setSelectedEndTime('');
  };

  const selectDoctor = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setSelectedTime('');
    setSelectedEndTime('');
  };

  const selectTimeslot = (slot: { startTime: string; endTime: string }) => {
    setSelectedTime(slot.startTime);
    setSelectedEndTime(slot.endTime);
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setPatientMode('SEARCH');
    setPatientSearchQuery('');
    setPatientSearchResults([]);
    setDependents([]);
    setBookingFor('SELF');
    setSelectedDependent(null);
    resetNewDepForm();
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setSuffix('');
    setPhoneNumber('');
    setEmail('');
    setSelectedService('');
    setSelectedDate('');
    setSelectedDoctor('');
    setSelectedTime('');
    setSelectedEndTime('');
    setPatientNote('');
    setBooked(false);
    setInlineError('');
  };

  const isReadyToSubmit = useMemo(() => {
    const hasSchedule = !!(selectedService && selectedDate && selectedDoctor && selectedTime);
    if (!hasSchedule) return false;
    if (patientMode === 'GUEST') return !!(firstName && lastName && phoneNumber);
    return selectedPatient !== null && (
      bookingFor === 'SELF' ||
      (bookingFor === 'EXISTING_DEP' && selectedDependent !== null) ||
      (bookingFor === 'NEW_DEP' && !!(newDepFirstName && newDepLastName && newDepDOB && newDepRelationship))
    );
  }, [selectedService, selectedDate, selectedDoctor, selectedTime, patientMode, firstName, lastName, phoneNumber, selectedPatient, bookingFor, selectedDependent, newDepFirstName, newDepLastName, newDepDOB, newDepRelationship]);

  const bookedPatientLabel = patientMode === 'SEARCH' && selectedPatient
    ? bookingFor === 'EXISTING_DEP' && selectedDependent
      ? `${selectedDependent.firstName} ${selectedDependent.lastName} (dep. of ${selectedPatient.firstName} ${selectedPatient.lastName})`
      : bookingFor === 'NEW_DEP'
        ? `${newDepFirstName} ${newDepLastName} (dep. of ${selectedPatient.firstName} ${selectedPatient.lastName})`
        : `${selectedPatient.firstName} ${selectedPatient.lastName}`
    : `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}${suffix ? ' ' + suffix : ''}`;

  const submit = async () => {
    setInlineError('');
    setIsSubmitting(true);
    try {
      const dependentPayload = bookingFor === 'EXISTING_DEP'
        ? { dependentId: selectedDependent!.id }
        : bookingFor === 'NEW_DEP'
          ? {
              newDependentFirstName: newDepFirstName,
              newDependentMiddleName: newDepMiddleName || undefined,
              newDependentLastName: newDepLastName,
              newDependentSuffix: newDepSuffix || undefined,
              newDependentDateOfBirth: newDepDOB,
              newDependentRelationship: newDepRelationship,
            }
          : {};
      const payload = patientMode === 'SEARCH' && selectedPatient
        ? { patientId: selectedPatient.id, serviceId: selectedService, doctorId: selectedDoctor, date: selectedDate, startTime: selectedTime, endTime: selectedEndTime, patientNote: patientNote || undefined, ...dependentPayload }
        : { serviceId: selectedService, doctorId: selectedDoctor, date: selectedDate, startTime: selectedTime, endTime: selectedEndTime, patientNote: patientNote || undefined, firstName, middleName: middleName || undefined, lastName, suffix: suffix || undefined, phoneNumber, email: email || undefined };

      const res = await createManualBookingAction(payload as any);
      if (res.success) {
        setBooked(true);
        setToast({ message: 'Appointment booked successfully!', type: 'success' });
      } else {
        setInlineError(res.error || 'Booking failed');
        setToast({ message: res.error || 'Booking failed', type: 'error' });
      }
    } catch (err: any) {
      setInlineError(err.message || 'Unexpected error');
      setToast({ message: err.message || 'Unexpected error', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    patientMode, switchPatientMode, patientSearchQuery, setPatientSearchQuery, patientSearchResults, isSearchingPatients,
    selectedPatient, selectPatient, clearSelectedPatient, dependents, isLoadingDependents, bookingFor, setBookingFor,
    selectedDependent, setSelectedDependent, resetNewDepForm, newDepFirstName, setNewDepFirstName, newDepMiddleName,
    setNewDepMiddleName, newDepLastName, setNewDepLastName, newDepSuffix, setNewDepSuffix, newDepDOB, setNewDepDOB,
    newDepRelationship, setNewDepRelationship, firstName, setFirstName, middleName, setMiddleName, lastName, setLastName,
    suffix, setSuffix, phoneNumber, setPhoneNumber, email, setEmail, services, selectedService, selectService, currentMonth,
    setCurrentMonth, availableDates, selectedDate, selectDate, availableDoctors, selectedDoctor, selectDoctor, timeslots,
    selectedTime, selectTimeslot, patientNote, setPatientNote, isLoadingServices, isLoadingDays: scheduler.loadingKey === 'dates',
    isLoadingDoctors: scheduler.loadingKey === 'doctors', isLoadingSlots: scheduler.loadingKey === 'slots', isSubmitting,
    inlineError, toast, booked, isReadyToSubmit, bookedPatientLabel, resetForm, submit,
  };
}
