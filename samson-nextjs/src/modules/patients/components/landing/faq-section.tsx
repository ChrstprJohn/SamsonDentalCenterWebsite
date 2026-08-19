'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

const faqs = [
  {
    question: 'How do I book an appointment?',
    answer: '',
  },
  {
    question: 'What should I expect during my first visit?',
    answer: 'Your first visit begins with a conversation about your goals, followed by a personalized assessment. Your practitioner will then walk you through recommended next steps.',
  },
  {
    question: 'How long does a typical appointment take?',
    answer: 'Appointment times vary by service. The estimated duration is shown when you select a service, so you can plan your visit with confidence.',
  },
  {
    question: 'Can I reschedule or cancel my appointment?',
    answer: 'Yes. Please contact the clinic as soon as possible if you need to change your appointment, and our team will help find the best alternative.',
  },
  {
    question: 'Do you offer guidance for anxious patients?',
    answer: 'Absolutely. Comfort is part of every visit. Tell us what you need when booking so our team can tailor your experience and answer any questions beforehand.',
  },
  {
    question: 'Where is Samson Dental Center located?',
    answer: 'You can find our current clinic address, contact details, and directions in the Contact section below. Please reach out if you need help finding us before your visit.',
  },
  {
    question: 'Do I need to prepare anything before my appointment?',
    answer: 'Bring any relevant dental records, medication details, and questions you would like to discuss. Arriving a few minutes early also gives you time to complete any necessary information.',
  },
];

export function FaqSection({ config }: { config: ClinicConfigResponseDto }) {
  const formattedPhone = config.phone.replace(/^\+63\s?/, '0');
  const formattedLandline = config.landline?.replace(/^\+63\s?/, '0');
  const faqItems = faqs.map((faq) => faq.question === 'How do I book an appointment?'
    ? { ...faq, answer: `You can contact us directly at ${formattedPhone}, or submit an appointment request through our website. Our team will follow up to confirm your visit.` }
    : faq);

  return (
    <section id="faq" className="border-t border-gray-100 bg-[#FDFDFD] py-16 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <div className="mb-10 flex flex-col gap-4 sm:mb-24 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
          <span className="mb-4 block font-sans text-[clamp(9px,0.2vw+9px,11px)] font-semibold uppercase tracking-[0.25em] text-[#D94E4E]">
            Frequently Asked
          </span>
          <h2 className="font-sans text-[18px] sm:text-[clamp(20px,2vw+10px,32px)] font-normal leading-[1.05] tracking-[-0.04em] text-[#1D1E1E]">
            Everything you need to know before,
            <br />
            during, and after your visit.
          </h2>
          </div>
          <p className="max-w-sm pt-1 font-sans text-[12px] sm:pt-2 sm:text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-[1.65] text-gray-500">
            Clear answers to the questions we hear most often, from booking and preparation to what happens during and after your visit.
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
          {faqItems.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`} className="border-[#1D1E1E]/15">
              <AccordionTrigger className="px-0 py-6 sm:py-8 text-left font-sans text-base sm:text-lg md:text-lg lg:text-2xl font-normal leading-[1.2] tracking-tight text-[#1D1E1E] hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94E4E]/40">
                <span className="flex flex-1 items-center gap-4 sm:gap-10 pr-4">
                  <span className="flex-1 text-left">{faq.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-4 font-sans text-[12px] sm:pb-6 sm:text-[clamp(14px,0.4vw+12px,16px)] leading-[1.6] text-gray-500">
                <span className="block max-w-3xl text-left">
                {faq.question === 'How do I book an appointment?'
                  ? <>You can contact us directly at <strong className="font-semibold text-[#1D1E1E]">{formattedPhone}</strong>{formattedLandline && <> or <strong className="font-semibold text-[#1D1E1E]">{formattedLandline}</strong></>}, or submit an appointment request through our website. Our team will follow up to confirm your visit.</>
                  : faq.answer}
                </span>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
