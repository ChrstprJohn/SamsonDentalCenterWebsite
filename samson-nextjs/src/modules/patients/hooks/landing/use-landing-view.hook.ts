'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface UseLandingViewProps {
  isAuthenticated: boolean;
}

export function useLandingView({ isAuthenticated }: UseLandingViewProps) {
  const [selectedService, setSelectedService] = useState<ServiceResponseDto | null>(null);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactName, setContactName] = useState('');
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      addToast('Please fill out all fields.', 'error');
      return;
    }

    setIsContactSubmitting(true);
    // Simulate contact form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsContactSubmitting(false);

    addToast('Your message has been sent successfully!', 'success');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  return {
    selectedService,
    setSelectedService,
    contactForm: {
      contactName,
      setContactName,
      contactEmail,
      setContactEmail,
      contactMessage,
      setContactMessage,
      isContactSubmitting,
      handleContactSubmit,
    },
    handleBookingCTA,
  };
}
