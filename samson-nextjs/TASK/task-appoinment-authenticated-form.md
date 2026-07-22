# Task: Authenticated Patient Portal Appointment Booking & Rescheduling

This checklist tracks the modifications required to transition the patient portal booking wizard (`/booking`) and reschedule requests from hourly slot selection to the new **Request-to-Confirm** lifecycle.

---

## 1. Database Schema & RPC Updates
- [x] **Migration**: Create migration `20260711020000_add_time_pref_to_appointments.sql`:
  - [x] Add `time_preference` column (`TEXT` with CHECK constraint for `'MORNING' | 'AFTERNOON'` nullable) to the `appointments` table.
- [x] **Database RPCs**:
  - [x] Update `submit_booking_rpc` in Supabase:
    - [x] Accept `p_time_preference` parameter.
    - [x] Insert `time_preference` into `appointments` table.
    - [x] Remove or bypass hourly availability overlap validation (no longer checking hourly slots).
    - [x] Ensure booking is inserted with status `'PENDING'`.
  - [x] Update `reschedule_transaction_rpc` (or relevant status transaction RPCs):
    - [x] Accept `p_time_preference` parameter.
    - [x] Save the preferred time of day.
    - [x] Remove hourly slot checks.
    - [x] Set status to `'PENDING'` (or equivalent reschedule requested status) pending secretary review.

---

## 2. Data Transfer Objects (DTOs) & Backend Layer
- [x] **File**: `submit-booking.dto.ts` (and specs)
  - [x] Update schema to validate `timePreference` (`'MORNING' | 'AFTERNOON'`).
  - [x] Remove strict validations for `startTime` and `endTime` at the validation step.
  - [x] Ensure backward compatibility or clean mapper transforms.
- [x] **File**: `request-reschedule.dto.ts` (and specs)
  - [x] Update schema to validate `timePreference` (`'MORNING' | 'AFTERNOON'`).
- [x] **File**: `submit-booking.use-case.ts` (and specs)
  - [x] Modify to accept `timePreference` instead of hourly slots.
  - [x] Skip slot-checking commands and save booking request as `'PENDING'`.
- [x] **File**: `request-reschedule.use-case.ts` (and specs)
  - [x] Modify to request reschedule with date and time preference.

---

## 3. Frontend Hooks & State Management
*Abide by [3-REACT-HOOKS.md](file:///.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/3-REACT-HOOKS.md)*
- [x] **File**: `use-booking-state.ts`
  - [x] Replace `selectedSlot` state with `timePreference` (`'MORNING' | 'AFTERNOON'`, default `'MORNING'`).
- [x] **File**: `use-booking-data.ts`
  - [x] Remove the loading/fetching logic for hourly `availableSlots`.
  - [x] Keep only the dynamic calculation of doctor roster dates (available dates).
- [x] **File**: `use-user-booking.ts`
  - [x] Update state mapper and setters to use `timePreference` instead of `selectedSlot`.
  - [x] Adjust step completion guards (`isNextDisabled`, step validation) to verify date and time preference are selected.
- [x] **File**: `use-user-booking.spec.ts`
  - [x] Update tests to assert correct state transition and submission payload.

---

## 4. UI Components
*Abide by [2-REACT-COMPONENTS.md](file:///.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/2-REACT-COMPONENTS.md)*
- [x] **File**: `date-time-step.tsx`
  - [x] Remove `<AvailableTimeSlots>` component completely.
  - [x] Add Toggle Button group for Morning / Afternoon preference.
  - [x] Ensure "Doctor Preference" field defaults to "Any Doctor" and filters dates accordingly.
- [x] **File**: `review-step.tsx`
  - [x] Remove hourly start/end display.
  - [x] Render the selected Time Preference (Morning or Afternoon) and Doctor Preference.
- [x] **File**: `booking-success-view.tsx`
  - [x] Update summary view to display the Date and Morning/Afternoon preference.

---

## 5. Verification & Testing
*Abide by [5-TESTING_GUIDELINES.md](file:///.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/5-TESTING_GUIDELINES.md) and [4-TESTING_GUIDELINES.md](file:///.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/4-TESTING_GUIDELINES.md)*
- [x] Run all unit tests for:
  - [x] Use cases / Server Actions.
  - [x] Hooks (`use-user-booking.spec.ts`).
  - [x] Components.
- [x] Perform manual end-to-end booking checks in development.
