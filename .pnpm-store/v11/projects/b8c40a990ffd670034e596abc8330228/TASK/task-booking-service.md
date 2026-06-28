# Task: Booking Flow Alignment & Service Fixes

## Issue Summary
1. **Empty Services Rendering:** The `ServiceStep` currently renders the empty state ("No Services Available") because the database `services` table is empty (`[]`).
2. **Missing Business Plan Features:** Our current implementation of Step 2 (`DateTimeStep`) is missing the **Doctor Selection** feature defined in the [Business Plan](../.CORE_DOCUMENTATION/SERVERLESS_ARCHI/1-BUSSINESS-PLAN/3-BOOKING/1-BOOKING-WIZARD.md). It currently aggregates dates/slots globally without allowing patients to prefer a specific doctor.
3. **Architecture Blueprint Violations:** An audit revealed non-compliance with the V2 Modulith Architecture (Zod patterns, Outbox events, and legacy OOP wrappers).

---

## To-Do List

### Phase 1: Fix Service Step Rendering
- [x] **1. Database & Seed Data**
  - [x] Add seed data to the `services` table (e.g., General Cleaning, Whitening, Orthodontics) with `is_active: true`.
  - [x] Validate Supabase RLS policies allow authenticated `SELECT` queries on `services`.
- [x] **2. Backend Integration & Data Validation**
  - [x] Ensure `getServicesAction(false)` fetches correctly.
  - [x] Verify `serviceResponseSchema` handles real DB payloads without strict parsing failures (fixed Zod `datetime()` strictness for Postgres timestamps).
- [x] **3. Frontend Integration**
  - [x] Ensure the booking flow UI correctly fetches and reflects the active services in Step 1.

### Phase 2: Align Step 2 with Business Plan (Doctor Selection)
- [x] **1. State Management Updates (`use-booking-state.ts`)**
  - [x] Add `selectedDoctorId` state (defaulting to `'ANY'`).
  - [x] Add a `selectDoctor` updater function.
- [x] **2. Data Fetching Hooks (`use-booking-data.ts`)**
  - [x] Modify `useBookingData` to accept `selectedDoctorId` as a parameter.
  - [x] Pass `selectedDoctorId` to `getAvailableDaysAction` and `getAvailableTimeSlotsAction` so it filters availability based on the chosen doctor's schedule.
- [x] **3. Backend Server Actions Updates**
  - [x] Ensure `getAvailableDaysAction` and `getAvailableTimeSlotsAction` accept and respect an optional `doctorId` parameter.
  - [x] Ensure timeslots returned include the correct `doctorId` and `doctorName` metadata.
- [x] **4. Frontend UI Components (`date-time-step.tsx`)**
  - [x] Fetch the list of active doctors (e.g., via a new `getDoctorsAction`).
  - [x] Add a Dropdown or Card Selection UI above the Date Carousel allowing users to select "Any Doctor" or a specific doctor.
  - [x] Ensure the Date Carousel disables dates where the selected doctor is not working.

### Phase 2.5: Optimize Latency & Remove Slot Holding (Business Plan Alignment)
- [x] **1. Defer Fetches (Step 1 Gating)**
  - [x] Modify `useBookingData` hook to accept `currentStep` and gate API requests so they only fetch when `currentStep >= 2` to avoid fetching on each service selection in Step 1.
- [x] **2. Implement Monthly Appointments Query**
  - [x] Create `src/modules/appointments/repositories/availability/get-existing-appointments-for-month.queries.ts` to retrieve active appointments for a month in one DB query.
- [x] **3. Optimize Availability Calculations (In-Memory Processing)**
  - [x] Modify `getWorkingSchedulesForMonthQuery` in `appointment-availability.queries.ts` to return full schedule details (times, breaks).
  - [x] Refactor `getAvailableDays` in `get-availability.use-case.ts` to pre-fetch schedules, appointments, and service durations once and calculate calendar availability in-memory, eliminating N+1 DB requests.
- [x] **4. Remove Slot Reservation/Holding Mechanism**
  - [x] Remove slot hold countdown timer, hooks, state, types, and files reference across the app (`useBookingState`, `useUserBooking`, `DateTimeStep`, `BookingView`, etc.) since slot holding is omitted from the business plan.

### Phase 3: Architectural Audit Fixes (V2 Compliance)
- [x] **1. Zod Transformation Blueprint Refactor (`backend/1.5-CODING-PATTERNS.md`)**
  - [x] Refactor `dtos/shared/appointment.dto.ts`. Remove the messy `z.preprocess()` logic.
  - [x] Define a strict raw DB shape (`appointmentDbSchema`) and use `.transform()` to map to `appointmentDtoSchema` to ensure pure separation of boundaries.
- [x] **2. Transactional Outbox Events (`1-EVENT-DRIVEN-ARCHITECTURE.md`)**
  - [x] Update `appointment-booking.commands.ts` (or the use-case) to emit an `APPOINTMENT_BOOKED` event into the `outbox` table as part of the booking transaction, allowing for async staff notifications.
- [x] **3. Deprecated OOP Wrapper Removal (`backend/1-ARCHITECTURE.md`)**
  - [x] Remove the `@deprecated` class wrappers from `submit-booking.use-case.ts` (`SubmitBookingUseCase`).
  - [x] Remove the `@deprecated` class wrappers from `appointment-booking.commands.ts` (`AppointmentBookingCommands`).
- [x] **4. Frontend God Component Prevention (`frontend/1-ARCHITECTURE.md`)**
  - [x] Extract the footer action buttons (Next, Back, Submit) from `booking-view.tsx` into a separate `BookingFooterControls` sub-component to bring the view below the 150-line threshold (currently at 152 lines).
- [x] **5. Server Action Data Fetching Violation (`frontend/1-ARCHITECTURE.md`)**
  - [x] Refactor `src/app/(portals)/booking/page.tsx` to stop using `getServicesAction(false)` (a Server Action) for data fetching.
  - [x] Use Functional DI directly in the React Server Component to securely fetch data via `getServicesUseCase(getServicesQuery(supabase))`.
- [x] **6. DTO Spec Desync & Strictness (`backend/1-ARCHITECTURE.md` & `1.5-CODING-PATTERNS.md`)**
  - [x] Revert `service-response.dto.ts` back to `z.string().optional()` to keep the schema simple and avoid over-engineering Postgres timestamp parsing.
  - [x] Remove the Postgres timestamp coercion test from `service-response.dto.spec.ts`.
- [x] **7. Debug Artifact Cleanup**
  - [x] Remove `console.log()` and `export const dynamic = 'force-dynamic';` from `src/app/(portals)/booking/page.tsx`.

### Phase 4: End-to-End Verification
- [ ] **1. Integration Testing**
  - [ ] Run `pnpm dev` and visit `/booking`.
  - [ ] Ensure services appear in Step 1.
  - [ ] In Step 2, test switching between "Any Doctor" and specific doctors to see calendar dates and slots update dynamically.
  - [ ] Submit a test booking and ensure the final appointment reflects the accurately chosen doctor and service, and an outbox event is successfully dispatched.
