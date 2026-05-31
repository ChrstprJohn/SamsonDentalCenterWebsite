'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { ServiceCard } from '@/modules/services/components/service-card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/feedback/toast-container';

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
  const [selectedService, setSelectedService] = useState<ServiceResponseDto | null>(null);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const { addToast } = useToast();
  const router = useRouter();

  const activeServices = services.length > 0 ? services : DEFAULT_SERVICES;

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

  return (
    <div className="flex flex-col w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* 🚀 Hero Section */}
      <section
        id="hero"
        className="relative min-h-[85vh] flex items-center pt-24 pb-16 md:py-32 px-6 overflow-hidden"
      >
        {/* Decorative background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            <span className="inline-flex self-center lg:self-start px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400">
              🦷 Premier Dental Experience
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] md:leading-[1.15]">
              Excellence in Dental Care,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Tailored for Your Smile
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-550 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience premier dental health services with state-of-the-art operatory facilities, digital scanning, and personalized care mapping designed for your maximum comfort.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-4">
              <Button size="lg" onClick={() => handleBookingCTA()}>
                Book Appointment Now
              </Button>
              <a href="#services">
                <Button variant="secondary" size="lg">
                  Explore Services
                </Button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Premium glass frame for generated Hero image */}
            <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl p-2 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 backdrop-blur-2xl">
              <div className="relative w-full h-full rounded-[24px] overflow-hidden">
                <Image
                  src="/images/hero_dental_office.png"
                  alt="Modern Dental Operatory Samson Dental"
                  fill
                  sizes="(max-w-768px) 100vw, 450px"
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🧼 Services Section */}
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
            {activeServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={(svc) => setSelectedService(svc)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 📖 About Us Section */}
      <section id="about" className="py-20 md:py-28 px-6 border-t border-slate-105 dark:border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-500 dark:text-blue-400">About Samson Dental</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              A Higher Standard of Dental Care
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              At Samson Dental Center, our focus is delivering elite-level clinical dentistry within a relaxing, premium setting. Our practitioners stay at the absolute forefront of surgical, cosmetic, and diagnostic dentistry techniques.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="flex flex-col gap-2 p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/30">
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-450">99.8%</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Patient Satisfaction</span>
              </div>
              <div className="flex flex-col gap-2 p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/30">
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-450">15+</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Years Active Experience</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Our Core Dental Philosophies</h3>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg text-blue-500">🛡️</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-1">State-of-the-Art Precision</h4>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">We utilize ultra-precise diagnostic models, standard intra-oral scanners, and atomic holding parameters to minimize error.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg text-blue-500">🤍</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Relaxed Comfort Architecture</h4>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">Every operatory is crafted around sensory relaxation to secure absolute peace during active procedures.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🖼️ Gallery Section */}
      <section id="gallery" className="py-20 md:py-28 px-6 border-t border-slate-105 dark:border-white/5 bg-white dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-500 dark:text-blue-400">Facilities Tour</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4">
              Modern Clinical Settings
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore our state-of-the-art clinic design engineered to secure hygienic comfort and visual tranquility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
            {/* Gallery Item 1 */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-lg group">
              <Image
                src="/images/hero_dental_office.png"
                alt="Operatory Room"
                fill
                sizes="(max-w-768px) 100vw, 450px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <span className="text-white text-sm font-semibold tracking-wide">Dental Operatory Suite</span>
              </div>
            </div>

            {/* Gallery Item 2 */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-lg group">
              <Image
                src="/images/dental_waiting_room.png"
                alt="Waiting Lobby"
                fill
                sizes="(max-w-768px) 100vw, 450px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <span className="text-white text-sm font-semibold tracking-wide">Luxurious Lobby & Waiting Lounge</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✉️ Contact Section */}
      <section id="contact" className="py-20 md:py-28 px-6 border-t border-slate-105 dark:border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Clinic Contact Detail Card */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-500 dark:text-blue-400">Location & Connect</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Get In Touch With Us
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Have clinical inquiries, emergency requests, or questions regarding booking slots? Reach out to our receptionist team anytime.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-white/5 shadow-md shadow-slate-100/5 dark:shadow-none">
                <span className="text-2xl">📍</span>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Address</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">{config.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-white/5 shadow-md shadow-slate-100/5 dark:shadow-none">
                <span className="text-2xl">📞</span>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Phone</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">{config.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-white/5 shadow-md shadow-slate-100/5 dark:shadow-none">
                <span className="text-2xl">✉️</span>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Email</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">{config.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-white/5 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-100/5 dark:shadow-none">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Send an Online Inquiry</h3>
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-name" className="text-xs font-semibold text-slate-500">Your Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white"
                    placeholder="Enter name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-email" className="text-xs font-semibold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    id="contact-email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-xs font-semibold text-slate-500">Inquiry Details</label>
                <textarea
                  id="contact-message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                  rows={4}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white"
                  placeholder="Tell us what you need..."
                />
              </div>

              <Button type="submit" disabled={isContactSubmitting} className="mt-2 self-start w-full sm:w-auto">
                {isContactSubmitting ? 'Sending...' : 'Submit Inquiry'}
              </Button>
            </form>
          </div>
        </div>
      </section>

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
