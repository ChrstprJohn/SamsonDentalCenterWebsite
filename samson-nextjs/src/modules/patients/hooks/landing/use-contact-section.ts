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
    setIsLoadingDays(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates: string[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      if (dateObj.getDay() !== 0) { // Exclude Sundays (0)
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dates.push(dateStr);
      }
    }
    
    setAvailableDates(dates);
    setIsLoadingDays(false);
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
