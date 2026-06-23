// src/app/(portals)/secretary/inquiries/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Real Server Actions
import { getInquiriesAction } from '@/modules/appointments/actions/booking/get-inquiries.action';
import { convertInquiryAction } from '@/modules/appointments/actions/booking/convert-inquiry.action';
import { dropInquiryAction } from '@/modules/appointments/actions/booking/drop-inquiry.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getAvailableDaysAction } from '@/modules/appointments/actions/availability/get-available-days.action';
import { getAvailableDoctorsForDateAction } from '@/modules/appointments/actions/availability/get-available-doctors-for-date.action';
import { getAvailableTimeSlotsAction } from '@/modules/appointments/actions/availability/get-available-time-slots.action';
import { searchPatientsAction } from '@/modules/patients/actions/profile/search-patients.action';

export default function InquiriesQueuePage() {
  // Live Inquiries list state
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [inquiriesError, setInquiriesError] = useState('');

  // Form selections for Inquiries Conversion Pane
  const [stagedInquiryAction, setStagedInquiryAction] = useState<'CONVERT' | 'DROP' | ''>('');
  const [stagedInquiryService, setStagedInquiryService] = useState('');
  const [stagedInquiryDoctor, setStagedInquiryDoctor] = useState('');
  const [stagedInquiryDate, setStagedInquiryDate] = useState('');
  const [stagedInquiryTime, setStagedInquiryTime] = useState('');
  const [stagedInquiryEndTime, setStagedInquiryEndTime] = useState('');
  const [stagedInquiryNote, setStagedInquiryNote] = useState('');
  const [linkedPatientId, setLinkedPatientId] = useState<string | null>(null);
  const [stagedSecretaryNotes, setStagedSecretaryNotes] = useState('');
  const [isNotesManual, setIsNotesManual] = useState(false);

  // Guest edit profile state
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestMiddleName, setGuestMiddleName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestSuffix, setGuestSuffix] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Patient Search Stepper/Toggle States
  const [patientMode, setPatientMode] = useState<'SEARCH' | 'GUEST'>('GUEST');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  useEffect(() => {
    if (isNotesManual) return;
    if (stagedInquiryAction === 'CONVERT') {
      if (patientMode === 'SEARCH' && selectedPatient) {
        setStagedSecretaryNotes(`Inquiry converted and linked to registered patient: ${selectedPatient.firstName} ${selectedPatient.lastName} (${selectedPatient.email})`);
      } else {
        setStagedSecretaryNotes(`Inquiry converted to confirmed appointment (Guest)`);
      }
    } else if (stagedInquiryAction === 'DROP') {
      setStagedSecretaryNotes(`Inquiry dropped/archived by clinic staff`);
    }
  }, [patientMode, selectedPatient, stagedInquiryAction, isNotesManual]);

  // Dynamic States for API Data Integration
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 5, 1)); // Default June 2026
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<{ doctorId: string; doctorName: string }[]>([]);
  const [timeslots, setTimeslots] = useState<any[]>([]);

  // Loading / Submit States
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingDays, setIsLoadingDays] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error Messages & Toast
  const [inlineError, setInlineError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load Inquiries List
  async function loadInquiries() {
    setIsLoadingInquiries(true);
    setInquiriesError('');
    const res = await getInquiriesAction();
    setIsLoadingInquiries(false);
    if (res.success && res.data) {
      setInquiries(res.data);
    } else {
      setInquiriesError(res.error || 'Failed to load inquiries queue.');
    }
  }

  // Load inquiries on mount
  useEffect(() => {
    loadInquiries();
  }, []);

  // Load services on mount
  useEffect(() => {
    async function loadServices() {
      setIsLoadingServices(true);
      const res = await getServicesAction();
      setIsLoadingServices(false);
      if (res.data) {
        setServices(res.data);
      } else if (res.error) {
        showToast(res.error, 'error');
      }
    }
    loadServices();
  }, []);

  // Fetch available days whenever selected service or month changes
  useEffect(() => {
    if (!stagedInquiryService) {
      setAvailableDates([]);
      return;
    }
    let active = true;
    async function loadDays() {
      setIsLoadingDays(true);
      const monthStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
      const res = await getAvailableDaysAction({
        serviceId: stagedInquiryService,
        month: monthStr,
      });
      if (active) {
        setIsLoadingDays(false);
        if (res.success && res.data) {
          setAvailableDates(res.data.availableDates || []);
        } else {
          setAvailableDates([]);
        }
      }
    }
    loadDays();
    return () => {
      active = false;
    };
  }, [stagedInquiryService, currentMonth]);

  // Fetch available doctors when date or service changes
  useEffect(() => {
    if (!stagedInquiryDate || !stagedInquiryService) {
      setAvailableDoctors([]);
      return;
    }
    let active = true;
    async function loadDoctors() {
      setIsLoadingDoctors(true);
      const res = await getAvailableDoctorsForDateAction({
        date: stagedInquiryDate,
        serviceId: stagedInquiryService,
      });
      if (active) {
        setIsLoadingDoctors(false);
        if (res.success && res.data) {
          setAvailableDoctors(res.data);
        } else {
          setAvailableDoctors([]);
        }
      }
    }
    loadDoctors();
    return () => {
      active = false;
    };
  }, [stagedInquiryDate, stagedInquiryService]);

  // Fetch available timeslots when doctor selection changes
  useEffect(() => {
    if (!stagedInquiryService || !stagedInquiryDoctor || !stagedInquiryDate) {
      setTimeslots([]);
      return;
    }
    let active = true;
    async function loadSlots() {
      setIsLoadingSlots(true);
      const res = await getAvailableTimeSlotsAction({
        serviceId: stagedInquiryService,
        doctorId: stagedInquiryDoctor,
        date: stagedInquiryDate,
      });
      if (active) {
        setIsLoadingSlots(false);
        if (res.success && res.data) {
          setTimeslots(res.data.availableSlots || []);
        } else {
          setTimeslots([]);
        }
      }
    }
    loadSlots();
    return () => {
      active = false;
    };
  }, [stagedInquiryService, stagedInquiryDoctor, stagedInquiryDate]);

  // Debounced Patient Search
  useEffect(() => {
    if (patientSearchQuery.trim().length < 2) {
      setPatientSearchResults([]);
      return;
    }
    let active = true;
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingPatients(true);
      const res = await searchPatientsAction({ query: patientSearchQuery });
      if (active) {
        setIsSearchingPatients(false);
        if (res.success && res.data) {
          setPatientSearchResults(res.data);
        } else {
          setPatientSearchResults([]);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [patientSearchQuery]);

  // Submit Handler
  const handleSubmitReview = async (inqId: string) => {
    if (!stagedInquiryAction) {
      showToast('Please select review decision action first', 'error');
      return;
    }
    setInlineError('');
    setIsSubmitting(true);

    try {
      if (stagedInquiryAction === 'CONVERT') {
        const payload = {
          inquiryId: inqId,
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
        };

        const res = await convertInquiryAction(payload);
        if (res.success) {
          showToast('Inquiry converted to appointment successfully', 'success');
          // Clear selections
          setSelectedInquiryId(null);
          setStagedInquiryAction('');
          await loadInquiries();
        } else {
          setInlineError(res.error || 'Conversion failed');
          showToast(res.error || 'Failed to convert inquiry', 'error');
        }
      } else {
        // DROP Action
        const payload = {
          inquiryId: inqId,
          secretaryNotes: stagedInquiryNote || undefined,
        };

        const res = await dropInquiryAction(payload);
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

  const selectedInq = inquiries.find((i) => i.id === selectedInquiryId);

  // Calendar Helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => i);
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const formatTimeLabel = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      });
    } catch {
      return isoStr;
    }
  };

  const isAvailabilityLoading = isLoadingServices || isLoadingDays || isLoadingDoctors || isLoadingSlots;

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Inquiries Queue</h1>
        <p className="text-xs text-text-muted">
          Manage guest inquiries. Convert them directly into appointments or drop/archive the records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left Column - Inquiries Table */}
        <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-bold text-text-primary">
              Active Inquiries ({inquiries.length})
            </div>
            {inquiriesError && (
              <button
                onClick={loadInquiries}
                className="text-[10px] text-primary-start font-bold uppercase hover:underline"
              >
                🔄 Retry
              </button>
            )}
          </div>

          <div className="overflow-x-auto flex-1">
            {isLoadingInquiries ? (
              <div className="flex flex-col gap-2.5 p-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-secondary-bg/25 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : inquiriesError ? (
              <div className="py-12 text-center text-xs text-rose-500 font-semibold bg-rose-500/5 rounded-2xl border border-rose-500/10">
                ⚠️ {inquiriesError}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted">
                No active inquiries found.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">Guest Name</th>
                    <th className="py-3 px-2">Service</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => {
                        setSelectedInquiryId(inq.id);
                        setStagedInquiryAction('CONVERT');
                        setStagedInquiryService(inq.preferredServiceId);
                        setStagedInquiryDate('');
                        setStagedInquiryDoctor('');
                        setStagedInquiryTime('');
                        setStagedInquiryEndTime('');
                        setStagedInquiryNote(inq.patientNote || '');
                        setStagedSecretaryNotes('');
                        setIsNotesManual(false);
                        setLinkedPatientId(null);
                        setPatientMode('GUEST');
                        setSelectedPatient(null);
                        setPatientSearchQuery('');
                        setGuestFirstName(inq.firstName);
                        setGuestMiddleName(inq.middleName || '');
                        setGuestLastName(inq.lastName);
                        setGuestSuffix(inq.suffix || '');
                        setGuestPhone(inq.phoneNumber);
                        setGuestEmail(inq.email);

                        if (inq.preferredDate) {
                          const parsedDate = new Date(inq.preferredDate);
                          if (!isNaN(parsedDate.getTime())) {
                            setCurrentMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
                          }
                        }
                      }}
                      className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${
                        selectedInquiryId === inq.id ? 'bg-secondary-bg/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-2 font-semibold text-text-primary">
                        {inq.firstName} {inq.middleName ? `${inq.middleName} ` : ''}{inq.lastName} {inq.suffix || ''}
                      </td>
                      <td className="py-3.5 px-2 text-text-secondary">{inq.preferredServiceName}</td>
                      <td className="py-3.5 px-2 text-text-muted font-medium">{inq.preferredDate}</td>
                      <td className="py-3.5 px-2 text-text-muted">{inq.phoneNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column - Details Pane */}
        <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-6 shadow-md overflow-y-auto max-h-[75vh] flex flex-col gap-4 justify-between min-h-[400px]">
          {selectedInq ? (
            <div className="flex flex-col gap-4 h-full justify-between">
              <div className="flex flex-col gap-4">
                {inlineError && (
                  <div className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    ⚠️ Error: {inlineError}
                  </div>
                )}

                {/* 1. Guest Profile Card */}
                <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex justify-between items-center">
                    <span>👤 Guest Profile Details</span>
                    <span className="text-[9px] bg-primary-start/15 text-primary-start px-2 py-0.5 rounded-md font-black uppercase">
                      Editable
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-text-muted uppercase">First Name</label>
                      <Input
                        type="text"
                        value={guestFirstName}
                        onChange={(e) => setGuestFirstName(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-text-muted uppercase">Middle Name</label>
                      <Input
                        type="text"
                        value={guestMiddleName}
                        onChange={(e) => setGuestMiddleName(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-text-muted uppercase">Last Name</label>
                      <Input
                        type="text"
                        value={guestLastName}
                        onChange={(e) => setGuestLastName(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-text-muted uppercase">Suffix</label>
                      <Input
                        type="text"
                        value={guestSuffix}
                        onChange={(e) => setGuestSuffix(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-text-muted uppercase">Phone</label>
                      <Input
                        type="text"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-text-muted uppercase">Email</label>
                      <Input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Review Decision Selector */}
                <div className="border border-card-border/80 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-2">
                  <span className="text-xs font-black text-text-primary uppercase tracking-wider">🎯 Decision Action</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStagedInquiryAction('CONVERT')}
                      className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all flex items-center justify-center gap-2 ${
                        stagedInquiryAction === 'CONVERT'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50 shadow-sm font-black'
                          : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <span>🔄</span> Convert to Appointment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStagedInquiryAction('DROP');
                        setLinkedPatientId(null);
                        setSelectedPatient(null);
                        setStagedInquiryNote('');
                      }}
                      className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all flex items-center justify-center gap-2 ${
                        stagedInquiryAction === 'DROP'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/50 shadow-sm font-black'
                          : 'border-card-border bg-card text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <span>🗑️</span> Drop Inquiry
                    </button>
                  </div>
                </div>

                {/* 3. Initial Request Info */}
                <div className="border border-card-border bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-2 text-xs">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    📋 Initial Request Context
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-secondary">
                    <div>
                      <span className="text-text-muted">Requested Service:</span>{' '}
                      <span className="font-semibold text-text-primary">{selectedInq.preferredServiceName}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Requested Date:</span>{' '}
                      <span className="font-semibold text-text-primary">{selectedInq.preferredDate}</span>
                    </div>
                  </div>
                  {selectedInq.patientNote && (
                    <div className="mt-1 text-[11px] italic text-text-muted bg-card p-2 rounded-lg border border-card-border/40">
                      "{selectedInq.patientNote}"
                    </div>
                  )}
                </div>

                {/* Decision Panel Details */}
                {stagedInquiryAction === 'CONVERT' ? (
                  <div className="flex flex-col gap-3 animate-fadeIn">
                    
                    {/* Service Selection Card */}
                    <div className="border border-card-border/60 rounded-2xl p-4 bg-secondary-bg/10 flex flex-col gap-2">
                      <label className="text-[9px] font-bold text-text-secondary uppercase">Staged Clinic Service</label>
                      {isLoadingServices ? (
                        <div className="text-xs text-text-muted animate-pulse">Loading clinic services...</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {services.map((srv) => (
                            <button
                              key={srv.id}
                              type="button"
                              onClick={() => {
                                setStagedInquiryService(srv.id);
                                setStagedInquiryDate('');
                                setStagedInquiryDoctor('');
                                setStagedInquiryTime('');
                                setStagedInquiryEndTime('');
                                setTimeslots([]);
                              }}
                              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                                stagedInquiryService === srv.id
                                  ? 'bg-primary-start text-white border-primary-start shadow-sm'
                                  : 'bg-card border-card-border text-text-secondary hover:text-text-primary'
                              }`}
                            >
                              {srv.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Schedule Details Card */}
                    <div className="border border-card-border/60 rounded-2xl p-4 bg-secondary-bg/10 flex flex-col gap-5">
                      
                      {/* Step A: Visual Calendar Grid */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Select Date</label>
                        <div className="p-3 bg-card border border-card-border rounded-2xl">
                          
                          {/* Calendar Navigation Header */}
                          <div className="flex justify-between items-center text-xs text-text-primary mb-3 font-bold bg-secondary-bg/10 p-2 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                              className="px-2.5 py-1 rounded hover:bg-secondary-bg/40 font-bold"
                            >
                              ◀ Prev
                            </button>
                            <div className="font-extrabold uppercase tracking-wide">{monthLabel}</div>
                            <button
                              type="button"
                              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                              className="px-2.5 py-1 rounded hover:bg-secondary-bg/40 font-bold"
                            >
                              Next ▶
                            </button>
                          </div>

                          {isLoadingDays ? (
                            <div className="text-center text-xs text-text-muted py-6 animate-pulse">Scanning available dates...</div>
                          ) : (
                            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                                <div key={`${d}-${idx}`} className="font-bold text-text-muted py-1">{d}</div>
                              ))}
                              {blankDays.map((_, idx) => (
                                <div key={`blank-${idx}`} className="py-1.5" />
                              ))}
                              {daysArray.map((d) => {
                                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                                const isAvailable = availableDates.includes(dateStr);
                                const isSelected = stagedInquiryDate === dateStr;
                                return (
                                  <button
                                    key={d}
                                    type="button"
                                    disabled={!isAvailable}
                                    onClick={() => {
                                      setStagedInquiryDate(dateStr);
                                      setStagedInquiryDoctor('');
                                      setStagedInquiryTime('');
                                      setStagedInquiryEndTime('');
                                      setTimeslots([]);
                                    }}
                                    className={`py-1.5 rounded-lg font-semibold transition-colors ${
                                      isSelected
                                        ? 'bg-primary-start text-white hover:bg-primary-start'
                                        : isAvailable
                                        ? 'text-text-secondary hover:bg-secondary-bg/50 cursor-pointer font-bold border border-emerald-500/20 bg-emerald-500/5'
                                        : 'text-text-muted/40 opacity-40 cursor-not-allowed'
                                    }`}
                                  >
                                    {d}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step B: Doctor Cards */}
                      {stagedInquiryDate && (
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
                                const isSelected = stagedInquiryDoctor === doc.doctorId;
                                return (
                                  <div
                                    key={doc.doctorId}
                                    onClick={() => {
                                      if (isLoadingDoctors) return;
                                      setStagedInquiryDoctor(doc.doctorId);
                                      setStagedInquiryTime('');
                                      setStagedInquiryEndTime('');
                                      setTimeslots([]);
                                    }}
                                    className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col gap-1 ${
                                      isSelected
                                        ? 'bg-primary-start/10 border-primary-start/50'
                                        : 'bg-card border-card-border hover:border-text-muted/30'
                                    } ${isLoadingDoctors ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                      {/* Step C: Timeslots Grid */}
                      {stagedInquiryDoctor && (
                        <div className="flex flex-col gap-2 animate-fadeIn relative">
                          <label className="text-[10px] font-bold text-text-secondary uppercase">Timeslot</label>
                          {isLoadingSlots && (
                            <div className="absolute inset-0 bg-card/60 z-10 flex items-center justify-center rounded-xl">
                              <span className="text-xs font-bold text-primary-start animate-pulse">Retrieving slots...</span>
                            </div>
                          )}
                          {timeslots.length === 0 && !isLoadingSlots ? (
                            <div className="text-xs text-text-muted p-3 bg-secondary-bg/10 rounded-xl">
                              No available timeslots for this dentist on this date.
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2">
                              {timeslots.map((slot) => {
                                const isSelected = stagedInquiryTime === slot.startTime;
                                return (
                                  <button
                                    key={slot.startTime}
                                    type="button"
                                    disabled={isLoadingSlots}
                                    onClick={() => {
                                      setStagedInquiryTime(slot.startTime);
                                      setStagedInquiryEndTime(slot.endTime);
                                    }}
                                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                                      isSelected
                                        ? 'bg-primary-start text-white border-primary-start shadow-sm'
                                        : 'border-card-border bg-card text-text-secondary hover:text-text-primary'
                                    } ${isLoadingSlots ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                    {/* Patient identity linking toggle & search */}
                    <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-3">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Patient Linking Options</label>
                      
                      <div className="flex bg-secondary-bg/25 p-1 rounded-xl gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPatientMode('GUEST');
                            setLinkedPatientId(null);
                            setSelectedPatient(null);
                            setPatientSearchQuery('');
                          }}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            patientMode === 'GUEST'
                              ? 'bg-card text-text-primary shadow-sm'
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          👤 Continue as Guest
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPatientMode('SEARCH');
                          }}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            patientMode === 'SEARCH'
                              ? 'bg-card text-text-primary shadow-sm'
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          🔍 Search Existing Patient
                        </button>
                      </div>

                      {patientMode === 'SEARCH' && (
                        <div className="flex flex-col gap-3 mt-1">
                          {!selectedPatient ? (
                            <>
                              <div className="relative">
                                <Input
                                  type="search"
                                  placeholder="Search name or email..."
                                  value={patientSearchQuery}
                                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                                  className="text-xs pr-8"
                                />
                                {isSearchingPatients && (
                                  <span className="absolute right-2.5 top-2.5 text-xs text-text-muted animate-spin">
                                    ⌛
                                  </span>
                                )}
                              </div>

                              {patientSearchResults.length > 0 ? (
                                <div className="max-h-48 overflow-y-auto border border-card-border/60 rounded-xl bg-card divide-y divide-card-border/40 text-xs">
                                  {patientSearchResults.map((pat) => (
                                    <div
                                      key={pat.id}
                                      onClick={() => {
                                        setSelectedPatient(pat);
                                        setLinkedPatientId(pat.id);
                                      }}
                                      className="p-2.5 hover:bg-secondary-bg/20 cursor-pointer flex justify-between items-center transition-colors"
                                    >
                                      <div>
                                        <div className="font-semibold text-text-primary">
                                          {pat.firstName} {pat.lastName}
                                        </div>
                                        <div className="text-[10px] text-text-muted">{pat.email}</div>
                                      </div>
                                      <div className="text-[10px] text-text-muted font-mono">
                                        {pat.phoneNumber}
                                      </div>
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
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                                  Linked Account
                                </span>
                                <span className="text-xs font-semibold text-text-primary">
                                  {selectedPatient.firstName} {selectedPatient.lastName}
                                </span>
                                <span className="text-[10px] text-text-muted block">
                                  {selectedPatient.email}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPatient(null);
                                  setLinkedPatientId(null);
                                }}
                                className="text-xs font-bold text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                              >
                                Clear
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Secretary Call Notes */}
                    <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-2">
                      <label className="text-xs font-bold text-text-primary uppercase">Secretary Call Notes (Status Reason)</label>
                      <textarea
                        value={stagedSecretaryNotes}
                        onChange={(e) => {
                          setStagedSecretaryNotes(e.target.value);
                          setIsNotesManual(true);
                        }}
                        placeholder="Add notes about the conversion or call details..."
                        rows={3}
                        className="w-full text-xs p-3 rounded-xl border border-card-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-start/50"
                      />
                    </div>
                  </div>
                ) : stagedInquiryAction === 'DROP' ? (
                  <div className="flex flex-col gap-3 animate-fadeIn">
                    {/* Reason for dropping */}
                    <div className="border border-card-border bg-rose-500/5 rounded-2xl p-4 flex flex-col gap-2">
                      <label className="text-xs font-bold text-text-primary uppercase">Reason for Dropping *</label>
                      <textarea
                        value={stagedInquiryNote}
                        onChange={(e) => setStagedInquiryNote(e.target.value)}
                        placeholder="Please specify why this inquiry is being dropped/rejected..."
                        rows={4}
                        className="w-full text-xs p-3 rounded-xl border border-card-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-start/50"
                      />
                      <span className="text-[10px] text-text-muted">
                        * Required field for drop auditing.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-card-border rounded-2xl p-8 text-center text-xs text-text-muted">
                    Choose a decision action above to begin processing this inquiry.
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="border-t border-card-border/80 pt-4 flex flex-col gap-3 mt-auto">
                <Button
                  onClick={() => handleSubmitReview(selectedInq.id)}
                  disabled={
                    isSubmitting ||
                    isAvailabilityLoading ||
                    !stagedInquiryAction ||
                    (stagedInquiryAction === 'CONVERT' && (!stagedInquiryService || !stagedInquiryDate || !stagedInquiryDoctor || !stagedInquiryTime)) ||
                    (stagedInquiryAction === 'DROP' && !stagedInquiryNote.trim())
                  }
                  variant="primary"
                  className="w-full text-xs font-bold py-3 mt-2"
                >
                  {isSubmitting ? 'Processing...' : 'Finish Inquiry Review'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
              Select an active guest inquiry from the table to start reviewing details.
            </div>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slideUp ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
