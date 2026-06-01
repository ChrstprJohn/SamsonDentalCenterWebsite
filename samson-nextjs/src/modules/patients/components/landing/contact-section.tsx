'use client';

import React from 'react';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { Button } from '@/components/ui/button';

interface ContactSectionProps {
  config: ClinicConfigResponseDto;
  contactForm: {
    contactName: string;
    setContactName: (val: string) => void;
    contactEmail: string;
    setContactEmail: (val: string) => void;
    contactMessage: string;
    setContactMessage: (val: string) => void;
    isContactSubmitting: boolean;
    handleContactSubmit: (e: React.FormEvent) => void;
  };
}

export function ContactSection({ config, contactForm }: ContactSectionProps) {
  const {
    contactName,
    setContactName,
    contactEmail,
    setContactEmail,
    contactMessage,
    setContactMessage,
    isContactSubmitting,
    handleContactSubmit,
  } = contactForm;

  return (
    <section id="contact" className="py-20 md:py-28 px-6 border-t border-slate-105 dark:border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
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
  );
}
