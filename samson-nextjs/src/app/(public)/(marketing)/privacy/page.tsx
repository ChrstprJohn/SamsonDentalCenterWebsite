import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Samson Dental Center',
  description: 'Learn about what information Samson Dental Center collects during appointment requests and how we protect and use your data.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-[#FDFDFD] text-[#141515] min-h-screen pt-28 pb-20 md:pt-36 md:pb-28 font-sans relative overflow-hidden">
      <article className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 leading-relaxed">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-[11px] tracking-[0.25em] text-[#D94E4E] uppercase font-semibold block mb-3 font-sans">
            Legal & Compliance
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] text-[#141515] leading-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-light">
            Last updated: August 15, 2026
          </p>
        </div>

        <div className="flex flex-col gap-12 mt-8 divide-y divide-gray-100">
          
          {/* 01: Overview */}
          <section className="pt-8 first:pt-0">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">01</span>
              <span>Overview</span>
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed">
              At Samson Dental Center, your privacy is important to us. This Privacy Policy outlines exactly what personal information we collect when you submit an appointment request on our website and how we handle, use, and protect that information.
            </p>
          </section>

          {/* 02: What We Collect on the Appointment Request Page */}
          <section className="pt-8">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">02</span>
              <span>What We Collect on the Appointment Request Page</span>
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed mb-4">
              When you submit an appointment request through our online booking wizard, we only ask for the specific details needed to process your reservation:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base font-light text-gray-600 flex flex-col gap-2.5">
              <li>
                <strong className="text-[#141515] font-medium">Your Name:</strong> First name and last name so our clinic staff can identify you.
              </li>
              <li>
                <strong className="text-[#141515] font-medium">Email Address:</strong> Used to send you appointment request confirmations, booking status updates, and calendar reminders.
              </li>
              <li>
                <strong className="text-[#141515] font-medium">Phone Number:</strong> Used by our reservation desk to call or text you to confirm your appointment slot and coordinate schedule availability.
              </li>
              <li>
                <strong className="text-[#141515] font-medium">Selected Treatment & Service:</strong> The specific dental service or treatment pathway you are requesting (e.g. Cosmetic Veneers, Implants, Aligners, Cleaning, etc.).
              </li>
              <li>
                <strong className="text-[#141515] font-medium">Preferred Date & Time:</strong> The target date and preferred time slot you chose for your visit.
              </li>
              <li>
                <strong className="text-[#141515] font-medium">Optional Notes & Remarks:</strong> Any additional information you choose to provide in the notes field, such as doctor preferences, dental concerns, allergies, medical conditions, or special accommodations.
              </li>
            </ul>
          </section>

          {/* 03: What We Do With Your Data */}
          <section className="pt-8">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">03</span>
              <span>What We Do With Your Data</span>
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed mb-4">
              The information you submit is used solely to manage your dental care and coordinate your visit:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base font-light text-gray-600 flex flex-col gap-2.5">
              <li><strong className="text-[#141515] font-medium">Reviewing & Confirming Your Request:</strong> Our reservation desk reviews your requested service, preferred date, and time to confirm schedule availability and assign the appropriate operatory.</li>
              <li><strong className="text-[#141515] font-medium">Contacting You:</strong> We contact you via phone or email within working hours to confirm your booking, advise you on any pre-visit preparations, or suggest alternative times if your chosen slot is unavailable.</li>
              <li><strong className="text-[#141515] font-medium">Preparing for Your Visit:</strong> Your requested procedure and any notes you shared are provided to the treating dental team so they can review your requirements prior to your arrival.</li>
              <li><strong className="text-[#141515] font-medium">Sending Reminders:</strong> We send you timely appointment reminders via SMS and email prior to your scheduled consultation.</li>
            </ul>
          </section>

          {/* 04: Data Sharing & Third Parties */}
          <section className="pt-8">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">04</span>
              <span>Data Sharing & Third Parties</span>
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed">
              We <strong className="text-[#141515] font-medium">never sell, rent, or share</strong> your personal details with advertisers or external marketing companies. Your information is only accessible to authorized clinic staff (secretaries and dentists) and trusted services necessary to operate our booking system (such as secure cloud database hosting and automated transactional email/SMS delivery providers).
            </p>
          </section>

          {/* 05: Data Security */}
          <section className="pt-8">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">05</span>
              <span>Data Security</span>
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed">
              We take appropriate technical and organizational measures to ensure your data is stored securely. All communications between your browser and our server are encrypted using industry-standard SSL/TLS protocols to prevent unauthorized access.
            </p>
          </section>

          {/* 06: Your Rights & Questions */}
          <section className="pt-8">
            <h2 className="text-xl sm:text-2xl font-normal text-[#141515] mb-3 flex items-center gap-3 font-sans">
              <span className="font-josefin text-gray-400 text-lg font-normal">06</span>
              <span>Your Rights & Questions</span>
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed">
              If you ever wish to review, update, or request the deletion of any contact information you submitted with an appointment request, or if you have any questions regarding your privacy, please feel free to reach out to our front desk or email us directly at <a href="mailto:contact@samsondental.com" className="text-[#D94E4E] hover:underline font-medium">contact@samsondental.com</a>.
            </p>
          </section>

        </div>
      </article>
    </div>
  );
}
