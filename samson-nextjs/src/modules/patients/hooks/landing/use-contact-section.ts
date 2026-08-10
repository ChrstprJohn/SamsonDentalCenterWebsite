'use client';

import { useEffect, useState } from 'react';
import { getAvailableDaysAction } from '@/modules/appointments/actions/availability/get-available-days.action';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

interface UseContactSectionProps {
  services: ServiceResponseDto[];
  config: ClinicConfigResponseDto;
  initialPathway?: string;
  handleRealInquirySubmit: (data: {
    phone: string;
    pathway: string;
    targetDate: string;
    notes: string;
  }) => Promise<boolean>;
}

export function useContactSection({ services, config, initialPathway, handleRealInquirySubmit }: UseContactSectionProps) {
  const [phone, setPhone] = useState('');
  const [pathway, setPathway] = useState(initialPathway || '');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedLocal, setSubmittedLocal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoadingDays, setIsLoadingDays] = useState(false);

  useEffect(() => {
    setTargetDate('');
  }, [pathway]);

  useEffect(() => {
    let active = true;
    const selectedService = services.find((service) => service.id === pathway);

    if (!selectedService) {
      setAvailableDates([]);
      setIsLoadingDays(false);
      return;
    }

    setIsLoadingDays(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const requestedMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstBookableDate = new Date(today);
    if (!config.allowSameDayBooking) firstBookableDate.setDate(firstBookableDate.getDate() + 1);
    const lastBookableDate = new Date(today);
    lastBookableDate.setDate(lastBookableDate.getDate() + config.calendarRenderDays);
    const toDateString = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    getAvailableDaysAction({ serviceId: selectedService.id, month: requestedMonth })
      .then((response) => {
        if (!active) return;
        const first = toDateString(firstBookableDate);
        const last = toDateString(lastBookableDate);
        setAvailableDates(response.success && response.data
          ? response.data.availableDates.filter((date) => date >= first && date <= last)
          : []);
      })
      .catch(() => active && setAvailableDates([]))
      .finally(() => active && setIsLoadingDays(false));

    return () => { active = false; };
  }, [config.allowSameDayBooking, config.calendarRenderDays, currentMonth, pathway, services]);


  const submitInquiry = async () => {
    const success = await handleRealInquirySubmit({ phone, pathway, targetDate, notes });
    if (success) setSubmittedLocal(true);
  };

  const resetSubmission = () => {
    setSubmittedLocal(false);
    setPhone('');
    setTargetDate('');
    setNotes('');
  };

  return {
    phone,
    setPhone,
    pathway,
    setPathway,
    targetDate,
    setTargetDate,
    notes,
    setNotes,
    submittedLocal,
    currentMonth,
    setCurrentMonth,
    availableDates,
    isLoadingDays,
    submitInquiry,
    resetSubmission,
  };
}
