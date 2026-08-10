'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ChevronRight, CheckCircle2, Link2 } from 'lucide-react';
import Link from 'next/link';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { useBookingWizard } from '../hooks/landing/use-booking-wizard';
import { ContactCalendar } from '../components/landing/sub-components/contact-calendar';
import {
  NameFields,
  ContactFields,
  PreferenceFields,
  NotesField,
} from '../components/landing/sub-components/contact-form-fields';

interface BookingWizardViewProps {
  services: ServiceResponseDto[];
  config: ClinicConfigResponseDto;
  initialServiceId?: string;
}

export function BookingWizardView({ services, config, initialServiceId }: BookingWizardViewProps) {
  const wizard = useBookingWizard({ services, config, initialServiceId });
  const { step, contactSection, fields, isSubmitting, redirectCountdown, submittedReference, selectService } = wizard;
  const [filterType, setFilterType] = useState<'ALL' | 'GENERAL' | 'SPECIALIZED'>('ALL');
  const [formTouched, setFormTouched] = useState(false);

  const selectedService = services.find((s) => s.id === contactSection.pathway);

  const filteredServices = services.filter((srv) => {
    if (filterType === 'ALL') return true;
    return srv.serviceType === filterType;
  });

  const clinicName = config.clinicName;
  const clinicPhone = config.phone;

  const selectedDayHours = (() => {
    if (!contactSection.targetDate) return null;
    const weekday = new Date(`${contactSection.targetDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof config.operatingHours;
    return config.operatingHours[weekday];
  })();
  const isSelectedDayOpen = Boolean(selectedDayHours?.isOpen && selectedDayHours.openTime && selectedDayHours.closeTime);
  const unavailableRanges = selectedDayHours?.breakStartTime && selectedDayHours.breakEndTime
    ? [{ start: selectedDayHours.breakStartTime, end: selectedDayHours.breakEndTime }]
    : [];

  const formatTimeRange = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour = hours % 12 || 12;
    return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Recalculate page dimensions and scroll to top when changing steps or filter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(0, { immediate: true });
        (window as any).lenis.resize();
      }

      // Fire multiple resizes as Framer Motion transitions run
      const t1 = setTimeout(() => (window as any).lenis?.resize(), 50);
      const t2 = setTimeout(() => (window as any).lenis?.resize(), 150);
      const t3 = setTimeout(() => (window as any).lenis?.resize(), 300);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [step, filterType, contactSection.targetDate]);

  if (!config.isBookingOpen) {
    return (
      <main className="min-h-screen bg-[#FDFDFD] px-6 py-24 text-center text-[#1D1E1E]">
        <div className="mx-auto max-w-xl border border-amber-200 bg-amber-50 p-8">
          <h1 className="text-2xl font-semibold">Online Booking Is Currently Closed</h1>
          <p className="mt-3 text-sm text-gray-700">{config.maintenanceMessage || `Please contact ${config.clinicName} directly to arrange your appointment.`}</p>
          <p className="mt-5 text-sm font-medium">{config.phone}</p>
          <Link href="/" className="mt-6 inline-block bg-[#1D1E1E] px-6 py-3 text-sm font-semibold tracking-wider text-white">Return to Home</Link>
        </div>
      </main>
    );
  }

  const handleCardClick = (serviceId: string) => {
    selectService(serviceId);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        if ((window as any).lenis) {
          (window as any).lenis.resize();
        }
        const bottomButton = document.getElementById('step-1-next-btn');
        if (bottomButton) {
          if ((window as any).lenis) {
            (window as any).lenis.scrollTo(bottomButton, { offset: -100 });
          } else {
            bottomButton.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }
      }
    }, 100);
  };

  const handleDateSelect = (date: string) => {
    contactSection.setTargetDate(date);
    // A time selected on another weekday must never carry over to this day.
    fields.setPreferredStartTime('');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const timeElement = document.getElementById('step-2-time-picker');
        if (timeElement) {
          if ((window as any).lenis) {
            (window as any).lenis.scrollTo(timeElement, { offset: -100 });
          } else {
            timeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }, 50);
  };

  const handleTimeSelect = (timeStr: string) => {
    fields.setPreferredStartTime(timeStr);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const nextButton = document.getElementById('step-2-next-btn');
        if (nextButton) {
          if ((window as any).lenis) {
            (window as any).lenis.scrollTo(nextButton, { offset: -100 });
          } else {
            nextButton.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1D1E1E] flex flex-col justify-between">
      {/* Custom Integrated Header Navbar matching Homepage Navbar Height & Padding */}
      {!contactSection.submittedLocal && (
        <header className="sticky top-0 z-40 h-[76px] bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-6 sm:px-12 py-2.5 flex items-center shadow-xs">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          {/* Left: Slightly Larger Return Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-sm font-medium text-gray-700 hover:text-[#D94E4E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          {/* Center: Centered Stepper Navigation Pills with boxed number badge */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-3 sm:gap-4 font-sans text-[13px] tracking-[0.1em] font-medium uppercase text-gray-700">
              <button
                type="button"
                onClick={() => wizard.handleStepClick(1)}
                className={`flex items-center gap-2 py-1 transition-all cursor-pointer text-xs sm:text-sm ${
                  step === 1
                    ? 'text-gray-900 font-semibold'
                    : step > 1
                    ? 'text-emerald-700 font-medium'
                    : 'text-gray-500 font-normal'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-none flex items-center justify-center text-xs font-bold shrink-0 leading-none transition-all ${
                    step === 1
                      ? 'bg-[#1D1E1E] text-white shadow-xs'
                      : step > 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 border border-gray-300 text-gray-600'
                  }`}
                >
                  {step > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                </span>
                <span>Service</span>
              </button>

              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />

              <button
                type="button"
                onClick={() => wizard.handleStepClick(2)}
                disabled={wizard.maxReachedStep < 2 && !contactSection.pathway}
                className={`flex items-center gap-2 py-1 transition-all text-xs sm:text-sm ${
                  step === 2
                    ? 'text-gray-900 font-semibold cursor-pointer'
                    : step > 2
                    ? 'text-emerald-700 font-medium cursor-pointer'
                    : wizard.maxReachedStep >= 2 || contactSection.pathway
                    ? 'text-gray-700 font-normal cursor-pointer hover:text-gray-900'
                    : 'text-gray-400 font-normal opacity-50 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-none flex items-center justify-center text-xs font-bold shrink-0 leading-none transition-all ${
                    step === 2
                      ? 'bg-[#1D1E1E] text-white shadow-xs'
                      : step > 2
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 border border-gray-300 text-gray-600'
                  }`}
                >
                  {step > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                </span>
                <span>Schedule</span>
              </button>

              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />

              <button
                type="button"
                onClick={() => wizard.handleStepClick(3)}
                disabled={wizard.maxReachedStep < 3 && (!contactSection.targetDate || !fields.preferredStartTime)}
                className={`flex items-center gap-2 py-1 transition-all text-xs sm:text-sm ${
                  step === 3
                    ? 'text-gray-900 font-semibold cursor-pointer'
                    : wizard.maxReachedStep >= 3
                    ? 'text-gray-700 font-normal cursor-pointer hover:text-gray-900'
                    : 'text-gray-400 font-normal opacity-50 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-none flex items-center justify-center text-xs font-bold shrink-0 leading-none transition-all ${
                    step === 3
                      ? 'bg-[#1D1E1E] text-white shadow-xs'
                      : 'bg-gray-100 border border-gray-300 text-gray-600'
                  }`}
                >
                  3
                </span>
                <span>Patient Information</span>
              </button>
            </div>
          </div>

          {/* Right Spacer to balance centering */}
          <div className="w-[90px] hidden sm:block pointer-events-none" />
        </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full flex-grow flex flex-col justify-center pt-1 sm:pt-2 pb-6 sm:pb-10 px-4">
        <div className={contactSection.submittedLocal ? 'py-4' : 'p-6 sm:p-10'}>
          {!contactSection.submittedLocal ? (
            <AnimatePresence mode="wait">
              {/* STEP 1: Select Service Cards + Filter Switch */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-3">
                    <div>
                      <h2 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal tracking-[-0.04em] text-[#141515] leading-[1.05]">
                        Service
                      </h2>
                      <p className="text-[clamp(12px,0.3vw+11px,14px)] font-normal text-gray-500 leading-[1.65] font-sans mt-0.5">
                        Choose your required dental treatment to proceed.
                      </p>
                    </div>

                    {/* Filter Switch (All / General / Specialized) */}
                    <div className="inline-flex items-center bg-gray-200/70 p-1 border border-gray-300/50 text-xs font-medium self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setFilterType('ALL')}
                        className={`px-3 py-1 transition-colors cursor-pointer ${
                          filterType === 'ALL'
                            ? 'bg-white text-gray-900 shadow-xs font-semibold'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterType('GENERAL')}
                        className={`px-3 py-1 transition-colors cursor-pointer ${
                          filterType === 'GENERAL'
                            ? 'bg-white text-gray-900 shadow-xs font-semibold'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        General
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterType('SPECIALIZED')}
                        className={`px-3 py-1 transition-colors cursor-pointer ${
                          filterType === 'SPECIALIZED'
                            ? 'bg-white text-gray-900 shadow-xs font-semibold'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Specialized
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {filteredServices.map((srv) => {
                      const isSelected = contactSection.pathway === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => handleCardClick(srv.id)}
                          className={`relative p-5 border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'border-[#1D1E1E] bg-white shadow-md ring-1 ring-[#1D1E1E]'
                              : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold font-sans">
                                {srv.serviceType}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-[#1D1E1E] text-white flex items-center justify-center text-xs">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <h3 className="font-sans text-lg sm:text-xl font-normal tracking-[-0.04em] text-[#141515] leading-[1.05]">
                              {srv.name}
                            </h3>
                            <div className="border-t border-gray-100/80 my-2.5" />
                            <p className="text-[13px] text-gray-500 font-sans font-normal leading-[1.65]">
                              {srv.description || 'Full comprehensive treatment administered by certified medical practitioners.'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-gray-200/60 flex justify-end items-center" id="step-1-next-btn">
                    {contactSection.pathway ? (
                      <button
                        type="button"
                        onClick={wizard.goToStep2}
                        className="py-3 px-7 bg-[#1D1E1E] text-white rounded-none text-sm font-semibold tracking-widest hover:bg-[#D94E4E] transition-all duration-300 shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        Next: Schedule Slot <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="text-xs text-gray-400 font-sans italic">Select a service above to proceed</div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Schedule (Date & Time) */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200/60 pb-3">
                    <h2 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal tracking-[-0.04em] text-[#141515] leading-[1.05]">
                      Schedule
                    </h2>
                    <p className="text-[clamp(12px,0.3vw+11px,14px)] font-normal text-gray-500 leading-[1.65] font-sans mt-0.5">
                      Pick your preferred target date and time for your appointment request.
                    </p>
                  </div>

                  {/* Date First */}
                  <div className="flex flex-col gap-2 font-sans">
                    <label className="text-[clamp(11px,0.3vw+11px,13px)] font-semibold text-gray-700">
                      Preferred Date <span className="text-[#D94E4E]">*</span>
                    </label>
                    <ContactCalendar
                      currentMonth={contactSection.currentMonth}
                      availableDates={contactSection.availableDates}
                      targetDate={contactSection.targetDate}
                      isLoadingDays={contactSection.isLoadingDays}
                      onMonthChange={contactSection.setCurrentMonth}
                      onDateSelect={handleDateSelect}
                    />
                  </div>

                  {/* Time Second */}
                  <div id="step-2-time-picker">
                    <PreferenceFields
                      fields={{
                        ...fields,
                        setPreferredStartTime: handleTimeSelect,
                      }}
                      minTime={selectedDayHours?.openTime ?? undefined}
                      maxTime={selectedDayHours?.closeTime ?? undefined}
                      unavailableRanges={unavailableRanges}
                      disabled={!isSelectedDayOpen}
                    />
                    {isSelectedDayOpen && selectedDayHours?.openTime && selectedDayHours.closeTime && (
                      <p className="mt-2 text-xs text-gray-500">
                        Available {formatTimeRange(selectedDayHours.openTime)}–{formatTimeRange(selectedDayHours.closeTime)}
                        {unavailableRanges.length > 0 && ` (break ${formatTimeRange(unavailableRanges[0].start)}–${formatTimeRange(unavailableRanges[0].end)})`}.
                      </p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-200/60 flex items-center justify-between gap-4" id="step-2-next-btn">
                    <button
                      type="button"
                      onClick={wizard.goToStep1}
                      className="py-3 px-5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-all text-sm font-semibold tracking-widest flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back To Services
                    </button>

                    {contactSection.targetDate && fields.preferredStartTime ? (
                      <button
                        type="button"
                        onClick={wizard.goToStep3}
                        className="py-3 px-7 bg-[#1D1E1E] text-white rounded-none text-sm font-semibold tracking-widest hover:bg-[#D94E4E] transition-all duration-300 shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        Next: Patient Information <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="text-xs text-gray-400 font-sans italic">
                        {!contactSection.targetDate
                          ? 'Select a date above to proceed'
                          : 'Select a time slot to proceed'}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Patient Details */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200/60 pb-3">
                    <h2 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal tracking-[-0.04em] text-[#141515] leading-[1.05]">
                      Patient Information
                    </h2>
                    <p className="text-[clamp(12px,0.3vw+11px,14px)] font-normal text-gray-500 leading-[1.65] font-sans mt-0.5">
                      Review your request, then complete your details below.
                    </p>
                  </div>

                  <div className="text-[clamp(14px,0.4vw+14px,16px)] font-semibold text-[#141515] mb-3">Request Summary</div>
                  <div className="divide-y divide-gray-100 bg-[#FAFAFA] border border-gray-100 px-4 sm:px-5">
                    <div className="flex flex-col gap-2.5 py-4 min-w-0">
                      <span className="text-[clamp(11px,0.3vw+11px,13px)] font-semibold text-gray-700">Service <span className="text-[#D94E4E]">*</span></span>
                      <span className="text-sm text-gray-700 truncate" title={selectedService?.name}>
                        {selectedService?.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 py-4">
                      <div className="flex flex-col gap-2.5 min-w-0">
                        <span className="text-[clamp(11px,0.3vw+11px,13px)] font-semibold text-gray-700">Preferred Date <span className="text-[#D94E4E]">*</span></span>
                        <span className="text-sm text-gray-700">
                          {contactSection.targetDate
                            ? new Date(contactSection.targetDate + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2.5 min-w-0">
                        <span className="text-[clamp(11px,0.3vw+11px,13px)] font-semibold text-gray-700">Preferred Time <span className="text-[#D94E4E]">*</span></span>
                      <span className="text-sm text-gray-700">
                        {fields.preferredStartTime
                          ? fields.preferredStartTime.includes('AM') || fields.preferredStartTime.includes('PM')
                            ? fields.preferredStartTime
                            : (() => {
                                const [hStr, mStr] = fields.preferredStartTime.split(':');
                                const h = parseInt(hStr, 10);
                                if (isNaN(h)) return fields.preferredStartTime;
                                const period = h >= 12 ? 'PM' : 'AM';
                                const h12 = h % 12 === 0 ? 12 : h % 12;
                                return `${String(h12).padStart(2, '0')}:${mStr || '00'} ${period}`;
                              })()
                          : 'Flexible / Standard'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[clamp(14px,0.4vw+14px,16px)] font-semibold text-[#141515] mt-8 mb-4">Contact Details</div>
                  <NameFields fields={fields} touched={formTouched} />
                  <ContactFields fields={fields} phone={contactSection.phone} setPhone={contactSection.setPhone} touched={formTouched} />
                  <NotesField notes={contactSection.notes} setNotes={contactSection.setNotes} />

                  <div className="pt-6 border-t border-gray-200/60 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={wizard.goToStep2}
                      disabled={isSubmitting}
                      className="py-3 px-5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-all text-sm font-semibold tracking-widest flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back To Schedule
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setFormTouched(true);
                        await contactSection.submitInquiry();
                        if (contactSection.submittedLocal) window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={isSubmitting}
                      className="py-3 px-7 bg-[#1D1E1E] text-white rounded-none text-sm font-semibold tracking-widest hover:bg-[#D94E4E] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        'Submitting Request...'
                      ) : (
                        <>
                          Confirm & Submit Request <Check className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            /* Confirmation Screen */
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="bg-white border border-gray-200 p-4 pt-8 pb-8 sm:p-8 max-w-lg mx-auto font-sans space-y-4">
                <div className="space-y-3 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="font-sans text-2xl font-normal text-gray-900 text-center">Request Submitted Successfully!</h2>
                  <p className="text-sm font-light text-gray-600 leading-relaxed">
                    Thank you for reaching out to {clinicName}. We've received your booking request and our team is reviewing it. We'll get back to you soon to confirm your appointment.
                  </p>

                  {submittedReference && (
                    <div className="text-sm font-semibold text-gray-800">
                      Ref ID: {submittedReference}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200/80">
                  <span className="text-xs text-gray-500 font-sans">
                    Need immediate help? Call us at <span className="font-semibold text-gray-800">{clinicPhone}</span>.
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200/80 flex flex-col items-center gap-3">
                  <Link
                    href="/"
                    className="px-6 py-3 bg-[#1D1E1E] hover:bg-[#D94E4E] text-white text-sm font-semibold tracking-widest transition-all shadow-sm inline-block"
                  >
                    Return to Home
                  </Link>
                  {redirectCountdown !== null && (
                    <p className="text-xs text-gray-500 font-sans">
                      Redirecting to homepage in <span className="font-bold text-[#D94E4E]">{redirectCountdown} seconds</span>...
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      {!contactSection.submittedLocal && (
        <footer className="border-t border-gray-200/40 py-5 text-center text-xs text-gray-400 font-sans">
          <div>© {new Date().getFullYear()} {clinicName}. All rights reserved.</div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {config.socialLinks.length > 0 ? config.socialLinks.map((link) => (
              <a
                key={`${link.platform}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#D94E4E] hover:text-[#D94E4E]"
                aria-label={`Visit ${clinicName} on ${link.platform}`}
              >
                <SocialIcon platform={link.platform} />
                {link.platform}
              </a>
            )) : (
              <span className="text-gray-400">Follow us on social media — profiles coming soon.</span>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  const normalizedPlatform = platform.trim().toLowerCase();
  if (normalizedPlatform.includes('instagram')) return <InstagramIcon />;
  if (normalizedPlatform.includes('facebook')) return <FacebookIcon />;
  return <Link2 className="h-3.5 w-3.5" />;
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" /></svg>;
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true"><path d="M13.5 21v-8h2.75l.41-3.12H13.5V7.89c0-.9.25-1.51 1.56-1.51h1.67V3.59A22.4 22.4 0 0 0 14.3 3c-2.4 0-4.05 1.46-4.05 4.14v2.74H7.5V13h2.75v8h3.25Z" /></svg>;
}
