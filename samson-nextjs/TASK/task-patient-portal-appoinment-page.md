# Task: Patient Portal Backend Database Integration & Clean Architecture

## 📋 Done
- [x] Create migration `20260613160000_seed_patient_appointments.sql` to seed 12 appointments with various statuses and dependent data for `picardochristopherjohnoleo1@gmail.com`.
- [x] Update `getAppointmentByIdQuery` to fetch nested relation joins for `doctor`, `service`, `patient`, and `dependent`.
- [x] Update `getAppointmentsByUserQuery` to fetch nested relation joins for `doctor`, `service`, `patient`, and `dependent`.
- [x] Refactor Detailed Appointment Fetching to abide by Clean Architecture / Modulith rules:
  - [x] Create `GetAppointmentByIdDto` validation schema.
  - [x] Create `get-appointment-by-id.use-case.ts` and its spec file.
  - [x] Create `get-appointment-by-id.action.ts` and its spec file.
  - [x] Update `/user/appointments/[id]/page.tsx` to invoke the Server Action rather than querying the database repository directly.
- [x] Wire up Cancel Appointment action on frontend:
  - [x] Update `use-user-dashboard.ts` to call `cancelAppointmentAction`
  - [x] Update `use-appointment-detail.ts` to call `cancelAppointmentAction`
- [x] Wire up Reschedule Request action on frontend:
  - [x] Update booking portal page config `/booking/page.tsx` to pass `reschedulingAppointment`
  - [x] Update `booking-view.tsx` to handle reschedule headers and lock service step
  - [x] Update `use-user-booking.ts` to use `requestRescheduleAction` in submit handler

## ⏳ In Progress
- None (All tasks successfully completed)
