# Task: Patient Portal Backend Database Integration & Clean Architecture

## 📋 Done
- [x] Create migration `20260613160000_seed_patient_appointments.sql` to seed 12 appointments with various statuses and dependent data for `picardochristopherjohnoleo1@gmail.com`.
- [x] Update `getAppointmentByIdQuery` to fetch nested relation joins for `doctor`, `service`, `patient`, and `dependent`.
- [x] Update `getAppointmentsByUserQuery` to fetch nested relation joins for `doctor`, `service`, `patient`, and `dependent`.
- [x] Refactor Detailed Appointment Fetching to abide by Clean Architecture / Modulith rules:
  - [x] Create `GetAppointmentByIdDto` validation schema in [get-appointment-by-id.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/patient/get-appointment-by-id.dto.ts).
  - [x] Create `get-appointment-by-id.use-case.ts` and its spec file in [get-appointment-by-id.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/patient/get-appointment-by-id.use-case.ts).
  - [x] Create `get-appointment-by-id.action.ts` and its spec file in [get-appointment-by-id.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/patient/get-appointment-by-id.action.ts).
  - [x] Update `/user/appointments/[id]/page.tsx` to invoke the Server Action rather than querying the database repository directly in [page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/(portals)/user/appointments/[id]/page.tsx).

## ⏳ In Progress
- None (All tasks successfully completed)
