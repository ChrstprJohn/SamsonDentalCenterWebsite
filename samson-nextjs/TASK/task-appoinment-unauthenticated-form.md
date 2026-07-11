# Task: Unauthenticated Guest Appointment Inquiry Form Enhancements

This checklist tracks the modifications required to capture a guest's **Preferred Time of Day (Morning / Night)** and optional details during unauthenticated landing page inquiry submissions, keeping user friction to a minimum.

---

## 1. Database Schema Update
- [ ] Create a migration file under `migrations/` (e.g., `20260711010000_add_dob_time_pref_to_inquiries.sql`):
  - [ ] Add `date_of_birth` (`DATE` nullable) to `appointment_inquiries` table.
  - [ ] Add `time_preference` (`TEXT` or a defined enum, e.g., `'MORNING' | 'NIGHT'` or `'MORNING' | 'AFTERNOON'` nullable) to `appointment_inquiries` table.
  - [ ] Run the migration on Supabase/PostgreSQL.

---

## 2. Data Transfer Objects (DTOs)
**File:** [submit-inquiry.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/booking/submit-inquiry.dto.ts)
- [ ] Update `submitInquirySchema` to validate:
  - `dateOfBirth`: Optional/nullable date string (in `YYYY-MM-DD` format, allowing the user to skip it).
  - `timePreference`: Enum value (e.g., `'MORNING' | 'NIGHT'`).
  - Ensure `middleName` and `suffix` remain optional/nullable.
- [ ] Update `inquiryDbSchema` to include:
  - `date_of_birth`: `z.string().nullable().optional()`
  - `time_preference`: `z.enum(['MORNING', 'NIGHT']).nullable().optional()`
- [ ] Update `inquiryResponseSchema` mapping to return `dateOfBirth` and `timePreference` in camelCase.

**Co-located Test File:** [submit-inquiry.dto.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/booking/submit-inquiry.dto.spec.ts)
- [ ] Update/add tests in `submit-inquiry.dto.spec.ts` to assert:
  - Validation succeeds when `dateOfBirth` is missing or is a valid date string.
  - Validation succeeds with valid `timePreference` values.
  - Validation fails for invalid `timePreference` formats or values.

---

## 3. Database Repository Command
**File:** [appointment-inquiries.commands.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/booking/appointment-inquiries.commands.ts)
- [ ] Update the `createInquiry` command insertion script to include the new columns:
  - `date_of_birth` mapped from `data.dateOfBirth` (sending `null` if not provided)
  - `time_preference` mapped from `data.timePreference`

**Co-located Test File:** [appointment-inquiries.commands.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/booking/appointment-inquiries.commands.spec.ts)
- [ ] Update unit/integration tests to verify that `createInquiry` inserts `date_of_birth` and `time_preference` correctly to Supabase.

---

## 4. Frontend Hook
**File:** [use-landing-view.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/hooks/landing/use-landing-view.ts)
- [ ] Extend form state and default values to include optional `dateOfBirth` and `timePreference`.
- [ ] Update `submitInquiryAction` payload in the submission handler.

**Co-located Test File:** [use-landing-view.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/hooks/landing/use-landing-view.spec.ts)
- [ ] Update tests to verify that `submitInquiryAction` is triggered with the correct `timePreference` and optional `dateOfBirth` inputs when the form is submitted.

---

## 5. UI Form Component
**File:** [contact-section.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/contact-section.tsx)
- [ ] Add Form Select/Radio Group for **Preferred Time of Day** (Morning / Night).
- [ ] (Optional) Add Form Input field for **Date of Birth** (clearly marked as optional/nullable, or omit from the initial guest form to keep it simple as per user preference).
- [ ] Bind these fields to the form hook state.
