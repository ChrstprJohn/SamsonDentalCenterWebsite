'use client';

import { useEffect, useMemo, useState } from 'react';
import { convertInquiryAction } from '@/modules/appointments/actions/booking/convert-inquiry.action';
import { dropInquiryAction } from '@/modules/appointments/actions/booking/drop-inquiry.action';
import { getInquiriesAction } from '@/modules/appointments/actions/booking/get-inquiries.action';
import { useBookingScheduler } from '@/modules/appointments/hooks/shared/use-booking-scheduler';
import { searchPatientsAction } from '@/modules/patients/actions/profile/search-patients.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';

export type InquiryDecision = 'CONVERT' | 'DROP' | '';
export type InquiryPatientMode = 'SEARCH' | 'GUEST';

export function useSecretaryInquiriesQueue() {
  const scheduler = useBookingScheduler();
  const { loadAvailableDates, loadDoctorsForDate, loadAvailableSlots } = scheduler;
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [inquiriesError, setInquiriesError] = useState('');
  const [stagedInquiryAction, setStagedInquiryAction] = useState<InquiryDecision>('');
  const [stagedInquiryService, setStagedInquiryService] = useState('');
  const [stagedInquiryDoctor, setStagedInquiryDoctor] = useState('');
  const [stagedInquiryDate, setStagedInquiryDate] = useState('');
  const [stagedInquiryTime, setStagedInquiryTime] = useState('');
  const [stagedInquiryEndTime, setStagedInquiryEndTime] = useState('');
  const [stagedInquiryNote, setStagedInquiryNote] = useState('');
  const [linkedPatientId, setLinkedPatientId] = useState<string | null>(null);
  const [stagedSecretaryNotes, setStagedSecretaryNotes] = useState('');
  const [isNotesManual, setIsNotesManual] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestMiddleName, setGuestMiddleName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestSuffix, setGuestSuffix] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [patientMode, setPatientMode] = useState<InquiryPatientMode>('GUEST');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 5, 1));
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const selectedInquiry = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === selectedInquiryId),
    [inquiries, selectedInquiryId]
  );
  const availableDates = stagedInquiryService ? scheduler.availableDates : [];
  const availableDoctors = stagedInquiryDate ? scheduler.availableDoctors as { doctorId: string; doctorName: string }[] : [];
  const timeslots = stagedInquiryDoctor ? scheduler.availableSlots as any[] : [];
  const isAvailabilityLoading = isLoadingServices || scheduler.loadingKey !== null;

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (isNotesManual) return;
    if (stagedInquiryAction === 'CONVERT') {
      if (patientMode === 'SEARCH' && selectedPatient) {
        setStagedSecretaryNotes(`Inquiry converted and linked to registered patient: ${selectedPatient.firstName} ${selectedPatient.lastName} (${selectedPatient.email})`);
      } else {
        setStagedSecretaryNotes('Inquiry converted to confirmed appointment (Guest)');
      }
    } else if (stagedInquiryAction === 'DROP') {
      setStagedSecretaryNotes('Inquiry dropped/archived by clinic staff');
    }
  }, [patientMode, selectedPatient, stagedInquiryAction, isNotesManual]);

  const loadInquiries = async () => {
    setIsLoadingInquiries(true);
    setInquiriesError('');
    const res = await getInquiriesAction();
    setIsLoadingInquiries(false);
    if (res.success && res.data) setInquiries(res.data);
    else setInquiriesError(res.error || 'Failed to load inquiries queue.');
  };

  useEffect(() => { loadInquiries(); }, []);

  useEffect(() => {
    async function loadServices() {
      setIsLoadingServices(true);
      const res = await getServicesAction('BOOKABLE');
      setIsLoadingServices(false);
      if (res.data) setServices(res.data);
      else if (res.error) showToast(res.error, 'error');
    }
    loadServices();
  }, []);

  useEffect(() => {
    if (!stagedInquiryService) return;
    const month = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    loadAvailableDates({ serviceId: stagedInquiryService, month });
  }, [stagedInquiryService, currentMonth, loadAvailableDates]);

  useEffect(() => {
    if (!stagedInquiryDate || !stagedInquiryService) return;
    loadDoctorsForDate({ date: stagedInquiryDate, serviceId: stagedInquiryService });
  }, [stagedInquiryDate, stagedInquiryService, loadDoctorsForDate]);

  useEffect(() => {
    if (!stagedInquiryService || !stagedInquiryDoctor || !stagedInquiryDate) return;
    loadAvailableSlots({ serviceId: stagedInquiryService, doctorId: stagedInquiryDoctor, date: stagedInquiryDate });
  }, [stagedInquiryService, stagedInquiryDoctor, stagedInquiryDate, loadAvailableSlots]);

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

  const selectInquiry = (inquiry: any) => {
    setSelectedInquiryId(inquiry.id);
    setStagedInquiryAction('CONVERT');
    setStagedInquiryService(inquiry.preferredServiceId);
    setStagedInquiryDate('');
    setStagedInquiryDoctor('');
    setStagedInquiryTime('');
    setStagedInquiryEndTime('');
    setStagedInquiryNote(inquiry.patientNote || '');
    setStagedSecretaryNotes('');
    setIsNotesManual(false);
    setLinkedPatientId(null);
    setPatientMode('GUEST');
    setSelectedPatient(null);
    setPatientSearchQuery('');
    setGuestFirstName(inquiry.firstName);
    setGuestMiddleName(inquiry.middleName || '');
    setGuestLastName(inquiry.lastName);
    setGuestSuffix(inquiry.suffix || '');
    setGuestPhone(inquiry.phoneNumber);
    setGuestEmail(inquiry.email);
    if (inquiry.preferredDate) {
      const parsedDate = new Date(inquiry.preferredDate);
      if (!Number.isNaN(parsedDate.getTime())) setCurrentMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
    }
  };

  const setDecision = (decision: InquiryDecision) => {
    setStagedInquiryAction(decision);
    if (decision === 'DROP') {
      setLinkedPatientId(null);
      setSelectedPatient(null);
      setStagedInquiryNote('');
    }
  };

  const selectService = (serviceId: string) => {
    setStagedInquiryService(serviceId);
    setStagedInquiryDate('');
    setStagedInquiryDoctor('');
    setStagedInquiryTime('');
    setStagedInquiryEndTime('');
  };

  const selectDate = (date: string) => {
    setStagedInquiryDate(date);
    setStagedInquiryDoctor('');
    setStagedInquiryTime('');
    setStagedInquiryEndTime('');
  };

  const selectDoctor = (doctorId: string) => {
    setStagedInquiryDoctor(doctorId);
    setStagedInquiryTime('');
    setStagedInquiryEndTime('');
  };

  const selectSlot = (slot: { startTime: string; endTime: string }) => {
    setStagedInquiryTime(slot.startTime);
    setStagedInquiryEndTime(slot.endTime);
  };

  const selectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setLinkedPatientId(patient.id);
  };

  const clearPatient = () => {
    setSelectedPatient(null);
    setLinkedPatientId(null);
  };

  const setSecretaryNotes = (notes: string) => {
    setStagedSecretaryNotes(notes);
    setIsNotesManual(true);
  };

  const submitReview = async (inquiryId: string) => {
    if (!stagedInquiryAction) {
      showToast('Please select review decision action first', 'error');
      return;
    }
    setInlineError('');
    setIsSubmitting(true);
    try {
      if (stagedInquiryAction === 'CONVERT') {
        const payload = {
          inquiryId,
          serviceId: stagedInquiryService,
          doctorId: stagedInquiryDoctor,
          date: stagedInquiryDate,
          startTime: stagedInquiryTime,
          endTime: stagedInquiryEndTime,
          patientNote: stagedInquiryNote || undefined,
          secretaryNotes: stagedSecretaryNotes || undefined,
          linkedPatientId: linkedPatientId || undefined,
          guestFirstName: guestFirstName || undefined,
          guestMiddleName: guestMiddleName || undefined,
          guestLastName: guestLastName || undefined,
          guestSuffix: guestSuffix || undefined,
          guestPhone: guestPhone || undefined,
          guestEmail: guestEmail || undefined,
          doctorAssignmentSource: (stagedInquiryDoctor && stagedInquiryDoctor !== 'ANY') ? 'USER' as const : 'SYSTEM' as const,
        };
        const res = await convertInquiryAction(payload);
        if (res.success) {
          showToast('Inquiry converted to appointment successfully', 'success');
          setSelectedInquiryId(null);
          setStagedInquiryAction('');
          await loadInquiries();
        } else {
          setInlineError(res.error || 'Conversion failed');
          showToast(res.error || 'Failed to convert inquiry', 'error');
        }
      } else {
        const res = await dropInquiryAction({ inquiryId, secretaryNotes: stagedInquiryNote || undefined });
        if (res.success) {
          showToast('Inquiry dropped successfully', 'success');
          setSelectedInquiryId(null);
          setStagedInquiryAction('');
          await loadInquiries();
        } else {
          setInlineError(res.error || 'Failed to drop inquiry');
          showToast(res.error || 'Failed to drop inquiry', 'error');
        }
      }
    } catch (err: any) {
      setInlineError(err.message || 'An unexpected error occurred');
      showToast(err.message || 'An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !isSubmitting
    && !isAvailabilityLoading
    && !!stagedInquiryAction
    && (stagedInquiryAction === 'DROP'
      ? !!stagedInquiryNote.trim()
      : !!(stagedInquiryService && stagedInquiryDate && stagedInquiryDoctor && stagedInquiryTime));

  return {
    inquiries, selectedInquiry, selectedInquiryId, selectInquiry, isLoadingInquiries, inquiriesError, loadInquiries,
    stagedInquiryAction, setDecision, stagedInquiryService, selectService, stagedInquiryDoctor, selectDoctor,
    stagedInquiryDate, selectDate, stagedInquiryTime, selectSlot, stagedInquiryNote, setStagedInquiryNote,
    stagedSecretaryNotes, setSecretaryNotes, guestFirstName, setGuestFirstName, guestMiddleName, setGuestMiddleName,
    guestLastName, setGuestLastName, guestSuffix, setGuestSuffix, guestPhone, setGuestPhone, guestEmail, setGuestEmail,
    patientMode, setPatientMode, patientSearchQuery, setPatientSearchQuery, patientSearchResults, isSearchingPatients,
    selectedPatient, selectPatient, clearPatient, services, currentMonth, setCurrentMonth, availableDates,
    availableDoctors, timeslots, isLoadingServices, isLoadingDays: scheduler.loadingKey === 'dates',
    isLoadingDoctors: scheduler.loadingKey === 'doctors', isLoadingSlots: scheduler.loadingKey === 'slots',
    isSubmitting, inlineError, toast, isAvailabilityLoading, canSubmit, submitReview,
  };
}
