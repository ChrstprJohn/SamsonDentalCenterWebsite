'use client';

import React from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { ServiceCard } from '@/modules/services/components/service-card';

interface ServicesSectionProps {
  services: ServiceResponseDto[];
  onSelectService: (service: ServiceResponseDto) => void;
}

export function ServicesSection({ services, onSelectService }: ServicesSectionProps) {
  return (
    <section id="services" className="py-20 md:py-28 px-6 border-t border-slate-105 dark:border-white/5 bg-white dark:bg-slate-900/10">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-500 dark:text-blue-400">Treatments</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4">
            Our Professional Services
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            We offer comprehensive, patient-centered clinical dentistry using the highest standards of diagnostic accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={onSelectService}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
