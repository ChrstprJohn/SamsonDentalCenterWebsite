import React from 'react';

export const metadata = {
  title: 'Terms of Service | Samson Dental Center',
  description: 'Understand the terms and agreements governing your dental care appointment reservations and patient portal access at Samson Dental Center.',
};

export default function TermsPage() {
  return (
    <div className="bg-[#FDFDFD] text-[#141515] min-h-screen pt-28 pb-20 md:pt-36 md:pb-28 font-sans relative overflow-hidden">
      <article className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 leading-relaxed">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-[11px] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-3 font-sans">
            Legal & Compliance
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] text-[#141515] leading-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-light">
            Last updated: May 31, 2026
          </p>
        </div>

        <div className="flex flex-col gap-12 mt-8 divide-y divide-gray-100">
          <section className="pt-8 first:pt-0">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">01</span>
              <span>Agreement to Terms</span>
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed">
              By accessing or using the Samson Dental Center portal, scheduling appointment slots, or obtaining dental services, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our online services.
            </p>
          </section>

          <section className="pt-8">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">02</span>
              <span>Account Registration & Security</span>
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed">
              To book appointment slots, patients are required to register and authenticate their identity via a verified email or OTP. You are entirely responsible for keeping your login credentials confidential and for all actions taken under your account.
            </p>
          </section>

          <section className="pt-8">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">03</span>
              <span>Appointment Booking & Cancellation</span>
            </h2>
            <ul className="list-disc pl-5 text-sm sm:text-base font-light text-gray-600 flex flex-col gap-2.5 mt-2">
              <li><strong className="text-[#141515] font-medium">Slot Holds</strong>: Real-time slot holds are reserved for up to 10 minutes prior to final booking validation.</li>
              <li><strong className="text-[#141515] font-medium">Rescheduling Limits</strong>: Unless modified by a system administrator, online rescheduling is limited to 1 occurrence per appointment. Further adjustments require direct communication with clinic staff.</li>
              <li><strong className="text-[#141515] font-medium">Cancellation Policy</strong>: Cancellations must be made at least 24 hours in advance and require entering a valid reason for registration logs.</li>
            </ul>
          </section>

          <section className="pt-8">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">04</span>
              <span>Medical Disclaimer</span>
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed">
              The content provided on this website, including services info and descriptions, is for educational and scheduling purposes only. It is not intended to replace direct professional clinical diagnosis, consultation, or therapeutic advice.
            </p>
          </section>

          <section className="pt-8">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">05</span>
              <span>Patient Conduct</span>
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed">
              We hold a strict zero-tolerance policy against any form of abusive, fraudulent, or automated booking actions. Abuse validation scans are triggered automatically upon submission to secure clinic rosters.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
