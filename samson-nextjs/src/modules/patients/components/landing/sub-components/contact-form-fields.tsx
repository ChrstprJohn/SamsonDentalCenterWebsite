'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

export interface ContactFormFields {
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
  isContactSubmitting: boolean;
}

export function NameFields({ fields }: { fields: ContactFormFields }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <TextField label="First Name *" value={fields.firstName} onChange={fields.setFirstName} required placeholder="Eleanor" />
        <TextField label="Middle Name" value={fields.middleName} onChange={fields.setMiddleName} placeholder="Jean" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <TextField label="Last Name *" value={fields.lastName} onChange={fields.setLastName} required placeholder="Vance" />
        <TextField label="Suffix" value={fields.suffix} onChange={fields.setSuffix} placeholder="Jr. / III" />
      </div>
    </>
  );
}

export function ContactFields({ fields, phone, setPhone }: { fields: ContactFormFields; phone: string; setPhone: (value: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <TextField label="Email Address *" type="email" value={fields.contactEmail} onChange={fields.setContactEmail} required placeholder="eleanor@domain.com" />
      <TextField label="Phone Number *" type="tel" value={phone} onChange={setPhone} required placeholder="+1 (555) 000-0000" />
    </div>
  );
}

export function PathwaySelect({ services, pathway, setPathway }: { services: ServiceResponseDto[]; pathway: string; setPathway: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-2 font-sans">
      <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Select Specialty Pathway *</label>
      <select value={pathway} onChange={(event) => setPathway(event.target.value)} className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-none text-xs sm:text-sm focus:outline-none focus:border-[#D94E4E] transition-colors appearance-none">
        {services.map((srv) => <option key={srv.id} value={srv.id}>{srv.name}</option>)}
      </select>
    </div>
  );
}

export function NotesField({ notes, setNotes }: { notes: string; setNotes: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-2 font-sans">
      <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Inquiry notes or health records outline</label>
      <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Please note any sensory preferences, prior dentist notes, or targets..." className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-none text-xs sm:text-sm focus:outline-none focus:border-[#D94E4E] transition-colors resize-none" />
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
      <p className="text-sm font-light text-gray-500 max-w-md mx-auto leading-relaxed font-sans">
        Thank you, <span className="font-medium text-gray-900">{firstName} {lastName}</span>. Our reservation desk will contact you at <span className="font-medium text-gray-900">{phone}</span> within 24 working hours.
      </p>
      <button onClick={onReset} type="button" className="mt-8 px-6 py-2.5 bg-[#1D1E1E] hover:bg-[#D94E4E] text-white text-xs font-semibold rounded-none uppercase tracking-widest transition-all shadow-sm cursor-pointer">
        Submit another request
      </button>
    </motion.div>
  );
}

function TextField({ label, value, onChange, type = 'text', required = false, placeholder = '' }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2 font-sans">
      <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">{label}</label>
      <input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-white border border-[#E4E4DC] px-4 py-3 rounded-none text-xs sm:text-sm focus:outline-none focus:border-[#D94E4E] transition-colors" />
    </div>
  );
}
