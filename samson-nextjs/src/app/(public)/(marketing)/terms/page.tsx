import React from 'react';

export const metadata = {
  title: 'Terms of Service | Samson Dental Center',
  description: 'Terms for using the Samson Dental Center appointment-request service.',
};

const sections = [
  ['Using the appointment service', 'This website lets you submit a request for a dental appointment. By using the booking wizard, you agree to provide information that is accurate and belongs to you, and to use the service only for a genuine appointment request.'],
  ['Appointment requests and confirmation', 'A submitted request is not a confirmed appointment. The clinic reviews the selected service, preferred date, preferred time, and your contact details before confirming availability. Samson Dental Center may contact you to confirm, clarify, or propose another schedule.'],
  ['Your information and communication', 'You are responsible for providing a working email address and mobile number. The clinic may use those details to respond to your request and coordinate the visit. If your contact details change, please contact the clinic directly.'],
  ['Preferred schedules', 'The date and time selected in the wizard are preferences, not a promise that the slot is available. Clinic schedules, service duration, staff availability, and other operational requirements may affect the final appointment time.'],
  ['Changes, cancellations, and no-shows', 'If you need to change or cancel a request or confirmed visit, contact Samson Dental Center as soon as possible. The clinic may release a slot or require additional coordination when a patient repeatedly misses appointments or submits requests that cannot be verified.'],
  ['Medical information and emergencies', 'Website content and appointment descriptions are general information and do not replace an examination or professional dental advice. Do not use the booking form for emergencies. Seek appropriate emergency care and contact local emergency services when necessary.'],
  ['Acceptable use', 'Do not misuse the booking wizard, submit false or automated requests, attempt to disrupt the service, or access information that does not belong to you. We may limit or refuse requests that appear abusive, fraudulent, or unsafe.'],
  ['Changes to these terms', 'Samson Dental Center may update these terms when the booking service or clinic procedures change. The latest version will be posted on this page with its updated date. Continued use of the appointment-request service after an update means you accept the revised terms.'],
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] px-6 pb-24 pt-28 font-sans text-[#141515] sm:px-12 md:pt-36">
      <article className="mx-auto max-w-5xl">
        <header className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between sm:mb-24">
          <div className="max-w-full md:max-w-[450px] lg:max-w-[580px]">
            <span className="mb-4 block text-[clamp(9px,0.2vw+9px,11px)] font-semibold uppercase tracking-[0.25em] text-[#D94E4E]">Legal & Compliance</span>
            <h1 className="font-sans text-[clamp(20px,2vw+10px,32px)] font-normal leading-[1.05] tracking-[-0.04em]">Terms of Service</h1>
            <p className="mt-5 text-xs text-gray-400">Last updated: August 15, 2026</p>
          </div>
          <p className="max-w-sm pt-2 text-[clamp(12px,0.3vw+11px,14px)] font-normal leading-[1.65] text-gray-500">The guidelines for using Samson Dental Center’s online appointment-request service, including requests, confirmations, communication, cancellations, and responsible use of the booking wizard.</p>
        </header>
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {sections.map(([title, content]) => (
            <section key={title} className="grid gap-5 py-9 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
              <h2 className="font-sans text-[clamp(18px,1vw+14px,24px)] font-normal leading-[1.15] tracking-[-0.03em]">{title}</h2>
              <p className="text-[clamp(13px,0.3vw+12px,15px)] leading-[1.75] text-gray-600">{content}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
