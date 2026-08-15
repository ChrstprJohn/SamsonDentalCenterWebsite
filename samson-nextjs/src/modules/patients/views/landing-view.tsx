'use client';

import React from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { useLandingView } from '../hooks/landing/use-landing-view';
import { HeroSectionV1 } from '../components/landing/hero-section-v1';
import { HeroSectionV2 } from '../components/landing/hero-section-v2';
import { HeroSectionPreview } from '../components/landing/hero-section-preview';
import { ServicesSection } from '../components/landing/services-section';
import { JourneySection } from '../components/landing/journey-section';
import { AboutSection } from '../components/landing/about-section';
import { GallerySection } from '../components/landing/gallery-section';
import { TestimonialsSection } from '../components/landing/testimonials-section';
import { ContactSection } from '../components/landing/contact-section';

interface LandingViewProps {
  services: ServiceResponseDto[];
  config: ClinicConfigResponseDto;
}

const DEFAULT_SERVICES: ServiceResponseDto[] = [
  {
    id: 's-1',
    name: 'Routine Dental Cleaning',
    description: 'A comprehensive preventive clean, scale, and polish to remove plaque, prevent cavities, and maintain oral hygiene.',
    durationMinutes: 45,
    price: 99,
    serviceType: 'GENERAL',
    isActive: true,
    status: 'ACTIVE',
    createdAt: undefined,
    updatedAt: undefined,
  },
  {
    id: 's-2',
    name: 'Teeth Whitening (Laser)',
    description: 'Advanced in-chair professional bleaching session providing instant shade lifting, fully customized for sensitive teeth.',
    durationMinutes: 60,
    price: 299,
    serviceType: 'SPECIALIZED',
    isActive: true,
    status: 'ACTIVE',
    createdAt: undefined,
    updatedAt: undefined,
  },
  {
    id: 's-3',
    name: 'Premium Dental Implants',
    description: 'High-end titanium root implantation with a customized porcelain crown, restoring structural bite and premium tooth aesthetics.',
    durationMinutes: 90,
    price: 1499,
    serviceType: 'SPECIALIZED',
    isActive: true,
    status: 'ACTIVE',
    createdAt: undefined,
    updatedAt: undefined,
  },
  {
    id: 's-4',
    name: 'Orthodontic Braces Consultation',
    description: 'Complete diagnostic structural scan, panoramic X-rays, and comprehensive model formulation for custom aligners or clear braces.',
    durationMinutes: 30,
    price: 0,
    serviceType: 'GENERAL',
    isActive: true,
    status: 'ACTIVE',
    createdAt: undefined,
    updatedAt: undefined,
  },
];

export function LandingView({ services, config }: LandingViewProps) {
  const activeServices = services.length > 0 ? services : DEFAULT_SERVICES;

  const {
    selectedService,
    setSelectedService,
    handleBookingCTA,
  } = useLandingView({ services: activeServices });

  return (
    <div className="flex flex-col w-full bg-[#FDFDFD] text-[#1D1E1E]">
      <HeroSectionPreview onBookClick={() => handleBookingCTA()} />
      {!config.isBookingOpen && (
        <div className="bg-amber-50 px-6 py-3 text-center text-sm text-amber-900" role="status">
          {config.maintenanceMessage || `Online booking is temporarily unavailable. Please contact ${config.clinicName} directly.`}
        </div>
      )}
      <ServicesSection services={activeServices} onSelectService={(svc) => handleBookingCTA(svc.id)} />
      <AboutSection />
      {/* <JourneySection /> */}
      <GallerySection />
      <TestimonialsSection />
      <ContactSection config={config} />
    </div>
  );
}
