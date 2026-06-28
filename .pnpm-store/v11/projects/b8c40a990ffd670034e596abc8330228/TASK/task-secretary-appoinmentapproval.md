# Task: Secretary Appointment Approval - Inline Modifying Before Approval

Improve the Secretary Portal's Appointment Request approval interface to allow inline editing of appointment details before deciding, especially during patient verification calls.

---

## 📋 Step-by-Step Implementation Plan

## 📋 Step-by-Step Implementation Plan

### 1. Database & Migrations
- [x] Create new migration file: `migrations/20260626130000_update_appointment_status_transaction_add_service.sql`.
- [x] Updated `public.update_appointment_status_transaction` RPC:
  - Added `p_reschedule_service UUID DEFAULT NULL`.
  - Added `service_id = COALESCE(p_reschedule_service, service_id)` to the UPDATE block.

### 2. DTO & Validation Layer
- [x] Updated `src/modules/appointments/dtos/status/update-appointment-status.dto.ts`:
  - Added `newServiceId` optional UUID field.
  - Updated `superRefine` to include `newServiceId` in `hasNewSchedule` detection.
- [x] Updated `src/modules/appointments/dtos/status/update-appointment-status.dto.spec.ts`:
  - Added `VALID_SERVICE_ID` constant.
  - Updated reschedule test to include `newServiceId`.
  - Added test for invalid `newServiceId` UUID rejection.

### 3. Repository Layer
- [x] Updated `src/modules/appointments/repositories/status/update-appointment-status-transaction.command.ts`:
  - Added `serviceId?: string` to `rescheduleMetadata` param.
  - Passes `p_reschedule_service: rescheduleMetadata?.serviceId ?? null` to RPC.

### 4. Use-Case Layer
- [x] Updated `src/modules/appointments/use-cases/status/update-appointment-status.use-case.ts`:
  - Added `serviceId?: string` to `rescheduleMetadata` in both deps signature and params.
  - Hold-and-Swap block passes through `serviceId` automatically via `finalRescheduleMetadata`.

### 5. Server Action Layer
- [x] Updated `src/modules/appointments/actions/status/update-appointment-status.action.ts`:
  - Passes `serviceId: validData.newServiceId` in rescheduleMetadata to use-case.

### 6. Frontend / UI Layer (Secretary Portal)
- [x] Updated `src/app/(portals)/secretary/pending/page.tsx`:
  - Added imports: `getServicesAction`, `getDoctorsAction`, `getAvailableDaysAction`, `getAvailableTimeSlotsAction`.
  - Added `isEditing` toggle and all edit state variables.
  - Added cascading `useEffect` hooks:
    - Services load on edit open.
    - Doctors filter by selected service.
    - Dates load dynamically per doctor + month.
    - Time slots load per doctor + date.
  - Updated `handleFinishAppointmentReview` to pass edit fields to `updateAppointmentStatusAction`.
  - Added collapsible "Edit Appointment Details Before Deciding" panel:
    1. Service pills
    2. Doctor pills (filtered by service)
    3. Date picker (with month navigation)
    4. Time slot picker
    5. Secretary note textarea

### 7. Verification & Testing
- [ ] Run vitest unit tests (`pnpm test`) to verify DTO validations pass.
- [ ] Verify manually: toggle edit, select service→doctor→date→slot, approve with changes saved.

