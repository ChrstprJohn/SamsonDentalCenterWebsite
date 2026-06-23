'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { submitInquiryAction } from '@/modules/appointments/actions/booking/submit-inquiry.action';

interface UseLandingViewProps {
  isAuthenticated: boolean;
  services: ServiceResponseDto[];
}

export function useLandingView({ isAuthenticated, services }: UseLandingViewProps) {
  const [selectedService, setSelectedService] = useState<ServiceResponseDto | null>(null);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const { addToast } = useToast();
  const router = useRouter();

  const handleBookingCTA = (serviceId?: string) => {
    setSelectedService(null);
    const targetUrl = serviceId
      ? `/user?service=${serviceId}`
      : '/user';

    if (isAuthenticated) {
      router.push(targetUrl);
    } else {
      router.push(`/auth/login?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  const handleRealInquirySubmit = async ({
    phone,
    pathway,
    targetDate,
    notes,
  }: {
    phone: string;
    pathway: string;
    targetDate: string;
    notes: string;
  }) => {
    if (!firstName.trim() || !lastName.trim() || !contactEmail.trim() || !phone.trim() || !targetDate.trim()) {
      addToast('Please fill out all required fields.', 'error');
      return false;
    }

    setIsContactSubmitting(true);

    try {
      // Clean phone number for E.164 regex compliance (only digits and starting +)
      const cleanedPhone = phone.replace(/[^\d+]/g, '');

      // Resolve UUID for service
      let serviceId = pathway;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(serviceId)) {
        // Fallback to first database service if mock ID is passed
        const dbService = services.find((s) => uuidRegex.test(s.id));
        if (dbService) {
          serviceId = dbService.id;
        } else {
          addToast('Please select a valid treatment service.', 'error');
          setIsContactSubmitting(false);
          return false;
        }
      }

      const res = await submitInquiryAction({
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        suffix: suffix.trim() || undefined,
        email: contactEmail.trim(),
        phoneNumber: cleanedPhone,
        preferredServiceId: serviceId,
        preferredDate: targetDate,
        patientNote: notes.trim() || undefined,
      });

      if (res.success) {
        addToast('Your consultation request has been submitted successfully!', 'success');
        setFirstName('');
        setMiddleName('');
        setLastName('');
        setSuffix('');
        setContactEmail('');
        setIsContactSubmitting(false);
        return true;
      } else {
        addToast(res.error || 'Failed to submit request.', 'error');
        setIsContactSubmitting(false);
        return false;
      }
    } catch (err: any) {
      addToast(err.message || 'An unexpected error occurred.', 'error');
      setIsContactSubmitting(false);
      return false;
    }
  };

  return {
    selectedService,
    setSelectedService,
    contactForm: {
      firstName,
      setFirstName,
      middleName,
      setMiddleName,
      lastName,
      setLastName,
      suffix,
      setSuffix,
      contactEmail,
      setContactEmail,
      contactMessage,
      setContactMessage,
      isContactSubmitting,
      handleRealInquirySubmit,
    },
    handleBookingCTA,
  };
}
