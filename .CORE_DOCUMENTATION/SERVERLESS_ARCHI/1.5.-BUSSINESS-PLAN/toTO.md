# Complete Booking Flow & Implementation Roadmap

This document outlines the current technical flow implemented in the Samson Dental Center codebase and details the specific code modifications required to implement the new "Request-to-Confirm" appointment lifecycle.

---

## 1. User & Patient Booking Flow

### A. Patient Portal / User Booking (`/booking`)
*   **Target Files**:
    *   [booking-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/views/booking-view.tsx)
    *   [use-user-booking.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/hooks/booking/use-user-booking.ts)
    *   [date-time-step.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/components/booking/date-time-step.tsx)
    *   [submit-booking.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/booking/submit-booking.use-case.ts)
*   **Current Flow**:
    1.  User selects a service, a doctor preference, and a date.
    2.  The wizard fetches exact hourly time slots from `availableSlots` via backend queries.
    3.  User selects an exact time slot (e.g., `09:00 AM - 10:00 AM`).
    4.  `submitBookingUseCase` validates the availability of that exact slot, checks for overlaps, and inserts it with status `'PENDING'`.
*   **What to Modify/Add**:
    1.  **Identify the Only Dynamic Inputs**: Ensure the wizard only dynamically checks:
        *   **Service**: Fetched dynamically from database.
        *   **Doctor**: Dynamically filtered to show only doctors performing the selected service.
        *   **Date**: Dynamically enabled on the calendar matching when the selected doctor is rostered to work.
    2.  **Remove Slot Picker**: Completely remove the specific `AvailableTimeSlots` picker.
    3.  **Add Static Preference**: Add a simple selection for **Morning** or **Afternoon** preference.
    4.  **State & Hook Changes**: Update `use-user-booking.ts` to track `timePreference` (enum: `MORNING`, `AFTERNOON`) instead of `selectedSlot` (hourly range).
    5.  **Use Case Adjustment**: Update `submitBookingUseCase` to skip real-time slot availability validation since the user is not selecting a specific hour. Instead, save the Date + Doctor preference + Time-of-day preference to the database (saving status as `'PENDING'`).

### B. Guest Inquiry Booking (Unauthenticated Landing Page Leads)
*   **Target Files**:
    *   [submit-inquiry.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/booking/submit-inquiry.use-case.ts)
    *   Landing page inquiry form component.
*   **Current Flow**:
    1.  Guest submits preferred service, date, and doctor.
    2.  Saves to the `appointment_inquiries` table with status `'NEW'`.
*   **What to Modify/Add**:
    1.  Update the guest form to capture the **Morning/Afternoon time-of-day preference** alongside the preferred date.
    2.  Ensure it saves the time preference in the database.

---

## 2. Secretary Dashboard Flow (`/secretary`)

### A. Pending Requests Queue (Review & Confirmation Loop)
*   **Target Files**:
    *   [secretary-pending-requests-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/secretary-pending-requests-view.tsx)
    *   [pending-decision-form.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/sub-components/pending-decision-form.tsx)
    *   [pending-edit-panel.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/sub-components/pending-edit-panel.tsx)
*   **Current Flow**:
    1.  Secretary selects a pending request.
    2.  Secretary can edit details by selecting a date and pre-calculated time slot from `SlotPicker`.
    3.  Secretary clicks "Approve" inside `PendingDecisionForm` which moves status to `'APPROVED'`.
*   **What to Modify/Add**:
    1.  **Remove SlotPicker/Slots Scanning**: Completely remove the timeslot queries (`isLoadingSlots`, `slots`, etc.) from the secretary view hooks and components.
    2.  **Add Exact Time & Duration Inputs**: Replace the slot picker with text or time fields (e.g. hour/minute pickers or input text fields) to record the exact time (e.g., `09:15 AM`) and duration (e.g. `30` mins) manually matching the offline system.
    3.  **Status Shift**: Update status from `'PENDING'` to `'CONFIRMED'`.

### B. Walk-in / Phone Booking ("Mirror" Loop)
*   **Target Files**:
    *   [secretary-book-appointment-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/secretary-book-appointment-view.tsx)
    *   [book-schedule-panel.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/sub-components/book-schedule-panel.tsx)
*   **Current Flow**:
    1.  Allows manual booking of users/patients from the dashboard, but requires selecting a predetermined slot.
*   **What to Modify/Add**:
    1.  Create a dedicated **"Quick-Add"** button/panel.
    2.  The form must ask for: Patient Name, Service, Date, Doctor, and **Exact Time/Duration** (typed manually by mirroring offline software, completely skipping pre-generated slot selection).
    3.  Bypass the `'PENDING'` step entirely and insert the record directly as `'CONFIRMED'`, triggering immediate confirmation emails.

### C. Inquiry Conversion Queue
*   **Target Files**:
    *   [inquiry-schedule-panel.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/sub-components/inquiry-schedule-panel.tsx)
    *   [convert-inquiry.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/booking/convert-inquiry.use-case.ts)
*   **Current Flow**:
    1.  Secretary converts a landing page guest lead into an active booking.
    2.  Picks service, doctor, date, and pre-calculated slot, then converts.
*   **What to Modify/Add**:
    1.  Modify `InquirySchedulePanel` to replace the `SlotSelector` with manual input fields for **Exact Start Time** and **Duration**.
    2.  Convert directly into a `'CONFIRMED'` appointment status.

---

## 3. Operations & Automation Rules

### A. Notifications & Reminder Countdown
*   **Target Files**:
    *   [event-subscribers.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/orchestrators/event-subscribers.ts)
    *   Email services (Resend).
*   **Current Flow**:
    *   Emails are sent upon booking creation (which defaults to pending).
*   **What to Modify/Add**:
    1.  **Enforce Confirmed Status Rule**: Strictly block any emails/reminders from dispatching while the appointment status is `'PENDING'`.
    2.  **Confirmation Event**: Trigger the confirmation email when the status is transitioned to `'CONFIRMED'` (approved by the secretary).
    3.  **Reminders**: Queue the 48-hour/24-hour reminders using the exact confirmed date/time set during secretary approval.
