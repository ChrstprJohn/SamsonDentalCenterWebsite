'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createManualBookingAction } from '@/modules/appointments/actions/booking/create-manual-booking.action';
import { getUserDependentsAction } from '@/modules/patients/actions/dependents/get-user-dependents.action';
import { searchPatientsAction } from '@/modules/patients/actions/profile/search-patients.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { getStaffAppointmentByIdAction } from '@/modules/appointments/actions/clinic/get-staff-appointment-by-id.action';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { getCalendarNotesAction } from '@/modules/appointments/actions/calendar-notes/get-calendar-notes.action';
import { createCalendarNoteAction } from '@/modules/appointments/actions/calendar-notes/create-calendar-note.action';
import { updateCalendarNoteAction } from '@/modules/appointments/actions/calendar-notes/update-calendar-note.action';
import { deleteCalendarNoteAction } from '@/modules/appointments/actions/calendar-notes/delete-calendar-note.action';
import { useToast } from '@/components/feedback/toast-container';
import type { CalendarNoteResponseDto } from '@/modules/appointments/dtos/calendar-notes/calendar-note-response.dto';
import type { UpdateCalendarNoteDto } from '@/modules/appointments/dtos/calendar-notes/update-calendar-note.dto';

export type BookingFor = 'SELF' | 'EXISTING_DEP' | 'NEW_DEP';
export type PatientMode = 'SEARCH' | 'GUEST';

export function useSecretaryBookAppointment() {
  const [patientMode, setPatientMode] = useState<PatientMode>('GUEST');
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
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [notes, setNotes] = useState<CalendarNoteResponseDto[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<any | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [patientNote, setPatientNote] = useState('');
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [booked, setBooked] = useState(false);
  const [confirmationChannel, setConfirmationChannel] = useState<'EMAIL' | 'SMS' | 'NONE' | 'BOTH'>('NONE');
  const actionResourcesLoadedRef = useRef(false);
  const actionResourcesLoadingRef = useRef<Promise<void> | null>(null);
  const timelineRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);
  const [timelineVersion, setTimelineVersion] = useState(0);

  const { addToast } = useToast();

  const loadActionResources = useCallback(async () => {
    if (actionResourcesLoadedRef.current) return;
    if (actionResourcesLoadingRef.current) return actionResourcesLoadingRef.current;
    setIsLoadingServices(true);
    const request = getServicesAction('BOOKABLE')
      .then((serviceResult) => {
        if (serviceResult.data) setServices(serviceResult.data);
        actionResourcesLoadedRef.current = Boolean(serviceResult.data);
      })
      .catch((error) => setInlineError(error instanceof Error ? error.message : 'Failed to load booking resources'))
      .finally(() => {
        actionResourcesLoadingRef.current = null;
        setIsLoadingServices(false);
      });
    actionResourcesLoadingRef.current = request;
    return request;
  }, []);

  const loadTimelineData = useCallback(async (date: string, silent = false) => {
    if (!date) return;
    const requestId = ++timelineRequestIdRef.current;
    if (!silent) setIsLoadingAppointments(true);
    setIsLoadingNotes(true);
    const [res, notesRes] = await Promise.all([
      getClinicAppointmentsAction({ date }),
      getCalendarNotesAction({ dateFrom: date, dateTo: date }),
    ]);
    if (requestId !== timelineRequestIdRef.current) return;
    setIsLoadingAppointments(false);
    setIsLoadingNotes(false);
    if (res.success && res.data) {
      setAppointments(res.data);
      setTimelineVersion((version) => version + 1);
      setSelectedAppointmentDetails((prev: any) => {
        if (!prev) return null;
        const updated = res.data.find((a: any) => a.id === prev.id);
        return updated || prev;
      });
    } else if (!res.success) setInlineError(res.error || 'Failed to load appointments');
    if (notesRes.success && notesRes.data) setNotes(notesRes.data);
    else if (!notesRes.success) setInlineError(notesRes.error || 'Failed to load calendar notes');
  }, []);

  const [operatingHours, setOperatingHours] = useState<any>(null);

  useEffect(() => {
    async function loadConfig() {
      const res = await getClinicConfigAction();
      if (res && 'data' in res && res.data) {
        setOperatingHours(res.data.operatingHours);
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    async function loadDoctors() {
      const res = await getDoctorsAction();
      if (res.success && res.data) {
        setDoctorsList(res.data);
      }
    }
    loadDoctors();
  }, []);

  const selectAppointment = useCallback((appointment: any | null) => {
    if (!appointment) {
      setSelectedAppointmentDetails(null);
      return;
    }
    setSelectedAppointmentDetails(appointment);
    const requestId = ++detailRequestIdRef.current;
    void getStaffAppointmentByIdAction(appointment.id).then((result) => {
      if (requestId !== detailRequestIdRef.current) return;
      if (result.success && result.data) setSelectedAppointmentDetails(result.data);
      else if (!result.success) setInlineError(result.error || 'Failed to load appointment details');
    });
  }, []);

  const addNote = useCallback(async (data: { title?: string | null; date: string; startTime?: string | null; doctorId?: string | null; note: string }) => {
    const res = await createCalendarNoteAction(data);
    if (res.success) {
      await loadTimelineData(selectedDate, true); // silent — don't flash overlay
      return true;
    }
    setInlineError(res.error || 'Failed to add calendar note');
    return false;
  }, [selectedDate, loadTimelineData]);

  const updateNote = useCallback(async (data: UpdateCalendarNoteDto) => {
    const res = await updateCalendarNoteAction(data);
    if (res.success) {
      await loadTimelineData(selectedDate, true); // silent — don't flash overlay
      return res.data || true;
    }
    setInlineError(res.error || 'Failed to update calendar note');
    return false;
  }, [selectedDate, loadTimelineData]);

  const deleteNote = useCallback(async (id: string) => {
    const res = await deleteCalendarNoteAction({ id });
    if (res.success) {
      await loadTimelineData(selectedDate, true); // silent — don't flash overlay
      return true;
    }
    setInlineError(res.error || 'Failed to delete calendar note');
    return false;
  }, [selectedDate, loadTimelineData]);

  useEffect(() => {
    loadTimelineData(selectedDate);
  }, [selectedDate, loadTimelineData]);

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
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
  };

  const selectDoctor = (doctorId: string) => {
    setSelectedDoctor(doctorId);
  };

  const selectTimeslot = (slot: { startTime: string; endTime: string }) => {
    // Slots are now HH:MM strings; extractTimePart handles both HH:MM and legacy ISO as a fallback
    const extractTimePart = (isoOrTime: string) => {
      if (!isoOrTime) return '';
      if (isoOrTime.includes('T')) {
        return isoOrTime.split('T')[1].substring(0, 5);
      }
      return isoOrTime.substring(0, 5); // already HH:MM or HH:MM:SS
    };
    setSelectedTime(extractTimePart(slot.startTime));
    setSelectedEndTime(extractTimePart(slot.endTime));
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setPatientMode('GUEST');
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
    setSelectedDoctor('');
    setSelectedTime('');
    setSelectedEndTime('');
    setPatientNote('');
    setBooked(false);
    setInlineError('');
    setConfirmationChannel('NONE');
    setSelectedAppointmentDetails(null);
  };

  const isReadyToSubmit = useMemo(() => {
    const hasSchedule = !!(selectedService && selectedDate && selectedDoctor && selectedTime && selectedEndTime);
    if (!hasSchedule) return false;
    if (patientMode === 'GUEST') return !!(firstName && lastName && phoneNumber);
    return selectedPatient !== null && (
      bookingFor === 'SELF' ||
      (bookingFor === 'EXISTING_DEP' && selectedDependent !== null) ||
      (bookingFor === 'NEW_DEP' && !!(newDepFirstName && newDepLastName && newDepDOB && newDepRelationship))
    );
  }, [selectedService, selectedDate, selectedDoctor, selectedTime, selectedEndTime, patientMode, firstName, lastName, phoneNumber, selectedPatient, bookingFor, selectedDependent, newDepFirstName, newDepLastName, newDepDOB, newDepRelationship]);

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
        ? { patientId: selectedPatient.id, serviceId: selectedService, doctorId: selectedDoctor, date: selectedDate, startTime: selectedTime, endTime: selectedEndTime, patientNote: patientNote || undefined, confirmationChannel, ...dependentPayload }
        : { serviceId: selectedService, doctorId: selectedDoctor, date: selectedDate, startTime: selectedTime, endTime: selectedEndTime, patientNote: patientNote || undefined, firstName, middleName: middleName || undefined, lastName, suffix: suffix || undefined, phoneNumber, email: email || undefined, confirmationChannel };

      const res = await createManualBookingAction(payload as any);
      if (res.success) {
        setBooked(true);
        addToast('Appointment booked successfully!', 'success');
        await loadTimelineData(selectedDate, true); // silent — don't flash overlay
      } else {
        setInlineError(res.error || 'Booking failed');
        addToast(res.error || 'Booking failed', 'error');
      }
    } catch (err: any) {
      setInlineError(err.message || 'Unexpected error');
      addToast(err.message || 'Unexpected error', 'error');
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
    setCurrentMonth, selectedDate, selectDate, selectedDoctor, selectDoctor,
    selectedTime, setSelectedTime, selectedEndTime, setSelectedEndTime, selectTimeslot, patientNote, setPatientNote, isLoadingServices,
    isLoadingDoctors: false, isLoadingSlots: false, isSubmitting,
    inlineError, booked, isReadyToSubmit, bookedPatientLabel, resetForm, submit,
    setInlineError,
    confirmationChannel, setConfirmationChannel,
    doctorsList, appointments, isLoadingAppointments, selectedAppointmentDetails, setSelectedAppointmentDetails,
    selectAppointment, loadTimelineData, loadActionResources, timelineVersion, operatingHours,
    notes, isLoadingNotes, addNote, updateNote, deleteNote
  };
}
