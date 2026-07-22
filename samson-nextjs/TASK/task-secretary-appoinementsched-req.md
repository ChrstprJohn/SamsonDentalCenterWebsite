# Secretary Appointment Schedule Implementation Tasks (Request-to-Confirm Flow)

This task list defines all the remaining database, backend, and frontend steps required to complete the **Secretary-as-the-Brain** confirmation flow. These tasks strictly abide by the project's **Modular Monolith Architecture, Clean Code, Next.js, and Testing Guidelines**.

---

## 1. Database & Supabase Layer Tasks

### 1.1. Make Doctor ID Nullable [DONE]
- **Task:** Create a migration script to allow `appointments.doctor_id` to be `NULL` (supporting "Any Doctor" bookings in a pending state).
- **Files to create/modify:**
  - [DONE] Migration file `supabase/migrations/[timestamp]_make_doctor_id_nullable.sql` (Actually created in `migrations/20260711030000_make_doctor_id_nullable_on_appointments.sql`)
  - [DONE] [schema.sql](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/schema.sql) (reflect nullable doctor_id)

### 1.2. Update SQL Transactions / RPCs [DONE]
- **Task:** Update PostgreSQL functions to support nullable `doctor_id` parameter (`p_doctor_id`) and set confirmed state.
- **Details:**
  - Update `submit_booking_transaction` parameter `p_doctor_id` to default to `NULL`.
  - Update `create_manual_booking` parameters to allow `p_doctor_id` as `NULL` and set status to `CONFIRMED`.
  - Update `convert_inquiry_to_appointment` to set the created appointment's initial status to `'CONFIRMED'` instead of `'APPROVED'`.
- **Files to create/modify:**
  - [DONE] Migration file `migrations/20260711040000_update_booking_rpcs_to_confirmed.sql`
  - [DONE] [schema.sql](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/schema.sql) (updated the embedded functions)

---

## 2. Backend Layer Tasks (DTOs, Actions, Use Cases, Repositories)

### 2.1. DTO Schema Alignments [DONE]
- **Task:** Update Zod schemas to make `doctorId` optional/nullable and validate exact start/end times.
- **Files to create/modify:**
  - [DONE] [submit-booking.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/booking/submit-booking.dto.ts) (ensure doctorId is optional/nullable).
  - [DONE] [create-manual-booking.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/booking/create-manual-booking.dto.ts) (validate manual `startTime` and `endTime` inputs instead of slot).
  - [DONE] [convert-inquiry.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/booking/convert-inquiry.dto.ts) (validate manual `startTime` and `endTime` inputs instead of slot).

### 2.2. Server Actions Update [DONE]
- **Task:** Eliminate hourly slot validation checks and update appointment status transitions.
- **Details:**
  - **Inquiry Conversion:** `convertInquiryAction` should convert inquiries directly into `'CONFIRMED'` status using manual start/end times. (Bypasses slot checks in `convertInquiryUseCase`)
  - **Manual Booking:** `createManualBookingAction` should register appointments directly into `'CONFIRMED'` status with manual start/end times. (Bypasses slot checks in `createManualBookingUseCase`)
  - **Decision Status:** `updateAppointmentStatusAction` / `approve-appointment` should update status transition from `'APPROVED'` to `'CONFIRMED'`.
- **Files to create/modify:**
  - [DONE] [convert-inquiry.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/booking/convert-inquiry.action.ts)
  - [DONE] [convert-inquiry.action.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/booking/convert-inquiry.action.spec.ts)
  - [DONE] [create-manual-booking.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/booking/create-manual-booking.action.ts)
  - [DONE] [create-manual-booking.action.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/booking/create-manual-booking.action.spec.ts)

### 2.3. Repository Layer Updates [DONE]
- **Task:** Update commands to insert/update status as `'CONFIRMED'` and handle nullable doctor assignments.
- **Files to create/modify:**
  - [DONE] [create-manual-booking.command.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/booking/create-manual-booking.command.ts)
  - [DONE] [appointment-conversion.commands.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/booking/appointment-conversion.commands.ts)

---

## 3. Frontend Layer Tasks (Hooks, Components, Views)

### 3.1. Hook Logic Refactoring (`useSecretaryPendingRequests`) [DONE]
- **Task:** 
  1. Remove all hourly time slot fetching calls.
  2. Implement roster-based doctor filtering: fetch rostered doctors for the selected date by calling `getAvailableDoctorsForDateAction`.
  3. Validate that start/end times are filled and that end time is after start time when submitting review decisions.
  4. **Dynamic Calendar:** Call `getAvailableDaysAction` when service is selected to populate available dates — same roster-based logic as guest/auth booking (all doctors qualified for service).
- **Files to create/modify:**
  - [DONE] `src/modules/staff/hooks/secretary/use-secretary-pending-requests.ts`

### 3.2. Pending Requests Edit Panel UI Refactoring [DONE]
- **Task:** 
  1. Arrange edit inputs in order: **Service** → **Date** → **Doctor** → **Start & End Time**.
  2. Replace slot-picker component with manual time input fields (Start Time, End Time).
  3. Filter the doctor selection dropdown based on the chosen Date (using rostered doctors fetched for that date).
  4. If `doctorAssignmentSource` is `'SYSTEM'` (Any Doctor chosen by user), pre-fill the doctor input as blank/unselected and require the secretary to pick a doctor.
- **Files to create/modify:**
  - [DONE] [pending-edit-panel.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/sub-components/pending-edit-panel.tsx)

### 3.3. Manual/Walk-In Booking Panel UI Refactoring [DONE]
- **Task:**
  1. Replace slot picker component with manual **Start Time** and **End Time** inputs.
  2. Ensure submitted walk-in appointments are saved immediately with a status of `'CONFIRMED'`.
- **Files to create/modify:**
  - [DONE] [book-schedule-panel.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/sub-components/book-schedule-panel.tsx)

### 3.4. Inquiry Conversion Panel UI Refactoring [DONE]
- **Task:**
  1. Replace slot picker component with manual **Start Time** and **End Time** inputs.
  2. Convert inquiry appointments directly to `'CONFIRMED'`.
- **Files to create/modify:**
  - [DONE] [inquiry-schedule-panel.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/sub-components/inquiry-schedule-panel.tsx)
