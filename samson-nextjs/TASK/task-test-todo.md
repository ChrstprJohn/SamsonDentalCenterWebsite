# Test Todo - Doctor Selection & Latency Optimization Features

The following is a list of test files and test cases that need to be created/updated to achieve full coverage for the **Doctor Selection** feature and the subsequent **Latency Optimization / Slot Hold Removal** updates.

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

### [ ] `src/modules/appointments/dtos/availability/doctor-schedule-response.dto.spec.ts` (New)
- **Target:** `doctorScheduleResponseSchema`
- **Test cases:**
  - Transform database keys (`doctor_id`, `day_of_week`, `start_time`, `end_time`, `break_start_time`, `break_end_time`) into standard camelCase properties.
  - Validate field types and UUID formats.

### [ ] `src/modules/appointments/dtos/availability/appointment-response.dto.spec.ts` (New)
- **Target:** `appointmentResponseSchema`
- **Test cases:**
  - Transform database keys (`start_time`, `end_time`, `doctor_id`) into standard camelCase properties.
  - Validate field types and UUID formats.

### [ ] `src/modules/appointments/use-cases/availability/get-available-days.use-case.spec.ts` (New)
- **Target:** `getAvailableDaysUseCase`
- **Test cases:**
  - Query schedules and calculate days correctly using in-memory calculations.
  - Fallback to sequential checks if in-memory dependencies are not defined.

### [ ] `src/modules/appointments/use-cases/availability/get-available-time-slots.use-case.spec.ts` (New)
- **Target:** `getAvailableTimeSlotsUseCase`
- **Test cases:**
  - Retrieve and slice daily timeslots correctly.
  - Exclude lunch breaks and active appointments.
  - Verify doctor display name is resolved once per schedule.

### [ ] `src/modules/appointments/utils/availability.utils.spec.ts` (New)
- **Target:** `generateAvailableSlotsForDay`
- **Test cases:**
  - Validate slot generation logic loop in-memory with various durations.
  - Verify lunch break exclusions.
  - Verify appointment overlap exclusions.

### [ ] `src/modules/appointments/use-cases/availability/get-availability.use-case.spec.ts` (Update)
- **Target:** `getAvailabilityUseCase` / `GetAvailabilityUseCase`
- **Test cases:**
  - Verify backwards compatibility wrapper correctly delegates to the split use cases.

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

---

## 4. Services Module Tests

### [ ] `src/modules/services/repositories/management/service.queries.spec.ts` (Update)
- **Target:** `getServicesByIdsQuery`
- **Test cases:**
  - Retrieve multiple services matching a list of UUIDs correctly.
  - Returns parsed ServiceResponseDto array mapping snake_case db columns to camelCase properties.
  - Return empty array when empty list of IDs is provided.
  - Handles database fetch errors correctly.

