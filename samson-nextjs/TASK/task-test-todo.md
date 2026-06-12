# Test Todo - Doctor Selection Feature

The following is a list of test files and test cases that need to be created/updated to achieve full coverage for the newly added Doctor Selection feature.

---

## 1. Staff Module Tests

### [ ] `src/modules/staff/repositories/management/get-active-doctors.queries.spec.ts` (New)
- **Target:** `getActiveDoctorsQuery`
- **Test cases:**
  - Retrieve all active doctors (where `role = 'DOCTOR'` and `is_active = true`).
  - Retrieve active doctors filtered by a specific `serviceId` they are mapped to.
  - Return empty array when no doctors are mapped to the given `serviceId`.
  - Handle database errors gracefully.

### [ ] `src/modules/staff/use-cases/management/get-doctors.use-case.spec.ts` (New)
- **Target:** `getDoctorsUseCase` / `GetDoctorsUseCase`
- **Test cases:**
  - Forward calls and parameters to the query repository function correctly.
  - Test backwards compatibility mode via the class-based wrapper.

### [ ] `src/modules/staff/actions/management/get-doctors.action.spec.ts` (New)
- **Target:** `getDoctorsAction`
- **Test cases:**
  - Verify success responses from the use case.
  - Verify error handling and that it returns `{ success: false, error: ... }` when the use-case throws.

---

## 2. Appointments Module Tests

### [ ] `src/modules/appointments/repositories/availability/appointment-availability.queries.spec.ts` (Update)
- **Target:** `getWorkingSchedulesForMonthQuery` and `getDoctorSchedulesQuery`
- **Test cases:**
  - Query schedules of all doctors works correctly.
  - Query filtered by `serviceId` (only returns schedules of doctors who offer that service).
  - Query filtered by both `doctorId` and `serviceId`.

### [ ] `src/modules/appointments/repositories/availability/get-existing-appointments-for-month.queries.spec.ts` (New)
- **Target:** `getExistingAppointmentsForMonthQuery`
- **Test cases:**
  - Retrieve all active appointments for the given month (e.g. YYYY-MM).
  - Filter active appointments by doctorId if provided.
  - Exclude appointments with cancelled, rejected, or displaced status.

### [ ] `src/modules/appointments/use-cases/availability/get-availability.use-case.spec.ts` (Update)
- **Target:** `getAvailabilityUseCase` / `GetAvailabilityUseCase`
- **Test cases:**
  - Verify `getAvailableDays` propagates `serviceId` to `getWorkingSchedulesForMonth`.
  - Verify `getAvailableTimeSlots` propagates `serviceId` to `getDoctorSchedules`.
  - Verify in-memory calendar availability calculations if `getExistingAppointmentsForMonth` is defined.

### [ ] `src/modules/appointments/hooks/booking/use-booking-state.spec.ts` (Update)
- **Target:** `useBookingState` hook
- **Test cases:**
  - Verify `selectedDoctorId` state defaults to `'ANY'`.
  - Verify `selectedDoctorId` resets to `'ANY'` on `resetState`.
  - Verify slot holding timer and state are fully removed.

### [ ] `src/modules/appointments/hooks/booking/use-booking-data.spec.ts` (Update)
- **Target:** `useBookingData` hook
- **Test cases:**
  - Verify doctors list is fetched via `getDoctorsAction` when `selectedServiceId` changes.
  - Verify availability fetches pass down `selectedDoctorId` filter (`undefined` if `'ANY'`).
  - Verify data fetching is gated by `currentStep >= 2` (does not run on Step 1 clicks).

### [ ] `src/modules/appointments/hooks/booking/use-user-booking.spec.ts` (Update)
- **Target:** `useUserBooking` hook
- **Test cases:**
  - Expose `selectedDoctorId` and list of `doctors`.
  - `selectDoctor` resets `selectedDate` and `selectedSlot`.
  - `selectService` resets `selectedDoctorId` to `'ANY'`.
  - Verify slot hold handlers (`startSlotHold`, `releaseSlotHold`) are removed.

---

## 3. UI View Tests

### [ ] `src/modules/appointments/components/booking/date-time-step.spec.tsx` (New)
- **Target:** `DateTimeStep` component
- **Test cases:**
  - Renders the "Preferred Doctor" card selection layout correctly.
  - Clicking a doctor card invokes `onSelectDoctor` handler.
  - Highlights selected doctor card active state.
  - Verify the temporary slot countdown banner is NOT rendered.

### [ ] `src/modules/appointments/views/booking-view.spec.tsx` (Update)
- **Target:** `BookingView` component
- **Test cases:**
  - Passes down doctor props from the custom booking hook to the `DateTimeStep` sub-component correctly.
  - Verify slot holding props are removed.
