'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { ContactCalendar } from './contact-calendar';
import {
  ContactFields,
  ContactSuccess,
  NameFields,
  NotesField,
  PathwaySelect,
  SubmitButton,
  type ContactFormFields,
} from './contact-form-fields';

interface ContactFormCardProps {
  services: ServiceResponseDto[];
  fields: ContactFormFields;
  phone: string;
  setPhone: (value: string) => void;
  pathway: string;
  setPathway: (value: string) => void;
  targetDate: string;
  setTargetDate: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  submittedLocal: boolean;
  currentMonth: Date;
  setCurrentMonth: (value: Date) => void;
  availableDates: string[];
  isLoadingDays: boolean;
  onSubmit: () => Promise<void>;
  onReset: () => void;
}

export function ContactFormCard(props: ContactFormCardProps) {
  const { fields } = props;

  return (
    <div className="lg:col-span-7">
      <div className="bg-[#F9F9F6] border border-gray-200/50 p-8 sm:p-10 rounded-none" id="booking-form-card">
        <AnimatePresence mode="wait">
          {(!props.submittedLocal || fields.isContactSubmitting) ? (
            <motion.form
              key="booking-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                await props.onSubmit();
              }}
              className="space-y-6"
            >
              <h3 className="font-sans text-lg font-medium text-gray-900 mb-6 border-b border-gray-200/50 pb-4">
                Secure Appointment Pathway
              </h3>
              <NameFields fields={fields} />
              <ContactFields fields={fields} phone={props.phone} setPhone={props.setPhone} />
              <PathwaySelect services={props.services} pathway={props.pathway} setPathway={props.setPathway} />
              <div className="flex flex-col gap-2 font-sans">
                <label className="text-[10px] tracking-wider uppercase font-semibold text-gray-500">Preferred Target Date *</label>
                <ContactCalendar
                  currentMonth={props.currentMonth}
                  availableDates={props.availableDates}
                  targetDate={props.targetDate}
                  isLoadingDays={props.isLoadingDays}
                  onMonthChange={props.setCurrentMonth}
                  onDateSelect={props.setTargetDate}
                />
                {props.targetDate && (
                  <div className="text-[11px] font-sans text-emerald-600 bg-emerald-50 p-2 border border-emerald-200 mt-1">
                    Selected: <span className="font-bold">{props.targetDate}</span>
                  </div>
                )}
              </div>
              <NotesField notes={props.notes} setNotes={props.setNotes} />
              <SubmitButton isSubmitting={fields.isContactSubmitting} />
            </motion.form>
          ) : (
            <ContactSuccess firstName={fields.firstName} lastName={fields.lastName} phone={props.phone} onReset={props.onReset} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
