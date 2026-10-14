'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ChevronRight, ChevronDown, CheckCircle2, Link2, Clock, Phone, Mail, Ban } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { ServiceDescription, parseServiceDescription } from '../components/landing/mock-category-services-section';

const CATEGORY_ORDER = [
  'Consultation',
  'Diagnostics',
  'Preventive Dentistry',
  'Restorative Dentistry',
  'Prosthodontics',
  'Endodontics',
  'Cosmetic Dentistry',
  'Orthodontics',
  'Oral Surgery and Implants',
  'Specialized Care',
];

interface BookingWizardViewProps {
  services: ServiceResponseDto[];
  config: ClinicConfigResponseDto;
  initialServiceId?: string;
  initialCategory?: string;
}

export function BookingWizardView({ services, config, initialServiceId, initialCategory }: BookingWizardViewProps) {
  const wizard = useBookingWizard({ services, config, initialServiceId });
  const router = useRouter();
  const { step, contactSection, fields, isSubmitting, redirectCountdown, submittedReference, selectService } = wizard;
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const category = services.find(service => service.id === initialServiceId)?.category ?? initialCategory;
    return category && category !== 'Consultation' && services.some(service => service.category === category) ? category : 'ALL';
  });
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // ponytail: __NA is set by Next App Router only on client-side navigations; fall back to home for direct loads
  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if ((window as any).history?.state?.__NA) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const consultationService = services.find(service => service.category === 'Consultation');
  const selectedService = services.find((s) => s.id === contactSection.pathway);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category && s.category !== 'Consultation') set.add(s.category);
    });
    const ordered: string[] = [];
    CATEGORY_ORDER.forEach((cat) => {
      if (set.has(cat)) ordered.push(cat);
    });
    Array.from(set).sort().forEach((cat) => {
      if (!ordered.includes(cat)) ordered.push(cat);
    });
    return ordered;
  }, [services]);

  const categoryFilters = ['ALL', ...availableCategories];
  const collapsedFilters = categoryFilters.slice(0, 5);
  if (!collapsedFilters.includes(selectedCategory) && categoryFilters.includes(selectedCategory)) {
    collapsedFilters[collapsedFilters.length - 1] = selectedCategory;
  }

  const filteredServices = useMemo(() => {
    const list = selectedCategory === 'ALL'
      ? services.filter(service => service.id !== consultationService?.id)
      : services.filter(srv => srv.id !== consultationService?.id && (srv.category ?? 'Other') === selectedCategory);

    list.sort((a, b) => {
      const aHasBullets = parseServiceDescription(a.description).bullets.length > 0 ? 1 : 0;
      const bHasBullets = parseServiceDescription(b.description).bullets.length > 0 ? 1 : 0;
      if (aHasBullets !== bHasBullets) {
        return bHasBullets - aHasBullets; // cards with bullets appear first
      }
      // Within each group, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
    return consultationService ? [consultationService, ...list] : list;
  }, [services, selectedCategory, consultationService]);

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

  // Auto-scroll to selected service if initialServiceId is present
  // Must wait past smooth-scroll's mount scroll-to-top timers (+80/+300ms) or the
  // scroll gets yanked back to top; retry until the element and lenis are ready.
  useEffect(() => {
    if (!initialServiceId || step !== 1) return;
    const start = Date.now();
    const scrollToCard = () => {
      const el = document.getElementById(`service-card-${initialServiceId}`);
      if (!el) return false;
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(el, { offset: -120 });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return true;
    };
    const timer = setInterval(() => {
      if (Date.now() - start >= 400 && scrollToCard()) {
        clearInterval(timer);
      } else if (Date.now() - start >= 4000) {
        clearInterval(timer); // give up after 4s
      }
    }, 150);
    return () => clearInterval(timer);
  }, [initialServiceId, step]);

  // Recalculate page dimensions and scroll to top when changing steps or filter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!initialServiceId || step !== 1) {
        window.scrollTo(0, 0);
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(0, { immediate: true });
          (window as any).lenis.resize();
        }
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
  }, [step, contactSection.targetDate, initialServiceId]);

  // Filtering and expanding pills change the scroll range without changing steps.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => (window as any).lenis?.resize());
    const timer = window.setTimeout(() => (window as any).lenis?.resize(), 300);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [selectedCategory, showAllCategories, services.length]);

  if (!config.isBookingOpen) {
    return (
      <main className="min-h-screen bg-[#FDFDFD] px-6 py-24 flex items-center justify-center text-[#1D1E1E]">
        <div className="mx-auto w-full max-w-md border border-gray-100 bg-white shadow-xl p-8 sm:p-10 text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#D94E4E]/10 text-[#D94E4E] mb-6"><Ban className="w-7 h-7" /></span>
          <h1 className="text-2xl font-semibold tracking-tight">Online appointment requests are currently unavailable</h1>
          <p className="mt-3 text-sm text-gray-500">Sorry for the inconvenience. To schedule an appointment, please reach us through any of the following:</p>
          <div className="mt-6 space-y-3 text-sm font-sans">
            <p className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-[#D94E4E]" />
              <a href={`tel:${config.phone}`} className="hover:text-[#D94E4E] transition-colors">{config.phone.replace(/^\+63\s*/, '0')}</a>
            </p>
            {config.landline && (
              <p className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-[#D94E4E]" />
                <a href={`tel:${config.landline}`} className="hover:text-[#D94E4E] transition-colors">{config.landline}</a>
              </p>
            )}
            <p className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-[#D94E4E]" />
              <a href={`mailto:${config.email}`} className="hover:text-[#D94E4E] transition-colors">{config.email}</a>
            </p>
          </div>
          <Link href="/" className="mt-8 inline-block w-full bg-[#1D1E1E] px-6 py-3 text-sm font-semibold tracking-wider text-white hover:bg-[#D94E4E] transition-colors">Return to Home</Link>
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
        <div className="max-w-7xl mx-auto grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
          {/* Left: Visible Return Link / Back Button */}
          <Link
            href="/"
            onClick={handleBackClick}
            aria-label="Back to previous page"
            className="justify-self-start w-fit inline-flex items-center gap-1.5 font-sans text-[clamp(0.8125rem,0.75rem+0.25vw,0.9375rem)] font-semibold text-gray-800 hover:text-[#D94E4E] transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100/80"
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
            <span>Back</span>
          </Link>

          {/* Center: Centered Stepper Navigation Pills with boxed number badge */}
          <div className="justify-self-center">
            <div className="flex items-center gap-1 sm:gap-4 font-sans text-[clamp(0.8125rem,0.75rem+0.25vw,0.9375rem)] tracking-[0.04em] sm:tracking-[0.1em] font-medium uppercase text-gray-700">
              <button
                type="button"
                onClick={() => wizard.handleStepClick(1)}
                className={`flex items-center gap-1 sm:gap-2 py-1 transition-all cursor-pointer text-[clamp(0.8125rem,0.75rem+0.25vw,0.9375rem)] ${
                  step === 1
                    ? 'text-gray-900 font-semibold'
                    : step > 1
                    ? 'text-emerald-700 font-medium'
                    : 'text-gray-500 font-normal'
                }`}
              >
                <span
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-none flex items-center justify-center text-[clamp(0.75rem,0.7rem+0.2vw,0.8125rem)] font-bold shrink-0 leading-none transition-all ${
                    step === 1
                      ? 'bg-[#1D1E1E] text-white shadow-xs'
                      : step > 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 border border-gray-300 text-gray-600'
                  }`}
                >
                  {step > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                </span>
                <span className={`booking-step-label ${step === 1 ? 'inline' : 'hidden sm:inline'} ${step !== 1 ? 'booking-step-label-inactive' : ''}`}>Service</span>
              </button>

              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />

              <button
                type="button"
                onClick={() => wizard.handleStepClick(2)}
                disabled={wizard.maxReachedStep < 2 && !contactSection.pathway}
                className={`flex items-center gap-1 sm:gap-2 py-1 transition-all text-[clamp(0.8125rem,0.75rem+0.25vw,0.9375rem)] ${
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
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-none flex items-center justify-center text-[clamp(0.75rem,0.7rem+0.2vw,0.8125rem)] font-bold shrink-0 leading-none transition-all ${
                    step === 2
                      ? 'bg-[#1D1E1E] text-white shadow-xs'
                      : step > 2
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 border border-gray-300 text-gray-600'
                  }`}
                >
                  {step > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                </span>
                <span className={`booking-step-label ${step === 2 ? 'inline' : 'hidden sm:inline'} ${step !== 2 ? 'booking-step-label-inactive' : ''}`}>Schedule</span>
              </button>

              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />

              <button
                type="button"
                onClick={() => wizard.handleStepClick(3)}
                disabled={wizard.maxReachedStep < 3 && (!contactSection.targetDate || !fields.preferredStartTime)}
                className={`flex items-center gap-1 sm:gap-2 py-1 transition-all text-[clamp(0.8125rem,0.75rem+0.25vw,0.9375rem)] ${
                  step === 3
                    ? 'text-gray-900 font-semibold cursor-pointer'
                    : wizard.maxReachedStep >= 3
                    ? 'text-gray-700 font-normal cursor-pointer hover:text-gray-900'
                    : 'text-gray-400 font-normal opacity-50 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-none flex items-center justify-center text-[clamp(0.75rem,0.7rem+0.2vw,0.8125rem)] font-bold shrink-0 leading-none transition-all ${
                    step === 3
                      ? 'bg-[#1D1E1E] text-white shadow-xs'
                      : 'bg-gray-100 border border-gray-300 text-gray-600'
                  }`}
                >
                  3
                </span>
                <span className={`booking-step-label ${step === 3 ? 'inline' : 'hidden sm:inline'} ${step !== 3 ? 'booking-step-label-inactive' : ''}`}>Patient Information</span>
              </button>
            </div>
          </div>

          {/* Empty matching grid track keeps the stepper centered in the viewport. */}
          <div aria-hidden="true" />
        </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`${step === 1 ? 'max-w-7xl' : 'max-w-4xl'} mx-auto w-full flex-grow flex flex-col justify-center pt-1 sm:pt-2 pb-6 sm:pb-10 px-6 sm:px-12 transition-all duration-300`}>
        <div className={contactSection.submittedLocal ? 'py-4' : 'py-4 sm:py-8'}>
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
                      <h2 className="font-sans text-[clamp(1.625rem,1.375rem+1vw,2.25rem)] text-balance font-normal tracking-[-0.04em] text-[#141515] leading-[1.05]">
                        Choose Service
                      </h2>
                      <p className="text-[clamp(1rem,0.95rem+0.2vw,1.0625rem)] font-normal text-gray-500 leading-[1.65] font-sans mt-0.5">
                        Choose your required dental treatment to proceed.
                      </p>
                    </div>

                  </div>
                  <div role="group" aria-label="Filter services by category" className="flex flex-wrap gap-2 mb-6">
                    {categoryFilters.map(category => <button key={category} type="button" aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)} className={`${!showAllCategories && !collapsedFilters.includes(category) ? "hidden md:inline-flex" : "inline-flex"} items-center min-h-11 rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94E4E] ${selectedCategory === category ? 'bg-[#1D1E1E] border-[#1D1E1E] text-white' : 'bg-white border-gray-300 text-gray-800 hover:border-gray-500'}`}>
                      {category === 'ALL' ? 'All services' : category}
                    </button>)}
                    {categoryFilters.length > 5 && <button type="button" aria-expanded={showAllCategories} onClick={() => setShowAllCategories(value => !value)} className="md:hidden min-h-11 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:border-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94E4E]">
                      {showAllCategories ? 'Less' : 'More'}
                    </button>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 pb-6 items-stretch">
                    {filteredServices.map(srv => {
                      const isConsultation = srv.id === consultationService?.id;
                      const isSelected = contactSection.pathway === srv.id;
                      return <article key={srv.id} id={`service-card-${srv.id}`} className={`rounded-none border p-4 sm:p-5 transition-colors bg-white ${isSelected ? 'border-[#1D1E1E] ring-1 ring-[#1D1E1E]' : 'border-gray-200'}`}>
                        <button type="button" aria-pressed={isSelected} onClick={() => handleCardClick(srv.id)} className="flex w-full items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D94E4E]">
                          <span className="min-w-0 flex-1">
                            <span className="block text-[clamp(0.75rem,0.7rem+0.2vw,0.8125rem)] leading-relaxed text-gray-500">{srv.category || 'General'}</span>
                            <span className="block mt-1 text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-snug font-medium">{isConsultation ? 'General Consultation' : srv.name}</span>
                          </span>
                          <span aria-hidden="true" className={`mt-1 h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#1D1E1E] bg-[#1D1E1E] text-white' : 'border-gray-300'}`}>{isSelected && <Check className="h-3 w-3" />}</span>
                        </button>
                        {(isConsultation || srv.description) && <div className="mt-4 border-t border-gray-100 pt-3"><ServiceDescription description={isConsultation ? "Not sure which service to choose? Book a consultation to discuss your concern with the dentist." : srv.description} className="mt-0 text-[clamp(1rem,0.95rem+0.2vw,1.0625rem)] leading-relaxed" /></div>}
                      </article>;
                    })}
                  </div>

                  <div className="relative min-h-[76px] border-t border-gray-200 bg-[#FDFDFD] py-4 flex flex-wrap justify-end items-center gap-3" id="step-1-next-btn">
                    {!contactSection.pathway && <span className="text-xs text-gray-500 font-sans">Select a service to continue</span>}
                    <button type="button" disabled={!contactSection.pathway} onClick={wizard.goToStep2} className="min-h-11 py-3 px-7 bg-[#1D1E1E] text-white text-[11px] sm:text-sm font-semibold tracking-widest hover:bg-[#D94E4E] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer">
                      Next: Schedule Slot <ArrowRight className="w-4 h-4" />
                    </button>
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
                    <h2 className="font-sans text-[clamp(1.625rem,1.375rem+1vw,2.25rem)] text-balance font-normal tracking-[-0.04em] text-[#141515] leading-[1.05]">
                      Schedule
                    </h2>
                    <p className="text-[clamp(1rem,0.95rem+0.2vw,1.0625rem)] font-normal text-gray-500 leading-[1.65] font-sans mt-0.5">
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
                      <div className="mt-2.5 p-2.5 rounded-none border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs flex items-start gap-2 font-medium">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">Clinic Hours</span>
                          {unavailableRanges.length > 0 ? (
                            <>
                              <span className="font-normal">Morning: <strong className="font-semibold">{formatTimeRange(selectedDayHours.openTime)} – {formatTimeRange(unavailableRanges[0].start)}</strong></span>
                              <span className="font-normal">Afternoon: <strong className="font-semibold">{formatTimeRange(unavailableRanges[0].end)} – {formatTimeRange(selectedDayHours.closeTime)}</strong></span>
                            </>
                          ) : (
                            <span className="font-normal"><strong className="font-semibold">{formatTimeRange(selectedDayHours.openTime)} – {formatTimeRange(selectedDayHours.closeTime)}</strong></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-200/60 flex items-center justify-between gap-4" id="step-2-next-btn">
                    <button
                      type="button"
                      onClick={wizard.goToStep1}
                      className="py-3 px-5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-all text-[11px] sm:text-sm font-semibold tracking-widest flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back To Services
                    </button>

                    {contactSection.targetDate && fields.preferredStartTime ? (
                      <button
                        type="button"
                        onClick={wizard.goToStep3}
                        className="py-3 px-7 bg-[#1D1E1E] text-white rounded-none text-[11px] sm:text-sm font-semibold tracking-widest hover:bg-[#D94E4E] transition-all duration-300 shadow-xs flex items-center gap-2 cursor-pointer"
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
                    <h2 className="font-sans text-[clamp(1.625rem,1.375rem+1vw,2.25rem)] text-balance font-normal tracking-[-0.04em] text-[#141515] leading-[1.05]">
                      Patient Information
                    </h2>
                    <p className="text-[clamp(1rem,0.95rem+0.2vw,1.0625rem)] font-normal text-gray-500 leading-[1.65] font-sans mt-0.5">
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
                      className="py-3 px-5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-all text-[11px] sm:text-sm font-semibold tracking-widest flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
                      className="py-3 px-7 bg-[#1D1E1E] text-white rounded-none text-[11px] sm:text-sm font-semibold tracking-widest hover:bg-[#D94E4E] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
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
              className="text-center py-6 sm:py-12 space-y-3 sm:space-y-4"
            >
              <div className="bg-white border border-gray-200 p-3 pt-5 pb-5 w-full max-w-[340px] sm:max-w-lg mx-auto font-sans space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <h2 className="font-sans text-[18px] sm:text-2xl font-normal text-gray-900 text-center leading-tight">Request Submitted Successfully!</h2>
                  <p className="text-[12px] sm:text-sm font-normal text-gray-600 leading-[1.55] sm:leading-relaxed">
                    Thank you for reaching out to {clinicName}. We've received your booking request and our team is reviewing it. We'll get back to you soon to confirm your appointment.
                  </p>

                  {submittedReference && (
                    <div className="text-[12px] sm:text-sm font-semibold text-gray-800">
                      Ref ID: {submittedReference}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200/80">
                  <span className="text-[11px] sm:text-xs text-gray-500 font-sans">
                    Need immediate help? Call us at <span className="font-semibold text-gray-800">{clinicPhone}</span>.
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200/80 flex flex-col items-center gap-3">
                  <Link
                    href="/"
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#1D1E1E] hover:bg-[#D94E4E] text-white text-[11px] sm:text-sm font-semibold tracking-widest transition-all shadow-sm inline-block"
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
