# Project Setup & Backend Development Checklist

Currently, we are focusing purely on the **Backend and Setup** aspects following the Domain-first (Modulith) Architecture defined in `1-ARCHITECTURE.md`. Frontend UI components and pages are skipped for now.

## ✅ DONE (Completed Tasks)
- [x] **Project Initialization:** Next.js (App Router) scaffolding.
- [x] **Dependencies Setup:** Installed crucial packages (`@supabase/supabase-js`, `@supabase/ssr`, `zod`, `vitest`, `resend`, `server-only`).
- [x] **Folder Structure:** Scaffolding matching the Architectural Blueprint (`modules/`, `shared/`, `orchestrators/`, etc.).
- [x] **Supabase Setup:** Initialized SSR clients (`shared/database/client.ts`, `shared/database/server.ts`, and `shared/database/middleware.ts`).
- [x] **Testing Setup:** Initialized Vitest (`vitest.config.ts`) and added testing specs for DB clients.

## 🚧 TO DO (Backend Tasks)

### 🚨 Architecture Audit Fixes (Pending)
- [ ] **Appointments Module:** Move `appointments/dtos/appointment.dto.ts` to an aggregate subfolder (e.g., `dtos/core/` or `dtos/shared/`) and add its missing `appointment.dto.spec.ts` test file.
- [ ] **Patients Module:** Create missing test file `patients/dtos/profile/patient-profile.dto.spec.ts`.
- [ ] **Staff Module:** Create missing test file `staff/dtos/profile/staff-profile.dto.spec.ts`.
- [ ] **Staff Module:** Create missing test file `staff/dtos/profile/terminate-staff.dto.spec.ts`.

### ✅ Phase 1: Shared Core (Global Kernel) - COMPLETED
- [x] **Global Error Handling:** Created base domain error classes in `shared/errors/` (`DomainError`, `NotFoundError`, `UnauthorizedError`, `ValidationError`) implementing domain-specific code mappings.
- [x] **Auth Utilities:** Created `shared/auth/auth.util.ts` containing Server-only `getAuthenticatedUser()` and `authorizeRole()` checking active Supabase sessions and roles.
- [x] **Common Utilities:** Created robust `shared/utils/` helpers (all exported via `index.ts` facade):
  - **Data Handling:** `uuid`, `date` (formatters), `omit`
  - **Type Guards & Fetching:** `is-error`, `is-defined`, `is-server`
  - **Text & UX:** `slugify`, `capitalize`, `sleep`
  - **Env:** `get-base-url`
- [x] **Testing:** Vitest unit tests implemented and passing for all shared kernel modules.

### ✅ Phase 2: Patients Domain (Backend) - COMPLETED
- [x] **DTOs:** Defined Zod validation schemas for patient inputs, organized into `profile/` subfolder.
- [x] **Repositories (CQRS):** Implemented pre-emptively split repositories (`patient-profile.commands.ts`, `patient-profile.queries.ts`) organized into `profile/` subfolder under `repositories/`.
- [x] **Use-Cases:** Implement pure business logic functions (e.g., `register-patient.use-case.ts`, `get-patient-profile.use-case.ts`) organized into `profile/` subfolder. All operations go through a Use-Case boundary (Strict Use-Case Pattern).
- [x] **Server Actions:** Wire Next.js form handling/RPCs inside `modules/patients/actions/profile/` (`register-patient.action.ts`, `get-patient-profile.action.ts`) to keep code modular.
- [x] **Facade Config:** Export stable public APIs via `modules/patients/index.ts`.

### ✅ Phase 3: Staff Domain (Backend) - COMPLETED
- [x] **DTOs:** Define schemas for staff and schedules, organized into `profile/` and `schedule/` subfolders.
- [x] **Repositories (Queries):** Implemented `staff-profile.queries.ts` with `getStaffProfile()` query inside `repositories/profile/`.
- [x] **Repositories (Commands):** Implement write repositories (`staff-profile.commands.ts`, `staff-schedule.commands.ts`) inside `profile/` and `schedule/` subfolders.
- [x] **Use-Cases:** Write business logic for creating staff, terminating employment, or updating clinic schedules, organized into `profile/` and `schedule/` subfolders.
- [x] **Server Actions (Segmented):** Create segmented actions under actor subfolders (`actions/admin/`, `actions/doctor/`) to avoid God classes.
- [x] **Facade Config:** Export stable public APIs via `modules/staff/index.ts`.

### ✅ Phase 4: Appointments Domain (Backend) - COMPLETED
- [x] **DTOs / Schemas:**
  - [x] Define `GetAvailabilityDto` (organized under `availability/`).
  - [x] Define `SubmitBookingDto` (organized under `booking/`).
  - [x] Define schemas for status updates (organized under `status/`).
  - [x] Define `GetClinicAppointmentsDto` (organized under `clinic/`).
- [x] **Repositories (Queries):**
  - [x] Implement `patient-appointments.queries.ts` (under `patient/`) and `clinic-appointments.queries.ts` (under `clinic/`).
  - [x] Implement availability slot queries (`appointment-availability.queries.ts` under `availability/`).
- [x] **Repositories (Commands):**
  - [x] Implement `appointment-booking.commands.ts` (under `booking/`).
  - [x] Implement `appointment-status.commands.ts` (under `status/`).
- [x] **Use-Cases (Strict Use-Case Pattern):**
  - [x] `get-availability.use-case.ts` (under `availability/`).
  - [x] `submit-booking.use-case.ts` (under `booking/`).
  - [x] `update-appointment-status.use-case.ts` (under `status/`).
  - [x] `get-patient-appointments.use-case.ts` (under `patient/`).
  - [x] `get-clinic-appointments.use-case.ts` (under `clinic/`).
- [x] **Server Actions (Endpoints for Frontend):** Organized into aggregate subfolders matching `use-cases/`, `repositories/`, `dtos/`.
  - [x] `actions/availability/get-available-days.action.ts`
  - [x] `actions/availability/get-available-time-slots.action.ts`
  - [x] `actions/booking/submit-booking.action.ts`
  - [x] `actions/clinic/get-clinic-appointments.action.ts` (SECRETARY+ role guard)
  - [x] `actions/patient/get-patient-appointments.action.ts`
  - [x] `actions/status/cancel-appointment.action.ts` (ownership guard)
  - [x] `actions/status/request-reschedule.action.ts` (ownership guard)
  - [x] `actions/status/update-appointment-status.action.ts` (SECRETARY+ role guard)

### Phase 5: Services & Clinic Config Domain
- [x] **Services Domain:** Implement CRUD for clinic services (`get-services`, `create-service`, `update-service`, `delete-service`).
- [x] **Clinic Config Domain:** Implement clinic settings management (`get-clinic-config`, `update-clinic-config` for open/closed status, hours, etc.).

### Phase 6: Dependents & Admin User Management Domain
- [ ] **Patients Domain (Dependents):** Implement adding and fetching family members/dependents for bookings (`create-dependent`, `get-user-dependents`).
- [ ] **Admin User Management:** Implement user management for admins (`get-all-users`, `deactivate-user`).

### Phase 7: Billing & Invoicing Domain
- [ ] **Billing/Invoicing Domain:** Implement invoice generation when appointments are completed (`generate-invoice`, `get-invoices`, `update-invoice`).

### Phase 8: Audit Logging Domain
- [ ] **Audit Logging Domain:** Implement audit log mechanism to track staff actions (`get-audit-logs`).

### Phase 9: Orchestrators & Events
- [ ] **Cross-Domain Workflow:** Build orchestrators for multi-domain processes if required (e.g., `checkout.orchestrator.ts`).
- [ ] **Background Tasks:** Setup background event subscribers (using Next.js `after()`) for emails or side-effects.

---

### 💡 Next Steps Guide:
1. Review the checklist above.
2. Phases 1–4 are fully completed! All core domains (Shared Core, Patients, Staff, Appointments) have DTOs, Repositories, Use-Cases, and Server Actions implemented with robust unit tests.
3. The next task is **Phase 5 (Services & Clinic Config Domain)**:
   - Implement the Services and Clinic Config domains.