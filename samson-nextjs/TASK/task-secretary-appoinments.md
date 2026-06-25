# Checklist: Secretary Appointments Directory Development

Implement a clean, premium visual design following the Samson Dental design guidelines. Connect the frontend to live database server actions, matching the business logic specified in the system architecture and appointments directory plan.

## 📋 Architectural Constraints & Guidelines
- **Clean Architecture:** Use functional CQRS patterns for repository calls, functional dependency injection in use-cases, and streamlined server actions.
- **Strict Separation of Concerns:** Under no circumstance query or modify `PENDING`, `CHECKED_IN` or `TREATMENT_RENDERED` states on this page.
- **Zod Schema Parsing:** Ensure all inputs are validated through Zod schema pipelines before executing DB updates. The page layer may use `alert()` guards only as a secondary UX convenience — the server actions themselves must own Zod validation.
- **Additive Development:** Build new features side-by-side; do not pollute unrelated hooks or modules.
- **Testing Standards:** Co-locate `.spec.ts` files next to any modified use-case or repository files. Follow 80/15/5 pyramid (unit → integration → E2E).
- **Standard Formatters:** Display dates/times using `formatShortDate` and `formatClinicTime` from `@/shared/utils/date.util`.
- **No `any` types:** Strictly typed — use imported DTO types from module actions. `any` is forbidden per `2-NEXTJS.md`.
- **Dual-Lock UX:** Reschedule form must pre-lock both service and doctor. Unlocking either requires an explicit toggle. See `6-APPOINTMENTS.md §2.5` for full flow spec.

---

## 🛠️ Tasks

- [x] **Step 1: Repository Query Modification**
  - [x] Modify `getAppointmentsByClinicQuery` in `src/modules/appointments/repositories/clinic/clinic-appointments.queries.ts` to include `status_history` in its select statement.

- [x] **Step 2: UI Tab & Filter Setup**
  - [x] Implement Two-Tab layout: Tab 1 `APPROVED` only, Tab 2 history statuses only.
  - [x] Integrate filters: search bar, date filter, doctor filter dropdown, history status filter.
  - [x] Format patient names: dependent → `Name (Dependent: Holder)`, guest → `Name (Guest)`.
  - [x] Use `formatShortDate` + `formatClinicTime` for all date/time display.

- [x] **Step 3: Database Server Action Integration**
  - [x] Replace mock data with `getClinicAppointmentsAction` live query.
  - [x] Enforce strict status boundary — exclude PENDING, CHECKED_IN, TREATMENT_RENDERED.

- [x] **Step 4: Detail Panel**
  - [x] Appointment summary: patient, service, doctor, date/time, source.
  - [x] Immutable status history log from `statusHistory` array.
  - [x] Invoice/receipt link for `COMPLETED` appointments.

- [x] **Step 5a: Cancel Action (Upcoming Tab)**
  - [x] Mandatory cancellation reason — preset dropdown + custom fallback.
  - [x] Calls `updateAppointmentStatusAction` with `status: 'CANCELLED'` and reason.
  - [x] try/catch wrapper; loading state on submit.

- [x] **Step 5b: Dynamic Reschedule Chooser — Dual-Lock UX**

  > ⚠️ **Spec reference:** `6-APPOINTMENTS.md §2.4` (assignment indicator) + `§2.5` (dual-lock flow). Read before coding.

  ### Phase A — Doctor Assignment Indicator ✅ DONE
  - [x] Add `doctor_assignment_source` column to `appointments` table (migration written).
  - [x] Add field to `appointmentDbSchema` + `appointmentDtoSchema` in `appointment.dto.ts`.
  - [x] Display in table row next to doctor name: `🤖` for `SYSTEM`, `👤` for `USER`.
  - [x] Display in detail slide-over summary block with a label badge.

  ### Phase B — Pre-locked Doctor & Service Reschedule Form ✅ DONE
  - [x] **Service lock**: `🔒 Treatment: [Service Name]` locked by default. `[Change Treatment]` toggle unlocks chip selector.
  - [x] **Doctor lock** (NEW): `🔒 Dr. [First] [Last]` locked by default using `activeDoctorId = changeDoctor ? rescheduleDoctorId : selectedApp.doctorId`.
  - [x] **Calendar behavior based on lock state (4-scenario API matrix):**
    - Both locks ON → `getAvailableDaysAction({ serviceId, doctorId, month })` — only that doctor's available days.
    - Doctor lock OFF → `getAvailableDaysAction({ serviceId, month })` — all available days.
    - Service lock OFF + Doctor lock ON → `getAvailableDaysAction({ serviceId: newId, doctorId, month })`.
    - Both locks OFF → `getAvailableDaysAction({ serviceId: newId, month })`.
  - [x] **Timeslot short-circuit when doctor locked**: timeslots load immediately after date (doctor cards step skipped).
  - [x] **Submit guard**: blocked until `rescheduleDate && activeDoctorId && rescheduleStartTime && justification.trim()`.

  ### Phase C — Reset Cascade Rules ✅ DONE
  - [x] `toggleChangeTreatment()` resets: `serviceId`, `date`, `doctorId`, `startTime`, `endTime`, available lists.
  - [x] `toggleChangeDoctor()` resets: `date`, `doctorId`, `startTime`, `endTime`, available lists. Doctor restores via `activeDoctorId` derivation when re-locked.

- [x] **Step 6: Type Safety Cleanup** ✅ DONE
  - [x] `appointments: AppointmentDto[]` — from `@/modules/appointments/dtos/shared/appointment.dto`
  - [x] `services: ServiceResponseDto[]` — from `@/modules/services/dtos/management/service-response.dto`
  - [x] `timeslots: AvailableSlotDto[]` — from `@/modules/appointments/dtos/availability/get-available-time-slots.dto`
  - [x] `doctors: DoctorFilterItem[]`, `availableRescheduleDoctors: AvailableDoctorItem[]` — inline types (no formal DTO exists for these shapes)
  - [x] TypeScript build passes clean (`pnpm build` — 0 errors).

- [/] **Step 7: Verification & Safety**
  - [x] Add co-located `.spec.ts` for the `clinic-appointments.queries.ts` repository modification (unit test — mock Supabase, assert `status_history` is in select).
  - [ ] Manually test full reschedule flow: open → both locks on → pick date → slot → submit.
  - [ ] Manually test reschedule with "Change Doctor" toggle: unlock → pick date → pick new doctor → pick slot → submit.
  - [ ] Manually test reschedule with "Change Treatment" toggle: unlock → pick service → pick date → pick doctor → pick slot → submit.
  - [ ] Manually test cancel flow: open → select reason → confirm.
  - [ ] Verify status history log appears correctly after reschedule/cancel.
  - [ ] Verify RLS policies allow secretary role to execute `updateAppointmentStatusAction` for `APPROVED` appointments.

---

## ⚠️ Remaining Architecture Violations

> [!NOTE]
> All architectural violations resolved.

- [x] ~~`any[]` types throughout `page.tsx`~~ — **resolved**: proper DTO types imported.
- [x] ~~No `.spec.ts` co-located next to modified `clinic-appointments.queries.ts`~~ — **resolved**: unit test added and passing.
