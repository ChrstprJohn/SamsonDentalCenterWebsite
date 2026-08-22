'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

export interface ContactFormFields {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  contactEmail: string;
  setContactEmail: (val: string) => void;
  preferredStartTime: string;
  setPreferredStartTime: (val: string) => void;
  isContactSubmitting: boolean;
  contactMessage: string;
  setContactMessage: (val: string) => void;
}

import { NativeTimePopoverPicker } from '@/shared/components/native-time-popover-picker';

export function PreferenceFields({
  fields,
  minTime,
  maxTime,
  unavailableRanges,
  disabled = false,
}: {
  fields: ContactFormFields;
  minTime?: string;
  maxTime?: string;
  unavailableRanges?: Array<{ start: string; end: string }>;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 font-sans">
      <label className="text-[clamp(11px,0.3vw+11px,13px)] font-semibold text-gray-700">
        Preferred Time <span className="text-[#D94E4E]">*</span>
      </label>
      <NativeTimePopoverPicker
        value={fields.preferredStartTime}
        onChange={fields.setPreferredStartTime}
        placeholder={disabled ? 'Select a date first' : 'Select time'}
        minTime={minTime}
        maxTime={maxTime}
        unavailableRanges={unavailableRanges}
        disabled={disabled}
        triggerClassName="rounded-none"
      />
    </div>
  );
}

export function NameFields({
  fields,
  touched = false,
}: {
  fields: ContactFormFields;
  touched?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <TextField
        label="First Name *"
        value={fields.firstName}
        onChange={fields.setFirstName}
        required
        placeholder="e.g. Eleanor"
        touched={touched}
        isValid={/^[A-Za-z\s'-]+$/.test(fields.firstName.trim()) && fields.firstName.trim().length > 0}
        errorMessage="Enter your first name (letters only)."
      />
      <TextField
        label="Last Name *"
        value={fields.lastName}
        onChange={fields.setLastName}
        required
        placeholder="e.g. Vance"
        touched={touched}
        isValid={/^[A-Za-z\s'-]+$/.test(fields.lastName.trim()) && fields.lastName.trim().length > 0}
        errorMessage="Enter your last name (letters only)."
      />
    </div>
  );
}

export function ContactFields({
  fields,
  phone,
  setPhone,
  touched = false,
}: {
  fields: ContactFormFields;
  phone: string;
  setPhone: (value: string) => void;
  touched?: boolean;
}) {
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.contactEmail.trim());
  const isPhoneValid = /^09\d{9}$/.test(phone.trim().replace(/\D/g, ''));
  const formattedPhone = phone.replace(/\D/g, '').slice(0, 11).replace(/(\d{4})(\d{0,3})(\d{0,4})/, (_, prefix, middle, suffix) =>
    [prefix, middle, suffix].filter(Boolean).join(' ')
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <TextField
        label="Email Address *"
        type="email"
        value={fields.contactEmail}
        onChange={fields.setContactEmail}
        required
        placeholder="example@gmail.com"
        touched={touched}
        isValid={isEmailValid}
        errorMessage="Please enter a valid email address."
      />
      <TextField
        label="Phone Number *"
        type="tel"
        value={formattedPhone}
        onChange={(value) => setPhone(value.replace(/\D/g, '').slice(0, 11))}
        required
        placeholder="0930 323 1312"
        touched={touched}
        isValid={isPhoneValid}
        errorMessage="Please enter a valid phone number."
      />
    </div>
  );
}

export function PathwaySelect({ services, pathway, setPathway }: { services: ServiceResponseDto[]; pathway: string; setPathway: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-2 font-sans">
      <label className="text-[clamp(11px,0.3vw+11px,13px)] font-semibold text-gray-700">Select Specialty Pathway <span className="text-[#D94E4E]">*</span></label>
      <select value={pathway} onChange={(event) => setPathway(event.target.value)} className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-none text-xs sm:text-sm focus:outline-none focus:border-[#D94E4E] transition-colors appearance-none">
        {services.map((srv) => <option key={srv.id} value={srv.id}>{srv.name}</option>)}
      </select>
    </div>
  );
}

export function NotesField({ notes, setNotes }: { notes: string; setNotes: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-2 font-sans">
      <label className="text-[clamp(11px,0.3vw+11px,13px)] font-semibold text-gray-700">
        Anything else we should know? <span className="text-gray-400 font-normal">(Optional)</span>
      </label>
      <textarea
        rows={4}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Doctor preference, allergies, medical conditions, or special requests..."
        className={`w-full bg-white border px-4 py-3 rounded-none text-xs sm:text-sm font-normal text-gray-700 focus:outline-none transition-colors resize-none ${
          notes.trim().length > 0
            ? 'border-emerald-500 focus:border-emerald-600'
            : 'border-[#E4E4DC] focus:border-[#D94E4E]'
        }`}
      />
    </div>
  );
}

export function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#1D1E1E] text-white rounded-none text-xs font-semibold tracking-widest uppercase hover:bg-[#D94E4E] transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:pointer-events-none disabled:opacity-50">
      {isSubmitting ? 'Submitting Security Consultation...' : <>Submit Secure Request <Check className="w-4 h-4 ml-1" /></>}
    </button>
  );
}

export function ContactSuccess({ firstName, lastName, phone, onReset }: { firstName: string; lastName: string; phone: string; onReset: () => void }) {
  return (
    <motion.div key="success-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-none bg-[#D94E4E]/5 border border-[#D94E4E]/10 flex items-center justify-center text-[#D94E4E] mx-auto">
        <Check className="w-8 h-8" />
      </div>
      <h3 className="font-sans text-2xl font-light text-gray-900 mt-6">Reservation Received</h3>
      <p className="text-sm font-normal text-gray-500 max-w-md mx-auto leading-relaxed font-sans">
        Thank you, <span className="font-medium text-gray-900">{firstName} {lastName}</span>. Our reservation desk will contact you at <span className="font-medium text-gray-900">{phone}</span> within 24 working hours.
      </p>
      <button onClick={onReset} type="button" className="mt-8 px-6 py-2.5 bg-[#1D1E1E] hover:bg-[#D94E4E] text-white text-xs font-semibold rounded-none uppercase tracking-widest transition-all shadow-sm cursor-pointer">
        Submit another request
      </button>
    </motion.div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
  touched = false,
  isValid = false,
  errorMessage = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  touched?: boolean;
  isValid?: boolean;
  errorMessage?: string;
}) {
  const showRed = touched && required && (!value.trim() || !isValid);
  const showGreen = value.trim().length > 0 && isValid;

  return (
    <div className="flex flex-col gap-2 font-sans">
      <label className="text-[clamp(11px,0.3vw+11px,13px)] font-semibold text-gray-700">
        {label.replace(/\*$/, '')}
        {label.endsWith('*') && <span className="text-[#D94E4E]"> *</span>}
      </label>
      <div className="relative w-full">
        <input
          type={type}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white px-4 py-3 rounded-none text-xs sm:text-sm font-normal text-gray-700 focus:outline-none transition-colors border ${
            showRed
              ? 'border-red-500 text-red-900 bg-red-50/20 focus:border-red-600 ring-1 ring-red-500'
              : showGreen
              ? 'border-emerald-500 text-gray-900 focus:border-emerald-600'
              : 'border-[#E4E4DC] focus:border-[#D94E4E]'
          }`}
        />
      </div>
      {showRed && errorMessage && (
        <span className="text-[11px] text-red-600 font-medium font-sans">{errorMessage}</span>
      )}
    </div>
  );
}
