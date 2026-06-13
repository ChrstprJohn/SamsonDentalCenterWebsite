# Task: Booking Confirmation Email Enhancement

The current `appointment_booked` email template (`appointment-booked-email.tsx`) needs to be rebuilt as a **professional transactional email**. The email should contain the same core data shown on the booking success screen, but written and laid out as a formal clinic communication — not a UI widget copy.

---

## Design Principle

> The email is **not** a 1-to-1 copy of the success screen.
> It should feel like a professional email from a dental clinic:
> warm, clear, trustworthy — with all the information a patient
> needs to understand their booking status.

---

## Email Content Requirements

### Subject Line
- **Self**: `Appointment Request Received – Samson Dental Center`
- **Dependent**: `Family Member Appointment Request Received – Samson Dental Center`

### Preview Text
- **Self**: `Your request is under staff review. We'll notify you once it's confirmed.`
- **Dependent**: `A family member booking has been submitted and is pending staff verification.`

---

### Opening Greeting
Warm and personal. Address the **account holder** by first name.

```
Dear Christopher,

Thank you for submitting your appointment request at Samson Dental Center.
We have successfully received it and our administration team is currently
verifying the details against the doctor's schedule.
```

For dependent bookings:
```
Dear Christopher,

Thank you for submitting an appointment request on behalf of a family member
at Samson Dental Center. We have received it and our team is reviewing
the scheduling details.
```

---

### Appointment Summary Section

A clean, readable table/grid with all relevant details. Labeled clearly.

#### Self Booking Fields:
- **Patient Name** — full name
- **Treatment Service** — service name
- **Assigned Doctor** — Dr. Full Name
- **Appointment Date** — e.g., June 4, 2026
- **Requested Time Window** — e.g., 9:30 AM – 10:00 AM (UTC)
- **Current Status** — Pending Staff Review

#### Dependent Booking — Additional Fields:
- **Patient Name** — family member's full name
- **Relationship** — e.g., Spouse, Child, Parent
- **Booked By** — account holder's full name (Christopher Picardo)
- *(then same service/doctor/date/time/status fields)*

#### Footer of Summary Block:
- **Reference / Appointment ID** — small, muted monospace text at the bottom of the card for reference

---

### What Happens Next Section

Professional tone, not bullet-point icons. Written as a short paragraph or numbered steps:

```
What happens next?

1. Staff Review — Our clinic secretary will review and verify your requested
   time slot. This typically takes less than 2 hours during clinic hours.

2. Confirmation — Once your appointment is confirmed, you will receive a
   separate email notification with your final appointment details.

If you have any questions, please contact us directly at the clinic.
```

---

### CTA Button
```
[ View My Appointments ]  →  /user
```

---

### Footer
```
© 2026 Samson Dental Center. All rights reserved.
This is an automated message. Please do not reply to this email.
```

---

## Implementation Tasks

### Email Template (`appointment-booked-email.tsx`)

- [ ] Add new props to the component interface:
  - `patientType: 'SELF' | 'DEPENDENT'`
  - `relationship?: string`
  - `bookedByName?: string` (account holder full name — only for dependents)
- [ ] Rename all labels to professional clinical terminology:
  - `Service` → `Treatment Service`
  - `Doctor` → `Assigned Doctor`
  - `Time` → `Requested Time Window`
  - `Status` pill → `Pending Staff Review`
- [ ] Write the opening greeting paragraph (warm, formal, addressing the account holder by name)
- [ ] Conditionally render dependent-only rows (`Relationship`, `Booked By`) only when `patientType === 'DEPENDENT'`
- [ ] Render `Appointment ID` at the very bottom of the summary block, small and muted
- [ ] Add "What happens next?" as numbered prose paragraphs (not emoji icon bullets)
- [ ] Update subject line and preview text dynamically based on `patientType`
- [ ] Add a `[ View My Appointments ]` CTA button linking to `/user`
- [ ] Professional footer with copyright and do-not-reply notice

---

### Subscriber (`on-appointment-booked.subscriber.ts`)

- [ ] Update payload schema (`appointment-booked.event.dto.ts`) to include:
  - `patientType: 'SELF' | 'DEPENDENT'`
  - `dependentId?: string` (UUID, only for dependent bookings)
- [ ] If `patientType === 'DEPENDENT'`:
  - Query the `dependents` table for dependent's full name and relationship
  - Populate `bookedByName` from the existing patient record
- [ ] Pass all new props through to `ResendService.sendTemplatedEmail`

---

### Database RPC / Outbox Payload

- [ ] Add `patientType` (`'SELF'` | `'DEPENDENT'`) to the outbox event payload emitted inside the booking transaction RPC
- [ ] Add `dependentId` (nullable UUID) to the outbox payload
- [ ] Update `schema.sql` and the relevant migration file

---

### ResendService (`resend.service.ts`)

- [ ] Update the `appointment_booked` template type in `EmailTemplates` to include:
  - `patientType`
  - `relationship?`
  - `bookedByName?`
- [ ] Pass all new props through to `React.createElement(AppointmentBookedEmail, {...})`

---

## Notes

- All dates and times must remain UTC-formatted (enforced by `date.util.ts`) to be consistent with the database
- The email must not crash if `relationship` or `bookedByName` are `undefined` (self-booking path)
- Email tone is professional and clinical — avoid informal language, emojis in body text, or UI-widget-style formatting
