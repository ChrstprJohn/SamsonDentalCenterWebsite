# Project Setup & Backend Development Checklist

Currently, we are focusing purely on the **Backend and Setup** aspects following the Domain-first (Modulith) Architecture defined in `1-ARCHITECTURE.md`. Frontend UI components and pages are skipped for now.

## ✅ DONE (Completed Tasks)
- [x] **Project Initialization:** Next.js (App Router) scaffolding.
- [x] **Dependencies Setup:** Installed crucial packages (`@supabase/supabase-js`, `@supabase/ssr`, `zod`, `vitest`, `resend`, `server-only`).
- [x] **Folder Structure:** Scaffolding matching the Architectural Blueprint (`modules/`, `shared/`, `orchestrators/`, etc.).
- [x] **Supabase Setup:** Initialized SSR clients (`shared/database/client.ts`, `shared/database/server.ts`, and `shared/database/middleware.ts`).
- [x] **Testing Setup:** Initialized Vitest (`vitest.config.ts`) and added testing specs for DB clients.

## 🚧 TO DO (Backend Tasks)

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
- [x] **DTOs:** Defined Zod validation schemas for patient inputs (`register-patient.dto.ts`).
- [x] **Repositories (CQRS):** Implemented pre-emptively split repositories (`patient-profile.commands.ts`, `patient-profile.queries.ts`) inside `modules/patients/repositories/`.
- [x] **Use-Cases:** Implement pure business logic functions (e.g., `register-patient.use-case.ts`).
- [x] **Server Actions:** Wire the Next.js form handling/RPCs in `modules/patients/actions/` (Controllers that validate DTOs, execute Use-Cases, and return results/errors).
- [x] **Facade Config:** Export stable public APIs (if any) via `modules/patients/index.ts`.

### ✅ Phase 3: Staff Domain (Backend) - COMPLETED
- [x] **DTOs:** Define schemas for staff and schedules.
- [x] **Repositories (Queries):** Implemented `staff-profile.queries.ts` with `getStaffProfile()` query inside `modules/staff/repositories/`. Tests passing via `staff-profile.queries.spec.ts`.
- [x] **Repositories (Commands):** Implement `staff-profile.commands.ts` for write operations (create, update, terminate).
- [x] **Use-Cases:** Write business logic for creating staff, terminating employment, or updating clinic hours (`use-cases/create-staff.use-case.ts`, etc.).
- [x] **Server Actions (Segmented):** Create segmented action files inside `actions/` (e.g., `admin-staff.actions.ts`, `doctor-schedule.actions.ts`, `profile.actions.ts`) to avoid God classes.
- [x] **Facade Config:** Export stable public APIs via `modules/staff/index.ts`.

### Phase 4: Appointments Domain (Backend)
- [x] **DTOs / Schemas:**
  - [x] Define `GetAvailabilityDto` (date, service_id).
  - [x] Define `SubmitBookingDto` (service_id, doctor_id, date, start_time, end_time, user_note, dependent fields).
  - [x] Define schemas for status updates (e.g., `UpdateAppointmentStatusDto` with reason notes).
  - [x] Define `GetClinicAppointmentsDto` for clinic portal query filtering.
- [x] **Repositories (Queries):**
  - [x] Implement `appointment.queries.ts` to fetch appointments by user (patient portal) and by clinic (admin/secretary portal).
  - [x] Implement slot-checking queries (fetch existing overlapping appointments, fetch doctor schedules).
- [x] **Repositories (Commands):**
  - [x] Implement `appointment-booking.commands.ts` for strictly creating appointments (the atomic wizard submission).
  - [x] Implement `appointment-status.commands.ts` for status updates (`PENDING` -> `APPROVED`, `CANCELLED`, etc.) and metrics tracking.
- [x] **Use-Cases (Business Logic):**
  - [x] `get-availability.use-case.ts`: Calculate available slots (Doctor Schedules - Breaks - Existing Appointments).
  - [x] `submit-booking.use-case.ts`: Atomic execution to prevent double-booking and save the appointment.
  - [x] `update-appointment-status.use-case.ts`: Enforce status machine rules (e.g., only 1 Reschedule Request allowed, tracking credibility / no-shows).
- [ ] **Server Actions (Endpoints for Frontend):**
  - [ ] `booking-wizard.actions.ts`: Actions mapped directly to the frontend wizard (fetch availability, final submit).
  - [ ] `patient-portal.actions.ts`: Actions for the patient dashboard (cancel appointment, request reschedule).
  - [ ] `staff-appointments.actions.ts`: Actions for secretaries/admins to review, approve, reject, or complete appointments.

### Phase 5: Orchestrators & Events
- [ ] **Cross-Domain Workflow:** Build orchestrators for multi-domain processes if required (e.g., `checkout.orchestrator.ts`).
- [ ] **Background Tasks:** Setup background event subscribers (using Next.js `after()`) for emails or side-effects.

---

### 💡 Next Steps Guide:
1. Review the checklist above.
2. Tell me which Phase or Task you want to tackle first (I highly recommend starting with **Phase 1: Shared Core (Global Kernel)** and then moving to the **Patients domain**).
3. I will guide you on the exact technical implementation, step-by-step, and wait for your command before writing any code.