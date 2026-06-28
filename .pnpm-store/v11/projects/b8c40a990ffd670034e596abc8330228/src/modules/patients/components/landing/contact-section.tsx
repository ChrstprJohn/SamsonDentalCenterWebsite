'use client';

import React from 'react';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { useContactSection } from '../../hooks/landing/use-contact-section';
import { ContactFormCard } from './sub-components/contact-form-card';
import { ContactInfoPanel } from './sub-components/contact-info-panel';

interface ContactSectionProps {
  config: ClinicConfigResponseDto;
  services: ServiceResponseDto[];
  contactForm: {
    firstName: string;
    setFirstName: (val: string) => void;
    middleName: string;
    setMiddleName: (val: string) => void;
    lastName: string;
    setLastName: (val: string) => void;
    suffix: string;
    setSuffix: (val: string) => void;
    contactEmail: string;
    setContactEmail: (val: string) => void;
    contactMessage: string;
    setContactMessage: (val: string) => void;
    isContactSubmitting: boolean;
    handleRealInquirySubmit: (data: {
      phone: string;
      pathway: string;
      targetDate: string;
      notes: string;
    }) => Promise<boolean>;
  };
}

export function ContactSection({ config, services, contactForm }: ContactSectionProps) {
  const contact = useContactSection({
    services,
    handleRealInquirySubmit: contactForm.handleRealInquirySubmit,
  });

  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#FDFDFD] relative w-full border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <ContactInfoPanel config={config} />
          <ContactFormCard
            services={services}
            fields={contactForm}
            phone={contact.phone}
            setPhone={contact.setPhone}
            pathway={contact.pathway}
            setPathway={contact.setPathway}
            targetDate={contact.targetDate}
            setTargetDate={contact.setTargetDate}
            notes={contact.notes}
            setNotes={contact.setNotes}
            submittedLocal={contact.submittedLocal}
            currentMonth={contact.currentMonth}
            setCurrentMonth={contact.setCurrentMonth}
            availableDates={contact.availableDates}
            isLoadingDays={contact.isLoadingDays}
            onSubmit={contact.submitInquiry}
            onReset={contact.resetSubmission}
          />
        </div>
      </div>
    </section>
  );
}
