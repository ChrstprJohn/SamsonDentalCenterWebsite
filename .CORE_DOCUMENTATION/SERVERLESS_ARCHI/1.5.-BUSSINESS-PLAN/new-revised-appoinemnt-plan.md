# New Revised Appointment and Inquiry Plan

This document details the refined business flow and technical changes required to replace the broad "Morning/Afternoon" time preferences with a specific **Preferred Start Time** requested by the patient.

---

## 1. Current Implementation vs. Proposed Changes

Below is a detailed comparison of the current system architecture and the required modifications for all affected components.

### A. Database Schema
*   **Current State:**
    *   `appointment_inquiries` table has a `time_preference` column restricted to `'MORNING' | 'AFTERNOON'` via a check constraint `check_time_preference`.
    *   `appointments` table has `time_preference` and `proposed_time_preference` columns restricted to `'MORNING' | 'AFTERNOON'` via check constraints (`check_appointments_time_preference` and `check_appointments_proposed_time_preference`).
    *   Database transaction functions (`submit_booking_transaction` and `request_reschedule_transaction`) accept and insert `p_time_preference` / `p_proposed_time_preference`.
*   **Proposed Modification:**
    *   Drop check constraints on `time_preference` / `proposed_time_preference`.
    *   Rename columns from `time_preference` / `proposed_time_preference` to `preferred_start_time` / `proposed_preferred_start_time` respectively, of type `TEXT` (to store 24h time strings like `"09:30"`).
    *   Update `submit_booking_transaction` database function to accept and insert `p_preferred_start_time` instead of `p_time_preference`.
    *   Update `request_reschedule_transaction` database function to accept and insert `p_proposed_preferred_start_time` instead of `p_proposed_time_preference`.
    *   Update `schema.sql` to align with the new schema definition.

### B. Unauthenticated (Guest) Request Flow
*   **Current State:**
    *   `use-landing-view.ts` uses `timePreference` validated by Zod `z.enum(['MORNING', 'AFTERNOON'])`.
    *   `contact-form-fields.tsx` (the guest inquiry form component) displays toggle buttons for "Morning" and "Afternoon".
*   **Proposed Modification:**
    *   Update Zod schema in `use-landing-view.ts` to validate a time string `preferredStartTime` formatted as HH:MM.
    *   Replace the toggle button component in `contact-form-fields.tsx` with a standard styled time input field (`<input type="time" />`) so guests can specify their desired starting time.
    *   Update DTO mapper and validation in `submit-inquiry.dto.ts` to validate and map `preferred_start_time`.

### C. Authenticated (Patient) Booking Wizard
*   **Current State:**
    *   `use-user-booking.ts` and state hook `use-booking-state.ts` track `timePreference` (`'MORNING' | 'AFTERNOON'`).
    *   `date-time-step.tsx` renders large "Morning" and "Afternoon" preference cards.
*   **Proposed Modification:**
    *   Update `use-booking-state.ts` to track `preferredStartTime` (defaulting to `"09:00"`).
    *   Modify `date-time-step.tsx` to display a custom time selection input, allowing the patient to specify their exact desired starting time.
    *   Update `ReviewStep`, `ReviewAppointmentDetails`, and `BookingSuccessView` to display the preferred start time (formatted using `formatTimeString`).
    *   Update DTO mapper and validation (`submit-booking.dto.ts`).

### D. Secretary Dashboard (Guest Inquiries & Pending Appointments)
*   **Current State:**
    *   **Inquiry Detail View:** When reviewing guest inquiries, `pending-request-overview.tsx` displays the broad "Preference: Morning/Afternoon".
    *   **Appointment Confirmation Panels:**
        *   `pending-edit-panel.tsx` provides Start Time and End Time inputs (`type="time"`). These fields start as empty/blank strings when editing a pending request.
        *   `inquiry-schedule-panel.tsx` provides Start Time and End Time inputs which are blank initially.
*   **Proposed Modification:**
    *   **Remove Morning/Afternoon Options:** Completely remove any references or displays of "Morning" / "Afternoon" preference from the secretary dashboard.
    *   **Auto-Fill Start Time:**
        *   In `pending-edit-panel.tsx` / `use-secretary-pending-requests.ts`, retrieve the patient's `preferredStartTime` and use it to auto-populate the local `startTime` state.
        *   In `inquiry-schedule-panel.tsx`, retrieve the patient's `preferredStartTime` and use it to auto-populate the local `selectedTime` (Start Time) state.
    *   **Set End Time:** The secretary is presented with the patient's desired starting time pre-filled. The secretary only needs to select/set the **End Time** (since the start time is already filled). If it's available, they approve it; otherwise, they can edit both.

---

## 2. Step-by-Step Task Checklist for Implementation

### Phase 1: Database Migration
- [ ] Create a migration file `20260712000000_migrate_time_preference_to_preferred_start_time.sql` in the migrations folder.
- [ ] Alter table `appointment_inquiries`: Drop constraint `check_time_preference` and rename column `time_preference` to `preferred_start_time`.
- [ ] Alter table `appointments`: Drop constraints `check_appointments_time_preference` & `check_appointments_proposed_time_preference`, and rename columns to `preferred_start_time` & `proposed_preferred_start_time`.
- [ ] Recreate database function `submit_booking_transaction` with the new column/argument mappings.
- [ ] Recreate database function `request_reschedule_transaction` with the new column/argument mappings.
- [ ] Update `schema.sql` to align with the new schema definition.

### Phase 2: DTOs & Action Mappers
- [ ] Modify `src/modules/appointments/dtos/shared/appointment.dto.ts` to map `preferred_start_time` and `proposed_preferred_start_time`.
- [ ] Modify `src/modules/appointments/dtos/booking/submit-inquiry.dto.ts`, `submit-booking.dto.ts`, and `request-reschedule.dto.ts` to validate `preferredStartTime` / `proposedPreferredStartTime` instead of `timePreference` / `proposedTimePreference`.
- [ ] Update repository command files `appointment-inquiries.commands.ts`, `appointment-booking.commands.ts`, and `request-reschedule-transaction.command.ts` to pass the updated parameters.
- [ ] Update reschedule use case `request-reschedule.use-case.ts` and action `request-reschedule.action.ts` to pass `preferredStartTime` instead of `timePreference`.

### Phase 3: Guest & Auth Frontend Forms
- [ ] Update `use-landing-view.ts` hooks and `contact-form-fields.tsx` / `contact-section.tsx` / `contact-form-card.tsx` components to capture and pass preferred start time.
- [ ] Update `use-booking-state.ts`, `use-user-booking.ts`, `submit-booking-payload.mapper.ts`, and `date-time-step.tsx` to replace Morning/Afternoon with preferred start time inputs.
- [ ] Update `ReviewStep`, `ReviewAppointmentDetails`, and `BookingSuccessView` to format and display the preferred start time.

### Phase 4: Secretary Confirmation & Auto-Fill
- [ ] Update `pending-request-overview.tsx` to render the requested start time using `formatTimeString`.
- [ ] Update `use-secretary-pending-requests.ts` and `pending-edit-panel.tsx` to pre-populate the secretary's `startTime` state with the patient's `preferredStartTime`.
- [ ] Update `inquiry-schedule-panel.tsx` to pre-populate the secretary's `selectedTime` state with the patient's `preferredStartTime`.

### Phase 5: Testing & Verification
- [ ] Run and update unit tests for DTO validation.
- [ ] Run and update unit tests for repository commands and use cases.
- [ ] Run and update unit tests for actions.
- [ ] Run and update unit tests for client hooks.
- [ ] Run `pnpm build` to verify Next.js compiles without any TS errors.
