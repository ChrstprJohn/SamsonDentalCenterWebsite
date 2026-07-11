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

### Must Do (Pending Tasks):
*   [ ] **Migration:** Make `appointments.doctor_id` column nullable:
    ```sql
    ALTER TABLE public.appointments ALTER COLUMN doctor_id DROP NOT NULL;
    ```
*   [ ] **RPC Update:** Update the `submit_booking_transaction` and `create_manual_booking` RPC parameters to allow `p_doctor_id` as `NULL`.
*   [ ] **RPC Update:** Update `convert_inquiry_to_appointment` RPC to save converted inquiry appointments with state `'CONFIRMED'` instead of `'APPROVED'`.

---

## 2. Patient Portal / User Booking Flow (`/booking`)

### Already Implemented:
*   `DateTimeStep` component has been refactored: includes a `DoctorPreferenceSelector` ("Any Doctor" option) and a `Preferred Time of Day` toggle (Morning / Afternoon).
*   `use-booking-data.ts` queries calendar dates for "Any Doctor" by sending `doctorId: undefined` to the backend (which aggregates dates for all rostered doctors for that service).

### Must Do (Pending Tasks):
*   [ ] **Zod Schema:** In `submit-booking.dto.ts`, ensure `doctorId` is optional/nullable.
*   [ ] **Hook mapping (`use-user-booking.ts`):** 
    *   Stop selecting a fallback doctor (e.g. `data.doctors[0]`) when "Any Doctor" (`'ANY'`) is selected.
    *   Map `resolvedDoctorId` to `null` and set `doctorAssignmentSource: 'SYSTEM'` if `'ANY'` is chosen.
    *   If a specific doctor is chosen, map `resolvedDoctorId` to their UUID and set `doctorAssignmentSource: 'USER'`.
*   [ ] **Verification:** Ensure rescheduling and booking flow test suites are updated to verify this mapping.

---

## 3. Guest Inquiry Booking Flow (Landing Page Form)

### Already Implemented:
*   Landing page form captures guest details: Name, Phone, Email, DOB, Service, Preferred Date, and Time Preference (Morning / Afternoon).
*   Form does not ask for doctor selection.
*   Guest submissions save to `appointment_inquiries` table with status `'NEW'`.

### Must Do (Pending Tasks):
*   [ ] **Mapping Verification:** Verify that `submitInquirySchema` maps inquiries correctly and that they save to the DB without a `doctor_id`.

---

## 4. Secretary Dashboard Flow (`/secretary`)

### A. Pending Requests Queue (Review & Confirmation Loop)

#### Already Implemented:
*   `SecretaryPendingRequestsView` renders lists and details of pending requests.
*   Secretary can edit service, date, doctor, and note.

#### Must Do (Pending Tasks):
*   [ ] **Remove Slots Checking:** Remove all hourly time slot fetching (`getAvailableTimeSlotsAction`, `isLoadingSlots`, `availableSlots`) from `use-secretary-pending-requests.ts` and UI sub-components.
*   [ ] **Exact Start to End Time Inputs:** 
    *   In `PendingEditPanel`, replace the slot picker with two manual input fields: **Start Time** and **End Time**.
    *   Add validation in `finishAppointmentReview` ensuring Start and End times are filled, and End Time is after Start Time.
*   [ ] **Edit Form Order & Roster-based Filtering:**
    *   Arrange edit inputs in order: **Service** → **Date** → **Doctor** → **Start to End Time**.
    *   Instead of filtering dates by doctor, **filter doctors by date**: when the selected/edited Date changes, call `getAvailableDoctorsForDateAction` to retrieve only doctors rostered for that service on that date. Update the dropdown selection options.
    *   If no doctor was selected by the patient (doctor is null / `'SYSTEM'`), pre-fill the doctor input as blank and require the secretary to pick a doctor from the filtered dropdown.
*   [ ] **Status Transition:** Shift confirmation status updates from `'APPROVED'` to `'CONFIRMED'`.

### B. Walk-in / Phone Booking ("Mirror" Loop)

#### Already Implemented:
*   Dashboard allows manual booking but requires selecting pre-calculated slots.

#### Must Do (Pending Tasks):
*   [ ] **Remove Slots Picker:** Replace slot selector in `book-schedule-panel.tsx` with manual **Start to End Time** inputs.
*   [ ] **Immediate Status:** Insert mirrored walk-in appointments directly as `'CONFIRMED'`.

### C. Inquiry Conversion Queue

#### Already Implemented:
*   Allows converting guest leads into appointments using a slot picker.

#### Must Do (Pending Tasks):
*   [ ] **Remove Slots Picker:** Replace slot selector in `inquiry-schedule-panel.tsx` with manual **Start to End Time** inputs.
*   [ ] **Immediate Status:** Convert inquiries directly into a `'CONFIRMED'` status.

---

## 5. Operations & Automation Rules

### Already Implemented:
*   Resend email subscribers are wired to database triggers.

### Must Do (Pending Tasks):
*   [ ] **Enforce Status Lock:** Ensure no confirmation email or reminder countdown is scheduled/dispatched while an appointment's status is `'PENDING'` or `'CANCELLATION_PENDING'`.
*   [ ] **Trigger on CONFIRMED:** Fire confirmation emails and queue reminder cycles immediately when status changes to `'CONFIRMED'`.
