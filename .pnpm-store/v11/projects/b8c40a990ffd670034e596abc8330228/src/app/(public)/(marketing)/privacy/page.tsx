import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Samson Dental Center',
  description: 'Learn about how Samson Dental Center securely collects, stores, and handles your clinical data, session records, and patient info.',
};

export default function PrivacyPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-24 text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Last updated: May 31, 2026
        </p>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-slate-100 dark:border-white/5 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-100/10 dark:shadow-none flex flex-col gap-10">
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Information We Collect</h2>
          <p className="text-sm md:text-base">
            We collect minimal, necessary data required to register and securely schedule your clinical treatments:
          </p>
          <ul className="list-disc pl-5 text-sm md:text-base flex flex-col gap-2 mt-2">
            <li><strong>Personal Identity</strong>: First, Middle, and Last Name, Suffix, Date of Birth, and Relationship (for dependents).</li>
            <li><strong>Contact Details</strong>: Email address and verified mobile phone numbers.</li>
            <li><strong>Medical Notes</strong>: Pre-booking remarks or procedural history logs generated during clinical operatory sessions.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. How We Use Your Information</h2>
          <p className="text-sm md:text-base">
            Your personal and dental data is only utilized for booking validations, automated appointment reminders, treatment logging (Draft Invoices), and to secure communications between the patient and clinicians.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Data Security & Storage</h2>
          <p className="text-sm md:text-base">
            We store clinical data and credentials in highly protected servers with end-to-end SSL encryption. Session states are continuously scrutinized under Supabase auth architectures, protecting clinical history from unauthorized leaks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Patient Rights</h2>
          <p className="text-sm md:text-base">
            Under health privacy rules, patients have the right to request comprehensive digital copies of their billing history, clinical charts, and registered profile properties. To initiate requests or deactivate credentials, please connect with the clinic secretary.
          </p>
        </section>
      </div>
    </article>
  );
}
