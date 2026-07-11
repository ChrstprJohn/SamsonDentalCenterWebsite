# Complete Booking Flow & Implementation Roadmap
# Refined: "Secretary-as-the-Brain"

This document outlines the current technical flow in the Samson Dental Center codebase, separating what is **already implemented** from what **must be done** to achieve the "Secretary-as-the-Brain" request-to-confirm lifecycle.

---

## 1. Database & Supabase RPCs

### Already Implemented:
*   `appointments` table has nullable `start_time` and `end_time` to support pending requests.
*   `appointments` table has `time_preference` (Zod/Check constraint: `'MORNING'`, `'AFTERNOON'`).
*   `submit_booking_transaction` and `request_reschedule_transaction` RPCs accept `p_time_preference`.
*   Exclusion constraint `no_overlapping_appointments` is bypassed for `'PENDING'` and `'RESCHEDULE_REQUESTED'` states.
*   [x] **Migration:** `appointments.doctor_id` is now nullable (migration `20260711030000_make_doctor_id_nullable_on_appointments.sql`).
*   [x] **RPC Update:** `submit_booking_transaction` and `create_manual_booking` RPCs accept `p_doctor_id` as `NULL`.
*   [x] **RPC Update:** `convert_inquiry_to_appointment` RPC now saves converted inquiry appointments with state `'APPROVED'` (mapped to Confirmed on UI) (migration `20260711040000_update_booking_rpcs_to_confirmed.sql`).

### Must Do (Pending Tasks):
*   None (Fully Implemented)

---

## 2. Patient Portal / User Booking Flow (`/booking`)

### Already Implemented:
*   `DateTimeStep` component has been refactored: includes a `DoctorPreferenceSelector` ("Any Doctor" option) and a `Preferred Time of Day` toggle (Morning / Afternoon).
*   `use-booking-data.ts` queries calendar dates for "Any Doctor" by sending `doctorId: undefined` to the backend (which aggregates dates for all rostered doctors for that service).
*   **Zod Schema:** In `submit-booking.dto.ts`, ensure `doctorId` is optional/nullable.
*   **Hook mapping (`use-user-booking.ts`):** 
    *   Stop selecting a fallback doctor (e.g. `data.doctors[0]`) when "Any Doctor" (`'ANY'`) is selected.
    *   Map `resolvedDoctorId` to `null` and set `doctorAssignmentSource: 'SYSTEM'` if `'ANY'` is chosen.
    *   If a specific doctor is chosen, map `resolvedDoctorId` to their UUID and set `doctorAssignmentSource: 'USER'`.
*   **Verification:** Ensure rescheduling and booking flow test suites are updated to verify this mapping.

### Must Do (Pending Tasks):
*   None (Fully Implemented)

---

## 3. Guest Inquiry Booking Flow (Landing Page Form)

### Already Implemented:
*   Landing page form captures guest details: Name, Phone, Email, DOB, Service, Preferred Date, and Time Preference (Morning / Afternoon).
*   Form does not ask for doctor selection.
*   Guest submissions save to `appointment_inquiries` table with status `'NEW'`.
*   **Mapping Verification:** Verify that `submitInquirySchema` maps inquiries correctly and that they save to the DB without a `doctor_id`.

### Must Do (Pending Tasks):
*   None (Fully Implemented)

---

## 4. Secretary Dashboard Flow (`/secretary`)

### A. Pending Requests Queue (Review & Confirmation Loop)

#### Already Implemented:
*   `SecretaryPendingRequestsView` renders lists and details of pending requests.
*   Secretary can edit service, date, doctor, and note.
*   [x] **Remove Slots Checking:** Removed all hourly time slot fetching from `use-secretary-pending-requests.ts` and UI sub-components.
*   [x] **Exact Start to End Time Inputs:** `PendingEditPanel` now has manual **Start Time** and **End Time** input fields with validation.
*   [x] **Edit Form Order & Roster-based Filtering:** Inputs arranged Service → Date → Doctor → Start/End Time. Doctor list filters by date via `getAvailableDoctorsForDateAction`. Any-Doctor requests pre-fill doctor as blank.
*   [x] **Dynamic Calendar:** Secretary edit panel calendar is now roster-based — highlights only dates where any doctor is rostered for the selected service (same as guest/auth booking).
*   [x] **Status Transition:** Confirmation now transitions to `'APPROVED'` (mapped to Confirmed on UI).

#### Must Do (Pending Tasks):
*   None (Fully Implemented)

### B. Walk-in / Phone Booking ("Mirror" Loop)

#### Already Implemented:
*   [x] **Remove Slots Picker:** `book-schedule-panel.tsx` now uses manual **Start to End Time** inputs instead of pre-calculated slot selection.
*   [x] **Immediate Status:** Walk-in appointments are inserted directly as `'APPROVED'` (mapped to Confirmed on UI).

#### Must Do (Pending Tasks):
*   None (Fully Implemented)

### C. Inquiry Conversion Queue

#### Already Implemented:
*   [x] **Remove Slots Picker:** `inquiry-schedule-panel.tsx` now uses manual **Start to End Time** inputs.
*   [x] **Immediate Status:** Inquiries are converted directly to `'APPROVED'` (mapped to Confirmed on UI).

#### Must Do (Pending Tasks):
*   None (Fully Implemented)

---

## 5. Operations & Automation Rules

### Already Implemented:
*   Resend email subscribers are wired to database triggers.

### Must Do (Pending Tasks):
*   [ ] **Enforce Status Lock:** Ensure no confirmation email or reminder countdown is scheduled/dispatched while an appointment's status is `'PENDING'` or `'CANCELLATION_PENDING'`.
*   [ ] **Trigger on CONFIRMED:** Fire confirmation emails and queue reminder cycles immediately when status changes to `'CONFIRMED'`.
