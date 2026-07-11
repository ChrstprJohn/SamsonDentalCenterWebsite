# Task: Unauthenticated Guest Appointment Inquiry Form Enhancements

This checklist tracks the modifications required to capture a guest's **Preferred Time of Day (Morning / Afternoon)** and optional details during unauthenticated landing page inquiry submissions, keeping user friction to a minimum.

> **Status Summary**: Sections 1–5 are fully implemented. Section 6 (UI simplification — removing middleName, suffix, dateOfBirth from rendered form) is the remaining work.

---

## 1. Database Schema Update [COMPLETED]
- [x] Create a migration file under `migrations/` (`20260711010000_add_dob_time_pref_to_inquiries.sql`):
  - [x] Add `date_of_birth` (`DATE` nullable) to `appointment_inquiries` table.
  - [x] Add `time_preference` (`TEXT` with CHECK constraint for `'MORNING' | 'AFTERNOON'` nullable) to `appointment_inquiries` table.
  - [x] Run the migration on Supabase/PostgreSQL.

---

## 2. Data Transfer Objects (DTOs) [COMPLETED]
**File:** [submit-inquiry.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/booking/submit-inquiry.dto.ts)
- [x] Update `submitInquirySchema` to validate:
  - `dateOfBirth`: Optional/nullable date string (in `YYYY-MM-DD` format, empty string transforms to `undefined`).
  - `timePreference`: Enum value `'MORNING' | 'AFTERNOON'` (required).
  - `middleName` and `suffix` remain optional/nullable via `cleanOptionalString`.
- [x] Update `inquiryDbSchema` to include:
  - `date_of_birth`: `z.string().nullable().optional()`
  - `time_preference`: `z.enum(['MORNING', 'AFTERNOON']).nullable().optional()`
- [x] Update `inquiryResponseSchema` mapping to return `dateOfBirth` and `timePreference` in camelCase.

**Co-located Test File:** [submit-inquiry.dto.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/booking/submit-inquiry.dto.spec.ts)
- [x] Tests assert:
  - Validation succeeds when `dateOfBirth` is missing or is a valid date string.
  - Validation succeeds with valid `timePreference` values (`'MORNING'` / `'AFTERNOON'`).
  - Validation fails for invalid `timePreference` values (e.g., `'EVENING'`).
  - DB snake_case → app camelCase transform verified.

---

## 3. Database Repository Command [COMPLETED]
**File:** [appointment-inquiries.commands.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/booking/appointment-inquiries.commands.ts)
- [x] Update `createInquiryCommand` insertion to include:
  - `date_of_birth` mapped from `data.dateOfBirth` (sending `null` if not provided)
  - `time_preference` mapped from `data.timePreference`
  - `middle_name` mapped from `data.middleName || null`
  - `suffix` mapped from `data.suffix || null`

**Co-located Test File:** [appointment-inquiries.commands.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/booking/appointment-inquiries.commands.spec.ts)
- [x] Tests verify `createInquiryCommand` inserts `date_of_birth` and `time_preference` correctly to Supabase.

---

## 4. Frontend Hook [COMPLETED]
**File:** [use-landing-view.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/hooks/landing/use-landing-view.ts)
- [x] Form state (`contactInquirySchema` Zod + `react-hook-form`) includes optional `dateOfBirth` and required `timePreference` (`'MORNING'` / `'AFTERNOON'`) with default `'MORNING'`.
- [x] `handleRealInquirySubmit` payload passes `dateOfBirth` (or `undefined`) and `timePreference` to `submitInquiryAction`.
- [x] `middleName` and `suffix` are sent as `undefined` when empty (via `|| undefined`).

**Co-located Test File:** [use-landing-view.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/hooks/landing/use-landing-view.spec.ts)
- [x] Tests verify successful submission sends `dateOfBirth: '1990-01-01'` and `timePreference: 'MORNING'`, and form resets on success.

---

## 5. UI Form Component [COMPLETED]
**Primary Files:**
- [contact-form-card.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/sub-components/contact-form-card.tsx) — composes the form section.
- [contact-form-fields.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/sub-components/contact-form-fields.tsx) — contains individual field components.

- [x] `PreferenceFields` component renders:
  - Two toggle buttons for **Preferred Time of Day** (Morning / Afternoon), marked required (`*`).
  - `<TextField type="date">` for **Date of Birth** (labeled "Optional").
- [x] `NameFields` component renders all four name fields: First Name, Middle Name, Last Name, Suffix.
- [x] Fields are wired through the `ContactFormFields` interface and bound to `useLandingView` hook state.

---

## 6. Simplify Inquiry Form UI [PENDING]
The business plan calls for reducing form friction by hiding non-essential fields. `middleName`, `suffix`, and `dateOfBirth` should be **removed from the rendered UI** while the backend (DTO, repository, hook submission) continues to accept them as optional/nullable.

### 6a. UI Component Changes
**File:** [contact-form-fields.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/sub-components/contact-form-fields.tsx)
- [ ] Remove `middleName` field from `NameFields` — keep only `firstName` and `lastName` in the grid.
- [ ] Remove `suffix` field from `NameFields` — keep only `firstName` and `lastName` in the grid.
- [ ] Remove `dateOfBirth` field from `PreferenceFields` — keep only the `timePreference` toggle buttons.

### 6b. Interface & Hook Adjustments
**File:** [contact-form-fields.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/sub-components/contact-form-fields.tsx)
- [ ] Update `ContactFormFields` interface — remove `middleName`, `setMiddleName`, `suffix`, `setSuffix`, `dateOfBirth`, `setDateOfBirth` (or keep them for data pass-through but not render them; preference is to remove them from the interface entirely since they are no longer shown).

**File:** [use-landing-view.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/hooks/landing/use-landing-view.ts)
- [ ] Remove `middleName`, `suffix`, `dateOfBirth` getters/setters from the `contactForm` return object (they are no longer needed by the UI).
- [ ] Ensure `handleRealInquirySubmit` still sends `middleName: undefined`, `suffix: undefined`, `dateOfBirth: undefined` in the `submitInquiryAction` payload (DTO/repo already handle these as nullable).

**File:** [contact-form-card.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/sub-components/contact-form-card.tsx)
- [ ] Remove `middleName`, `suffix`, `dateOfBirth` from the `ContactFormCardProps` (if they are no longer in `ContactFormFields`).

### 6c. Test File Updates
**File:** [use-landing-view.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/hooks/landing/use-landing-view.spec.ts)
- [ ] Update tests to reflect that the `contactForm` return object no longer exposes `middleName`, `suffix`, `dateOfBirth` setters.
- [ ] Ensure the submission test still verifies `submitInquiryAction` is called with the correct payload (including `dateOfBirth`, `middleName`, `suffix` as undefined/null when not provided).