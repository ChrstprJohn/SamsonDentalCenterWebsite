import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Samson Dental Center',
  description: 'How Samson Dental Center handles information submitted through appointment requests.',
};

const sections = [
  ['What this policy covers', 'This policy explains how Samson Dental Center handles information submitted through the appointment-request booking wizard on this website. It applies to the information you choose to provide when requesting a visit.'],
  ['Information collected in a booking request', 'The booking wizard asks for your first name, last name, email address, mobile phone number, selected service, preferred appointment date, preferred start time, and any optional notes you choose to provide. Notes may include a concern, preference, or accommodation you want the clinic to know before contacting you.'],
  ['How we use the information', 'We use these details to review and manage your appointment request, check availability for the selected service and preferred schedule, contact you about the request, and prepare the clinic team for follow-up. Submitting a request does not by itself guarantee an appointment; the clinic must review and confirm it.'],
  ['What we do not collect through this form', 'The booking request is not a full medical-record system. Please do not use the optional notes field to submit highly sensitive medical records, payment-card details, passwords, or information about another person. If the clinic needs additional information, staff will request it through an appropriate channel.'],
  ['Sharing and service providers', 'Your request is made available to authorized Samson Dental Center staff who need it to coordinate care. The application may also use service providers for hosting, database operations, and transactional communications. We do not use appointment-request information for unrelated advertising or sell it to advertisers.'],
  ['Retention and your choices', 'We retain booking-request information for as long as reasonably needed to coordinate the request, maintain operational records, and meet applicable obligations. You may ask the clinic to review, correct, or delete contact information you submitted, subject to records we are required or permitted to retain.'],
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] px-6 pb-24 pt-28 font-sans text-[#141515] sm:px-12 md:pt-36">
      <article className="mx-auto max-w-5xl">
        <header className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between sm:mb-24">
          <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
            <span className="mb-4 block text-[clamp(9px,0.2vw+9px,11px)] font-semibold uppercase tracking-[0.25em] text-[#D94E4E]">Legal & Compliance</span>
            <h1 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal leading-[1.05] tracking-[-0.04em]">Privacy Policy</h1>
            <p className="mt-5 text-xs text-gray-400">Last updated: August 15, 2026</p>
          </div>
          <p className="max-w-sm pt-2 text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-[1.65] text-gray-500">A clear explanation of what we receive through an appointment request, why we need those details, how the clinic uses them to coordinate your visit, and the choices available to you.</p>
        </header>
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {sections.map(([title, content]) => (
            <section key={title} className="grid gap-5 py-9 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
              <h2 className="font-sans text-[clamp(18px,1vw+14px,24px)] font-normal leading-[1.15] tracking-[-0.03em]">{title}</h2>
              <p className="text-[clamp(13px,0.3vw+12px,15px)] leading-[1.75] text-gray-600">{content}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-gray-500">Questions or privacy requests can be directed to the clinic using the contact details shown on this website.</p>
      </article>
    </main>
  );
}
