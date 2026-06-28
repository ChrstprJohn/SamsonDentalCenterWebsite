import React from 'react';

export const metadata = {
  title: 'Terms of Service | Samson Dental Center',
  description: 'Understand the terms and agreements governing your dental care appointment reservations and patient portal access at Samson Dental Center.',
};

export default function TermsPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-24 text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Last updated: May 31, 2026
        </p>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-slate-100 dark:border-white/5 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-100/10 dark:shadow-none flex flex-col gap-10">
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Agreement to Terms</h2>
          <p className="text-sm md:text-base">
            By accessing or using the Samson Dental Center portal, scheduling appointment slots, or obtaining dental services, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our online services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Account Registration & Security</h2>
          <p className="text-sm md:text-base">
            To book appointment slots, patients are required to register and authenticate their identity via a verified email or OTP. You are entirely responsible for keeping your login credentials confidential and for all actions taken under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Appointment Booking & Cancellation</h2>
          <ul className="list-disc pl-5 text-sm md:text-base flex flex-col gap-2 mt-2">
            <li><strong>Slot Holds</strong>: Real-time slot holds are reserved for up to 10 minutes prior to final booking validation.</li>
            <li><strong>Rescheduling Limits</strong>: Unless modified by a system administrator, online rescheduling is limited to 1 occurrence per appointment. Further adjustments require direct communication with clinic staff.</li>
            <li><strong>Cancellation Policy</strong>: Cancellations must be made at least 24 hours in advance and require entering a valid reason for registration logs.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Medical Disclaimer</h2>
          <p className="text-sm md:text-base">
            The content provided on this website, including services info and descriptions, is for educational and scheduling purposes only. It is not intended to replace direct professional clinical diagnosis, consultation, or therapeutic advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Patient Conduct</h2>
          <p className="text-sm md:text-base">
            We hold a strict zero-tolerance policy against any form of abusive, fraudulent, or automated booking actions. Abuse validation scans are triggered automatically upon submission to secure clinic rosters.
          </p>
        </section>
      </div>
    </article>
  );
}
