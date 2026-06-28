'use client';

import { useEffect, useState } from 'react';
import { getAvailableDaysAction } from '@/modules/appointments/actions/availability/get-available-days.action';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface UseContactSectionProps {
  services: ServiceResponseDto[];
  handleRealInquirySubmit: (data: {
    phone: string;
    pathway: string;
    targetDate: string;
    notes: string;
  }) => Promise<boolean>;
}

export function useContactSection({ services, handleRealInquirySubmit }: UseContactSectionProps) {
  const [phone, setPhone] = useState('');
  const [pathway, setPathway] = useState(services[0]?.id || '');
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
    if (services.length > 0 && !pathway) setPathway(services[0].id);
  }, [pathway, services]);

  useEffect(() => {
    setTargetDate('');
  }, [pathway]);

  useEffect(() => {
    if (!pathway) {
      setAvailableDates([]);
      return;
    }

    let active = true;
    async function loadDays() {
      setIsLoadingDays(true);
      const month = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const response = await getAvailableDaysAction({ serviceId: pathway, month });
      if (!active) return;

      setIsLoadingDays(false);
      setAvailableDates(response.success && response.data ? response.data.availableDates || [] : []);
    }
    loadDays();

    return () => {
      active = false;
    };
  }, [currentMonth, pathway]);

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
