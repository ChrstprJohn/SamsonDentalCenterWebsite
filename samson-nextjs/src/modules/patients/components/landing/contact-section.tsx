'use client';

import React, { useState } from 'react';
import { Phone, MapPin, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

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
    setContactMessage,
    isContactSubmitting,
    handleContactSubmit,
  } = contactForm;

  // Local state for the extra fields of the new design
  const [phone, setPhone] = useState('');
  const [pathway, setPathway] = useState('Cosmetic Dentistry');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedLocal, setSubmittedLocal] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct a comprehensive inquiry description
    const fullMessage = `Phone: ${phone}\nSpecialty Pathway: ${pathway}\nPreferred Target Date: ${targetDate}\n\nInquiry Notes:\n${notes}`;
    setContactMessage(fullMessage);

    // Call the parent handler
    handleContactSubmit(e);
    
    // Check if parent successfully submitted or sets loader
    setSubmittedLocal(true);
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#FDFDFD] relative w-full border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Information Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-[clamp(9px,0.2vw+9px,11px)] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-4 font-sans">
                Reservations
              </span>
              <h2 className="font-sans text-[clamp(22px,2vw+12px,38px)] font-normal tracking-[-0.04em] text-[#1D1E1E] leading-[1.1]">
                Inquire Consultation
              </h2>
              <p className="mt-6 text-[clamp(12px,0.3vw+11px,14px)] font-normal text-gray-500 max-w-sm leading-[1.65] font-sans">
                Reserve a time slot with our master clinicians for a detailed anatomical diagnostics overview. Our reservation concierges will follow up shortly to curate your bespoke visit.
              </p>
 
              {/* Coordinates */}
              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center text-[#1D1E1E] border border-gray-100 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-400 font-sans">Direct Desk</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 font-sans">{config.phone}</p>
                  </div>
                </div>
 
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center text-[#1D1E1E] border border-gray-100 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-400 font-sans">Oasis Address</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 font-sans">{config.address}</p>
                  </div>
                </div>
 
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center text-[#1D1E1E] border border-gray-100 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-400 font-sans">Consultation Hours</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 font-sans">Mon – Fri: 8:00 AM – 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Accreditations bar */}
            <div className="mt-12 lg:mt-0 pt-8 border-t border-gray-100 flex items-center gap-6">
              <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-gray-400 font-sans">Accredited Member:</span>
              <span className="text-xs font-serif italic text-[#1D1E1E] tracking-wider">American Academy of Cosmetic Dentistry</span>
            </div>
          </div>
 
          {/* Reservation Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-[#F9F9F6] border border-gray-200/50 p-8 sm:p-10 rounded-none" id="booking-form-card">
              <AnimatePresence mode="wait">
                {(!submittedLocal || isContactSubmitting) ? (
                  <motion.form
                    key="booking-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={onSubmit}
                    className="space-y-6"
                  >
                    <h3 className="font-sans text-lg font-medium text-gray-900 mb-6 border-b border-gray-200/50 pb-4">
                      Secure Appointment Pathway
                    </h3>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2 font-sans">
                        <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Eleanor Vance"
                          className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-none text-xs sm:text-sm focus:outline-none focus:border-[#D94E4E] transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-2 font-sans">
                        <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="eleanor@domain.com"
                          className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-none text-xs sm:text-sm focus:outline-none focus:border-[#D94E4E] transition-colors"
                        />
                      </div>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2 font-sans">
                        <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-none text-xs sm:text-sm focus:outline-none focus:border-[#D94E4E] transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-2 font-sans">
                        <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Select Specialty Pathway *</label>
                        <select
                          value={pathway}
                          onChange={(e) => setPathway(e.target.value)}
                          className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-none text-xs sm:text-sm focus:outline-none focus:border-[#D94E4E] transition-colors appearance-none"
                        >
                          <option value="Cosmetic Dentistry">Aesthetic Dentistry (Porcelain / Veneers)</option>
                          <option value="Restorative Care">Restorative Care (Structural biological implants)</option>
                          <option value="Preventative Wellness">Preventative Wellness (Therapy & Deep cleaning)</option>
                          <option value="Clear Orthodontics">Clear Alignment pathway</option>
                        </select>
                      </div>
                    </div>
 
                    <div className="flex flex-col gap-2 font-sans">
                      <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Preferred Target Date *</label>
                      <input
                        type="date"
                        required
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-none text-xs sm:text-sm focus:outline-none focus:border-[#D94E4E] transition-colors"
                      />
                    </div>
 
                    <div className="flex flex-col gap-2 font-sans">
                      <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Inquiry notes or health records outline</label>
                      <textarea
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Please note any sensory preferences, prior dentist notes, or targets..."
                        className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-none text-xs sm:text-sm focus:outline-none focus:border-[#D94E4E] transition-colors resize-none"
                      />
                    </div>
 
                    <button
                      type="submit"
                      disabled={isContactSubmitting}
                      className="w-full py-4 bg-[#1D1E1E] text-white rounded-none text-xs font-semibold tracking-widest uppercase hover:bg-[#D94E4E] transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                    >
                      {isContactSubmitting ? 'Submitting Security Consultation...' : (
                        <>
                          Submit Secure Request
                          <Check className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-none bg-[#D94E4E]/5 border border-[#D94E4E]/10 flex items-center justify-center text-[#D94E4E] mx-auto">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="font-sans text-2xl font-light text-gray-900 mt-6">
                      Reservation Received
                    </h3>
                    <p className="text-sm font-light text-gray-500 max-w-md mx-auto leading-relaxed font-sans">
                      Thank you, <span className="font-medium text-gray-900">{contactName}</span>. Your details are secure. Our cosmetic reservation desk will contact you at <span className="font-medium text-gray-900">{phone}</span> within 24 working hours to finalize our diagnostics outline.
                    </p>
                    <button
                      onClick={() => {
                        setSubmittedLocal(false);
                        setPhone('');
                        setTargetDate('');
                        setNotes('');
                      }}
                      type="button"
                      className="mt-8 px-6 py-2.5 bg-[#1D1E1E] hover:bg-[#D94E4E] text-white text-xs font-semibold rounded-none uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                    >
                      Submit another request
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
