'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { convertInquiryAction } from '@/modules/appointments/actions/booking/convert-inquiry.action';
import { dropInquiryAction } from '@/modules/appointments/actions/booking/drop-inquiry.action';
import { getInquiriesPageAction } from '@/modules/appointments/actions/booking/get-inquiries-page.action';
import { updateInquiryAction } from '@/modules/appointments/actions/booking/update-inquiry.action';
import { useBookingScheduler } from '@/modules/appointments/hooks/shared/use-booking-scheduler';
import { searchPatientsAction } from '@/modules/patients/actions/profile/search-patients.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import type { UserProfileResponseDto } from '@/modules/staff/dtos/exports';


export type InquiryDecision = 'CONVERT' | 'DROP' | '';
export type InquiryPatientMode = 'SEARCH' | 'GUEST';
export type InquiryTab = 'NEW' | 'CONVERTED' | 'DROPPED';

export function useSecretaryInquiriesQueue() {
  const scheduler = useBookingScheduler();
  const { loadAvailableDates, loadAvailableSlots } = scheduler;
  const [allInquiries, setAllInquiries] = useState<any[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true);
  const [isRefreshingInquiries, setIsRefreshingInquiries] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
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
  const [approvalReason, setApprovalReason] = useState('');
  const [isNotesManual, setIsNotesManual] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestMiddleName, setGuestMiddleName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestSuffix, setGuestSuffix] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [confirmationChannel, setConfirmationChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>('EMAIL');
  const [patientMode, setPatientMode] = useState<InquiryPatientMode>('GUEST');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const servicesLoadedRef = useRef(false);
  const servicesLoadingRef = useRef<Promise<void> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<InquiryTab>('NEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [tabCounts, setTabCounts] = useState<Record<InquiryTab, number>>({ NEW: 0, CONVERTED: 0, DROPPED: 0 });
  const tabCacheRef = useRef<Partial<Record<InquiryTab, { items: any[]; nextCursor: string | null; hasMore: boolean; total: number }>>>({});
  const latestInquiriesRequest = useRef(0);
  const nextCursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const queryRef = useRef({ activeTab, searchTerm });
  queryRef.current = { activeTab, searchTerm };

  const inquiries = useMemo(
    () => allInquiries,
    [allInquiries]
  );

  const selectedInquiry = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === selectedInquiryId),
    [inquiries, selectedInquiryId]
  );
  const availableDates = stagedInquiryService ? scheduler.availableDates : [];
  // Full doctor list, no service/date filter — secretary picks any doctor (like Book Appointment).
  const [allDoctors, setAllDoctors] = useState<{ doctorId: string; doctorName: string }[]>([]);
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
    getDoctorsAction({ includeHidden: true }).then((res) => {
      if (res.success && res.data) {
        setAllDoctors(res.data.map((d: UserProfileResponseDto) => ({
          doctorId: d.id,
          doctorName: `Dr. ${d.firstName} ${d.lastName}`.trim(),
        })));
      }
    });
  }, []);
  const availableDoctors = allDoctors;
  const timeslots = stagedInquiryDoctor ? scheduler.availableSlots as any[] : [];
  const isAvailabilityLoading = isLoadingServices || scheduler.loadingKey !== null;

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const loadServices = useCallback(async () => {
    if (servicesLoadedRef.current) return;
    if (servicesLoadingRef.current) return servicesLoadingRef.current;
    setIsLoadingServices(true);
    const request = getServicesAction('BOOKABLE')
      .then((res) => {
        if (res.data) {
          setServices(res.data);
          servicesLoadedRef.current = true;
        } else if (res.error) {
          showToast(res.error, 'error');
        }
      })
      .catch((error) => showToast(error instanceof Error ? error.message : 'Failed to load services', 'error'))
      .finally(() => {
        servicesLoadingRef.current = null;
        setIsLoadingServices(false);
      });
    servicesLoadingRef.current = request;
    return request;
  }, []);


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

  const loadInquiries = useCallback(async (options?: { append?: boolean; force?: boolean }) => {
    const append = options?.append === true;
    const force = options?.force === true;
    if (!append && !force && !queryRef.current.searchTerm) {
      const cached = tabCacheRef.current[queryRef.current.activeTab];
      if (cached) {
        setAllInquiries(cached.items);
        setNextCursor(cached.nextCursor);
        setHasMore(cached.hasMore);
        setTabCounts((previous) => ({ ...previous, [queryRef.current.activeTab]: cached.total }));
        setInquiriesError('');
        return;
      }
    }
    if (append) {
      if (loadingMoreRef.current || !nextCursorRef.current) return;
      loadingMoreRef.current = true;
      setIsLoadingMore(true);
      setLoadMoreError(null);
    } else {
      if (hasLoadedRef.current) setIsRefreshingInquiries(true);
      else setIsLoadingInquiries(true);
      setInquiriesError('');
      setLoadMoreError(null);
      nextCursorRef.current = null;
      setNextCursor(null);
    }

    const requestId = ++latestInquiriesRequest.current;
    const currentTab = queryRef.current.activeTab;
    const search = queryRef.current.searchTerm || undefined;
    try {
      const activeRequest = getInquiriesPageAction({
        limit: 25,
        cursor: append ? nextCursorRef.current : null,
        status: currentTab,
        search,
        sortDirection: 'desc',
      });
      const otherTabs: InquiryTab[] = ['NEW', 'CONVERTED', 'DROPPED'].filter((tab) => tab !== currentTab) as InquiryTab[];
      const otherRequests = append
        ? Promise.resolve([])
        : Promise.all(otherTabs.map((status) => getInquiriesPageAction({ limit: 1, cursor: null, status, search, sortDirection: 'desc', countOnly: true })));
      const [activeResult, otherResults] = await Promise.all([activeRequest, otherRequests]);
      if (requestId !== latestInquiriesRequest.current) return;
      if (!activeResult.success || !activeResult.data) throw new Error(activeResult.error || 'Failed to load inquiries queue.');

      const page = activeResult.data;
      setAllInquiries((previous) => append
        ? [...previous, ...page.items.filter((item) => !previous.some((existing) => existing.id === item.id))]
        : page.items);
      nextCursorRef.current = page.nextCursor;
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
      setTabCounts((previous) => ({ ...previous, [currentTab]: page.total ?? page.items.length }));
      if (!append && !queryRef.current.searchTerm) {
        tabCacheRef.current[currentTab] = { items: page.items, nextCursor: page.nextCursor, hasMore: page.hasMore, total: page.total ?? page.items.length };
      }
      if (!append) {
        for (let index = 0; index < otherTabs.length; index += 1) {
          const result = otherResults[index];
          if (result?.success && result.data) {
            setTabCounts((previous) => ({ ...previous, [otherTabs[index]]: result.data.total ?? result.data.items.length }));
          }
        }
      }
      hasLoadedRef.current = true;
      if (!append) setLastRefreshedAt(new Date());
    } catch (cause) {
      if (requestId === latestInquiriesRequest.current) {
        if (append) setLoadMoreError(cause instanceof Error ? cause.message : 'Could not load more inquiries.');
        else setInquiriesError(cause instanceof Error ? cause.message : 'Failed to load inquiries queue.');
      }
    } finally {
      if (requestId === latestInquiriesRequest.current) {
        setIsLoadingInquiries(false);
        setIsRefreshingInquiries(false);
        setIsLoadingMore(false);
        loadingMoreRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    if (!searchTerm) {
        const cached = tabCacheRef.current[activeTab];
        if (cached) {
            setAllInquiries(cached.items);
            setNextCursor(cached.nextCursor);
            setHasMore(cached.hasMore);
            setTabCounts((previous) => ({ ...previous, [activeTab]: cached.total }));
            setInquiriesError('');
            return;
        }
    }
    const timeout = window.setTimeout(() => { void loadInquiries(); }, 600);
    return () => window.clearTimeout(timeout);
  }, [activeTab, searchTerm, loadInquiries]);

  useEffect(() => {
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') void loadInquiries({ force: true });
    };
    document.addEventListener('visibilitychange', refreshOnVisible);
    return () => document.removeEventListener('visibilitychange', refreshOnVisible);
  }, [loadInquiries]);

  useEffect(() => {
    if (!stagedInquiryService) return;
    const month = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    loadAvailableDates({ serviceId: stagedInquiryService, month });
  }, [stagedInquiryService, currentMonth, loadAvailableDates]);


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
    if (!inquiry) {
      setSelectedInquiryId(null);
      setStagedInquiryAction('');
      return;
    }
    setSelectedInquiryId(inquiry.id);
    void loadServices();
    setStagedInquiryAction('');
    setStagedInquiryService(inquiry.preferredServiceId);
    setStagedInquiryDate(inquiry.preferredDate || '');
    setStagedInquiryDoctor(inquiry.assignedDoctorId || '');
    const parseHHMM = (timeStr?: string | null) => {
      if (!timeStr) return '';
      if (timeStr.includes('T')) {
        const timePart = timeStr.split('T')[1];
        if (timePart) return timePart.slice(0, 5);
      }
      const match = timeStr.match(/^(\d{2}):(\d{2})/);
      if (match) return `${match[1]}:${match[2]}`;
      return '';
    };
    setStagedInquiryTime(parseHHMM(inquiry.preferredStartTime));
    setStagedInquiryEndTime(parseHHMM(inquiry.assignedEndTime));
    setStagedInquiryNote(inquiry.patientNote || '');
    setStagedSecretaryNotes('');
    setApprovalReason('');
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
    setConfirmationChannel(inquiry.confirmationChannel || inquiry.confirmation_channel || 'EMAIL');
    if (inquiry.preferredDate) {
      const parsedDate = new Date(inquiry.preferredDate);
      if (!Number.isNaN(parsedDate.getTime())) setCurrentMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
    }
  };

  const selectTab = (tab: InquiryTab) => {
    setActiveTab(tab);
    setSelectedInquiryId(null);
    setStagedInquiryAction('');
  };

  const loadMore = useCallback(() => { void loadInquiries({ append: true }); }, [loadInquiries]);

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
  };

  const selectDate = (date: string) => {
    setStagedInquiryDate(date);
  };

  const selectDoctor = (doctorId: string) => {
    setStagedInquiryDoctor(doctorId);
  };

  const selectSlot = (slot: { startTime: string; endTime: string }) => {
    const extractTimePart = (isoOrTime: string) => {
      if (!isoOrTime) return '';
      if (isoOrTime.includes('T')) {
        return isoOrTime.split('T')[1].substring(0, 5);
      }
      return isoOrTime;
    };
    setStagedInquiryTime(extractTimePart(slot.startTime));
    setStagedInquiryEndTime(extractTimePart(slot.endTime));
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

  const saveInquiryChanges = async (section: string) => {
    if (!selectedInquiryId) return;
    setInlineError('');
    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = { inquiryId: selectedInquiryId };
      if (section === 'guest') {
        payload.firstName = guestFirstName;
        payload.middleName = guestMiddleName;
        payload.lastName = guestLastName;
        payload.suffix = guestSuffix;
        payload.patientNote = stagedInquiryNote;
      } else if (section === 'contact') {
        payload.phoneNumber = guestPhone;
        payload.email = guestEmail;
      } else if (section === 'patient') {
        payload.firstName = guestFirstName;
        payload.middleName = guestMiddleName;
        payload.lastName = guestLastName;
        payload.suffix = guestSuffix;
        payload.patientNote = stagedInquiryNote;
        payload.phoneNumber = guestPhone;
        payload.email = guestEmail;
      } else if (section === 'schedule') {
        payload.serviceId = stagedInquiryService;
        payload.date = stagedInquiryDate;
        payload.startTime = stagedInquiryTime;
        payload.assignedDoctorId = stagedInquiryDoctor || null;
        payload.assignedEndTime = stagedInquiryEndTime || null;
      }
      const res = await updateInquiryAction(payload as any);
      if (res.success) {
        showToast('Changes saved', 'success');
        await loadInquiries({ force: true });
      } else {
        setInlineError(res.error || 'Failed to save changes');
        showToast(res.error || 'Failed to save changes', 'error');
      }
    } catch (err: any) {
      setInlineError(err.message || 'Failed to save changes');
      showToast(err.message || 'Failed to save changes', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveInquiryChannel = async (channel: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE') => {
    if (!selectedInquiryId) return { success: false };
    setInlineError('');
    setIsSubmitting(true);
    try {
      const res = await updateInquiryAction({ inquiryId: selectedInquiryId, confirmationChannel: channel });
      if (res.success) {
        setConfirmationChannel(channel);
        showToast('Notification channel saved', 'success');
        await loadInquiries({ force: true });
      } else {
        setInlineError(res.error || 'Failed to save notification channel');
        showToast(res.error || 'Failed to save notification channel', 'error');
      }
      return res;
    } catch (err: any) {
      setInlineError(err.message || 'Failed to save notification channel');
      showToast(err.message || 'Failed to save notification channel', 'error');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
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
          secretaryNotes: approvalReason || stagedSecretaryNotes || undefined,
          linkedPatientId: linkedPatientId || undefined,
          guestFirstName: guestFirstName || undefined,
          guestMiddleName: guestMiddleName || undefined,
          guestLastName: guestLastName || undefined,
          guestSuffix: guestSuffix || undefined,
          guestPhone: guestPhone || undefined,
          guestEmail: guestEmail || undefined,
          doctorAssignmentSource: (stagedInquiryDoctor && stagedInquiryDoctor !== 'ANY') ? 'USER' as const : 'SYSTEM' as const,
          confirmationChannel: confirmationChannel || 'EMAIL',
        };
        const res = await convertInquiryAction(payload);
        if (res.success) {
          showToast('Inquiry converted to appointment successfully', 'success');
          setSelectedInquiryId(null);
          setStagedInquiryAction('');
          await loadInquiries({ force: true });
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
          await loadInquiries({ force: true });
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
    && (stagedInquiryAction === 'CONVERT' ? !!approvalReason.trim() : !!stagedInquiryNote.trim())
    && (stagedInquiryAction === 'DROP'
      ? true
      : !!(stagedInquiryService && stagedInquiryDate && stagedInquiryDoctor && stagedInquiryTime && stagedInquiryEndTime));

  return {
    inquiries, selectedInquiry, selectedInquiryId, selectInquiry, isLoadingInquiries, isRefreshingInquiries, lastRefreshedAt, inquiriesError, loadInquiries,
    stagedInquiryAction, setDecision, stagedInquiryService, selectService, stagedInquiryDoctor, selectDoctor,
    stagedInquiryDate, selectDate, stagedInquiryTime, setStagedInquiryTime, stagedInquiryEndTime, setStagedInquiryEndTime,
    selectSlot, stagedInquiryNote, setStagedInquiryNote,
    stagedSecretaryNotes, setSecretaryNotes, approvalReason, setApprovalReason, guestFirstName, setGuestFirstName, guestMiddleName, setGuestMiddleName,
    guestLastName, setGuestLastName, guestSuffix, setGuestSuffix, guestPhone, setGuestPhone, guestEmail, setGuestEmail,
    confirmationChannel, setConfirmationChannel,
    patientMode, setPatientMode, patientSearchQuery, setPatientSearchQuery, patientSearchResults, isSearchingPatients,
    selectedPatient, selectPatient, clearPatient, services, currentMonth, setCurrentMonth, availableDates,
    availableDoctors, timeslots, isLoadingServices, isLoadingDays: scheduler.loadingKey === 'dates',
    isLoadingDoctors: scheduler.loadingKey === 'doctors', isLoadingSlots: scheduler.loadingKey === 'slots',
    isSubmitting, inlineError, toast, isAvailabilityLoading, canSubmit, submitReview, saveInquiryChanges, saveInquiryChannel,
    activeTab, setActiveTab: selectTab, tabCounts, searchTerm, setSearchTerm,
    hasMore, isLoadingMore, loadMoreError, loadMore, operatingHours
  };
}
