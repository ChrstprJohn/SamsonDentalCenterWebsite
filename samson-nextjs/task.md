# Project Setup & Backend Development Checklist

Currently, we are focusing purely on the **Backend and Setup** aspects following the Domain-first (Modulith) Architecture defined in `1-ARCHITECTURE.md`. Frontend UI components and pages are skipped for now.

## ✅ DONE (Completed Tasks)
- [x] **Project Initialization:** Next.js (App Router) scaffolding.
- [x] **Dependencies Setup:** Installed crucial packages (`@supabase/supabase-js`, `@supabase/ssr`, `zod`, `vitest`, `resend`, `server-only`).
- [x] **Folder Structure:** Scaffolding matching the Architectural Blueprint (`modules/`, `shared/`, `orchestrators/`, etc.).
- [x] **Supabase Setup:** Initialized SSR clients (`shared/database/client.ts`, `shared/database/server.ts`, and `shared/database/middleware.ts`).
- [x] **Testing Setup:** Initialized Vitest (`vitest.config.ts`) and added testing specs for DB clients.

## 🚧 TO DO (Backend Tasks)

### 🚨 Architecture Audit Fixes (Completed)
- [x] **Appointments Module:** Move `appointments/dtos/appointment.dto.ts` to an aggregate subfolder (e.g., `dtos/core/` or `dtos/shared/`) and add its missing `appointment.dto.spec.ts` test file.
- [x] **Patients Module:** Create missing test file `patients/dtos/profile/patient-profile.dto.spec.ts`.
- [x] **Staff Module:** Create missing test file `staff/dtos/profile/staff-profile.dto.spec.ts`.
- [x] **Staff Module:** Create missing test file `staff/dtos/profile/terminate-staff.dto.spec.ts`.

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
  - **DTOs:**
    - [ ] `modules/services/dtos/management/create-service.dto.ts` (and `.spec.ts`) - Needs: name, description, durationMinutes (important for calendar blocks), and serviceType (General vs. Specialized).
    - [ ] `modules/services/dtos/management/update-service.dto.ts` (and `.spec.ts`)
    - [ ] `modules/services/dtos/management/service-response.dto.ts` (and `.spec.ts`)
  - **Repositories:**
    - [ ] `modules/services/repositories/management/service.commands.ts` (and `.spec.ts`)
    - [ ] `modules/services/repositories/management/service.queries.ts` (and `.spec.ts`)
  - **Use-Cases:**
    - [ ] `modules/services/use-cases/management/create-service.use-case.ts` (and `.spec.ts`)
    - [ ] `modules/services/use-cases/management/update-service.use-case.ts` (and `.spec.ts`)
  - **Actions:**
    - [ ] `modules/services/actions/management/create-service.action.ts` (and `.spec.ts`)
    - [ ] `modules/services/actions/management/update-service.action.ts` (and `.spec.ts`)
- [x] **Clinic Config Domain:** Implement clinic settings management (`get-clinic-config`, `update-clinic-config` for open/closed status, hours, etc.).
  - **DTOs:**
    - [ ] `modules/clinic-config/dtos/settings/update-clinic-config.dto.ts` (and `.spec.ts`) - Must capture: isBookingOpen (boolean), maintenanceMessage (string), maxReschedulesAllowed (number), clinicName, operatingHours, etc.
  - **Repositories:**
    - [ ] `modules/clinic-config/repositories/settings/clinic-config.commands.ts` (and `.spec.ts`)
    - [ ] `modules/clinic-config/repositories/settings/clinic-config.queries.ts` (and `.spec.ts`)
  - **Use-Cases:**
    - [ ] `modules/clinic-config/use-cases/settings/update-clinic-config.use-case.ts` (and `.spec.ts`)
  - **Actions:**
    - [ ] `modules/clinic-config/actions/settings/update-clinic-config.action.ts` (and `.spec.ts`)

### Phase 6: Dependents & Admin User Management Domain
- [x] **Patients Domain (Dependents):** Implement adding and fetching family members/dependents for bookings (`create-dependent`, `get-user-dependents`).
  - **DTOs:**
    - [x] `modules/patients/dtos/dependents/create-dependent.dto.ts` (and `.spec.ts`)
    - [x] `modules/patients/dtos/dependents/dependent-profile.dto.ts` (and `.spec.ts`)
  - **Repositories:**
    - [x] `modules/patients/repositories/dependents/patient-dependents.commands.ts` (and `.spec.ts`)
    - [x] `modules/patients/repositories/dependents/patient-dependents.queries.ts` (and `.spec.ts`)
  - **Use-Cases:**
    - [x] `modules/patients/use-cases/dependents/create-dependent.use-case.ts` (and `.spec.ts`)
    - [x] `modules/patients/use-cases/dependents/get-user-dependents.use-case.ts` (and `.spec.ts`)
  - **Actions:**
    - [x] `modules/patients/actions/dependents/create-dependent.action.ts` (and `.spec.ts`)
    - [x] `modules/patients/actions/dependents/get-user-dependents.action.ts` (and `.spec.ts`)

- [x] **Admin User Management:** Implement user management for admins (`get-all-users`, `deactivate-user`).
  - **DTOs:**
    - [x] `modules/staff/dtos/management/get-all-users.dto.ts` (and `.spec.ts`)
    - [x] `modules/staff/dtos/management/deactivate-user.dto.ts` (and `.spec.ts`)
  - **Repositories:**
    - [x] `modules/staff/repositories/management/user-management.commands.ts` (and `.spec.ts`)
    - [x] `modules/staff/repositories/management/user-management.queries.ts` (and `.spec.ts`)
  - **Use-Cases:**
    - [x] `modules/staff/use-cases/management/get-all-users.use-case.ts` (and `.spec.ts`)
    - [x] `modules/staff/use-cases/management/deactivate-user.use-case.ts` (and `.spec.ts`)
  - **Actions:**
    - [x] `modules/staff/actions/management/get-all-users.action.ts` (and `.spec.ts`)
    - [x] `modules/staff/actions/management/deactivate-user.action.ts` (and `.spec.ts`)

- [ ] **Doctor Service Mapping:** Allow admins/doctors to assign specialties/services to doctors.
  - **DTOs:**
    - [ ] `modules/staff/dtos/management/assign-doctor-services.dto.ts` (and `.spec.ts`) - An admin/doctor action to map a doctorId to an array of serviceIds they are qualified to perform.
  - **Repositories:**
    - [ ] `modules/staff/repositories/management/doctor-services.commands.ts` (and `.spec.ts`)
  - **Use-Cases:**
    - [ ] `modules/staff/use-cases/management/assign-doctor-services.use-case.ts` (and `.spec.ts`)
  - **Actions:**
    - [ ] `modules/staff/actions/management/assign-doctor-services.action.ts` (and `.spec.ts`)

### Phase 7: Billing & Invoicing Domain
- [x] **Billing/Invoicing Domain:** Implement invoice generation when appointments are completed (`generate-invoice`, `get-invoices`, `update-invoice`).
  - **DTOs:**
    - [x] `modules/billing/dtos/invoicing/generate-invoice.dto.ts` (and `.spec.ts`)
    - [x] `modules/billing/dtos/invoicing/get-invoices.dto.ts` (and `.spec.ts`)
    - [x] `modules/billing/dtos/invoicing/update-invoice.dto.ts` (and `.spec.ts`)
    - [ ] `modules/billing/dtos/invoicing/finalize-invoice.dto.ts` (and `.spec.ts`) <-- Added for Secretary Checkout. Needs to capture paymentMethod (enum: Cash, Card, HMO), discountApplied, and line-item specific prices.
    - [x] `modules/billing/dtos/invoicing/invoice-response.dto.ts` (and `.spec.ts`)
  - **Repositories:**
    - [x] `modules/billing/repositories/invoicing/invoice.commands.ts` (and `.spec.ts`)
    - [x] `modules/billing/repositories/invoicing/invoice.queries.ts` (and `.spec.ts`)
  - **Use-Cases:**
    - [x] `modules/billing/use-cases/invoicing/generate-invoice.use-case.ts` (and `.spec.ts`)
    - [x] `modules/billing/use-cases/invoicing/get-invoices.use-case.ts` (and `.spec.ts`)
    - [x] `modules/billing/use-cases/invoicing/update-invoice.use-case.ts` (and `.spec.ts`)
    - [ ] `modules/billing/use-cases/invoicing/finalize-invoice.use-case.ts` (and `.spec.ts`)
  - **Actions:**
    - [x] `modules/billing/actions/invoicing/generate-invoice.action.ts` (and `.spec.ts`)
    - [x] `modules/billing/actions/invoicing/get-invoices.action.ts` (and `.spec.ts`)
    - [x] `modules/billing/actions/invoicing/update-invoice.action.ts` (and `.spec.ts`)
    - [ ] `modules/billing/actions/invoicing/finalize-invoice.action.ts` (and `.spec.ts`)
  - **Facade:**
    - [x] `modules/billing/index.ts`
    - [x] `modules/billing/dtos/index.ts`

### Phase 7.5: Clinical Treatment Domain (Doctor)
- [ ] **Clinical Submission:** Implement the doctor's workflow for submitting actual services rendered, creating the draft invoice.
  - **DTOs:**
    - [ ] `modules/appointments/dtos/treatment/submit-treatment.dto.ts` (and `.spec.ts`) - Must contain appointmentId, an array of actualServiceIds, and clinicalNotes.
  - **Repositories:**
    - [ ] `modules/appointments/repositories/treatment/treatment.commands.ts` (and `.spec.ts`)
  - **Use-Cases:**
    - [ ] `modules/appointments/use-cases/treatment/submit-treatment.use-case.ts` (and `.spec.ts`)
  - **Actions:**
    - [ ] `modules/appointments/actions/treatment/submit-treatment.action.ts` (and `.spec.ts`)

### Phase 8: Audit Logging Domain
- [ ] **Audit Logging Domain:** Implement audit log mechanism to track staff actions (`get-audit-logs`, `create-audit-log`).
  - **DTOs:**
    - [ ] `modules/audit-logs/dtos/logs/create-audit-log.dto.ts` (and `.spec.ts`)
    - [ ] `modules/audit-logs/dtos/logs/get-audit-logs.dto.ts` (and `.spec.ts`)
    - [ ] `modules/audit-logs/dtos/logs/audit-log-response.dto.ts` (and `.spec.ts`)
  - **Repositories:**
    - [ ] `modules/audit-logs/repositories/logs/audit-log.commands.ts` (and `.spec.ts`)
    - [ ] `modules/audit-logs/repositories/logs/audit-log.queries.ts` (and `.spec.ts`)
  - **Use-Cases:**
    - [ ] `modules/audit-logs/use-cases/logs/create-audit-log.use-case.ts` (and `.spec.ts`)
    - [ ] `modules/audit-logs/use-cases/logs/get-audit-logs.use-case.ts` (and `.spec.ts`)
  - **Actions:**
    - [ ] `modules/audit-logs/actions/logs/get-audit-logs.action.ts` (and `.spec.ts`)
    *(Note: `create-audit-log` is for internal use via Use-Cases or Subscribers. No direct Server Action for creation).*
  - **Facade:**
    - [ ] `modules/audit-logs/index.ts`
    - [ ] `modules/audit-logs/dtos/index.ts`

### Phase 9: Orchestrators & Events
- [ ] **Cross-Domain Workflow:** Build orchestrators for multi-domain processes if required (e.g., `checkout.orchestrator.ts` connecting doctor treatment submission with billing).
- [ ] **Background Tasks:** Setup background event subscribers (using Next.js `after()`) for emails or side-effects.

---

### 💡 Next Steps Guide:
1. Review the checklist above.
2. Phases 1–4 are fully completed! All core domains (Shared Core, Patients, Staff, Appointments) have DTOs, Repositories, Use-Cases, and Server Actions implemented with robust unit tests.
3. The next task is **Phase 5 (Services & Clinic Config Domain)**:
   - Implement the Services and Clinic Config domains.
