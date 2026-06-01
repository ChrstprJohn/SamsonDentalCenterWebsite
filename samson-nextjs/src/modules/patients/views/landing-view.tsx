'use client';

import React from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

import { useLandingView } from '../hooks/landing/use-landing-view.hook';
import { HeroSection } from '../components/landing/hero-section';
import { ServicesSection } from '../components/landing/services-section';
import { AboutSection } from '../components/landing/about-section';
import { GallerySection } from '../components/landing/gallery-section';
import { ContactSection } from '../components/landing/contact-section';

interface LandingViewProps {
  services: ServiceResponseDto[];
  config: ClinicConfigResponseDto;
  isAuthenticated: boolean;
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
    createdAt: undefined,
    updatedAt: undefined,
  },
];

export function LandingView({ services, config, isAuthenticated }: LandingViewProps) {
  const {
    selectedService,
    setSelectedService,
    contactForm,
    handleBookingCTA,
  } = useLandingView({ isAuthenticated });

  const activeServices = services.length > 0 ? services : DEFAULT_SERVICES;

  return (
    <div className="flex flex-col w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <HeroSection onBookClick={() => handleBookingCTA()} />
      <ServicesSection services={activeServices} onSelectService={setSelectedService} />
      <AboutSection />
      <GallerySection />
      <ContactSection config={config} contactForm={contactForm} />

      {/* 🔍 Services Detail Popup Modal */}
      <Modal
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
        title={selectedService?.name || ''}
        size="md"
      >
        {selectedService && (
          <div className="flex flex-col gap-6 text-slate-700 dark:text-slate-350 py-2">
            <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {selectedService.description || 'Full comprehensive treatment administered by our certified medical dental practitioners.'}
            </p>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl text-sm border border-slate-100 dark:border-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Treatment Duration</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">⏳ {selectedService.durationMinutes} mins</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Estimated Price</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {selectedService.price !== null ? `$${selectedService.price}` : 'Contact for pricing'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-white/5 pt-4">
              <Button variant="secondary" onClick={() => setSelectedService(null)}>
                Close
              </Button>
              <Button onClick={() => handleBookingCTA(selectedService.id)}>
                Book This Service
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
