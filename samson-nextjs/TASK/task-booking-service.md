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
- [ ] **1. State Management Updates (`use-booking-state.ts`)**
  - [ ] Add `selectedDoctorId` state (defaulting to `'ANY'`).
  - [ ] Add a `selectDoctor` updater function.
- [ ] **2. Data Fetching Hooks (`use-booking-data.ts`)**
  - [ ] Modify `useBookingData` to accept `selectedDoctorId` as a parameter.
  - [ ] Pass `selectedDoctorId` to `getAvailableDaysAction` and `getAvailableTimeSlotsAction` so it filters availability based on the chosen doctor's schedule.
- [ ] **3. Backend Server Actions Updates**
  - [ ] Ensure `getAvailableDaysAction` and `getAvailableTimeSlotsAction` accept and respect an optional `doctorId` parameter.
  - [ ] Ensure timeslots returned include the correct `doctorId` and `doctorName` metadata.
- [ ] **4. Frontend UI Components (`date-time-step.tsx`)**
  - [ ] Fetch the list of active doctors (e.g., via a new `getDoctorsAction`).
  - [ ] Add a Dropdown or Card Selection UI above the Date Carousel allowing users to select "Any Doctor" or a specific doctor.
  - [ ] Ensure the Date Carousel disables dates where the selected doctor is not working.

### Phase 3: Architectural Audit Fixes (V2 Compliance)
- [ ] **1. Zod Transformation Blueprint Refactor (`backend/1.5-CODING-PATTERNS.md`)**
  - [ ] Refactor `dtos/shared/appointment.dto.ts`. Remove the messy `z.preprocess()` logic.
  - [ ] Define a strict raw DB shape (`appointmentDbSchema`) and use `.transform()` to map to `appointmentDtoSchema` to ensure pure separation of boundaries.
- [ ] **2. Transactional Outbox Events (`1-EVENT-DRIVEN-ARCHITECTURE.md`)**
  - [ ] Update `appointment-booking.commands.ts` (or the use-case) to emit an `APPOINTMENT_BOOKED` event into the `outbox` table as part of the booking transaction, allowing for async staff notifications.
- [ ] **3. Deprecated OOP Wrapper Removal (`backend/1-ARCHITECTURE.md`)**
  - [ ] Remove the `@deprecated` class wrappers from `submit-booking.use-case.ts` (`SubmitBookingUseCase`).
  - [ ] Remove the `@deprecated` class wrappers from `appointment-booking.commands.ts` (`AppointmentBookingCommands`).
- [ ] **4. Frontend God Component Prevention (`frontend/1-ARCHITECTURE.md`)**
  - [ ] Extract the footer action buttons (Next, Back, Submit) from `booking-view.tsx` into a separate `BookingFooterControls` sub-component to bring the view below the 150-line threshold (currently at 152 lines).
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
