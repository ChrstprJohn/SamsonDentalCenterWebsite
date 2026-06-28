# Comprehensive Architecture Audit Checklist

This checklist tracks all identified architectural violations across the Samson Dental Portal. Based on the rules defined in `.CORE_DOCUMENTATION`, these violations must be mitigated.

## Phase 1: Frontend God Component Mitigation
Components exceeding the 150-line rule must be decomposed into smaller atomic sub-components and/or custom hooks.

### Patients Module
- [x] `src/modules/patients/components/auth/authenticated-user-header.tsx` (Compliant: active code lines under 150)
- [x] `src/modules/patients/components/notifications/notifications-view.tsx` (Decomposed and compliant)

### Staff Module
- [x] `src/modules/staff/views/admin-dashboard-view.tsx` (Decomposed and compliant)
- [x] `src/modules/staff/views/doctor-dashboard-view.tsx` (Decomposed and compliant)
- [x] `src/modules/staff/views/secretary-dashboard-view.tsx` (Decomposed and compliant)
- [x] `src/modules/staff/components/sub-components/pending-booking-queue.tsx` (Decomposed and compliant)

### Appointments Module
- [x] `src/modules/appointments/components/booking/date-time-step.tsx` (Decomposed and compliant)
- [x] `src/modules/appointments/components/booking/patient-details-step.tsx` (Decomposed and compliant)
- [x] `src/modules/appointments/components/booking/review-step.tsx` (Decomposed and compliant)
- [x] `src/modules/appointments/components/dashboard/appointment-summary-card.tsx` (Decomposed and compliant)
- [x] `src/modules/appointments/components/sub-components/appointment-schedule-card.tsx` (Compliant: active code lines under 150)
- [x] `src/modules/appointments/views/booking-view.tsx` (Decomposed and compliant)
- [x] `src/modules/appointments/views/patient-appointments-view.tsx` (Compliant: active code lines under 150)
- [x] `src/modules/appointments/views/user-dashboard-summary-view.tsx` (Decomposed and compliant)

---

## Phase 2: Functional CQRS Migration (OOP Removal)
**STATUS: COMPLETELY RESOLVED ✅**

The architecture explicitly forbids the use of `class` and `new ClassName()`. All Repositories and Use Cases have been converted to pure functional closures.

### Patients Module
- [x] `src/modules/patients/repositories/dependents/patient-dependents.commands.ts`
- [x] `src/modules/patients/repositories/dependents/patient-dependents.queries.ts`
- [x] `src/modules/patients/repositories/profile/patient-profile.commands.ts`
- [x] `src/modules/patients/repositories/profile/patient-profile.queries.ts`
- [x] `src/modules/patients/use-cases/dependents/create-dependent.use-case.ts`
- [x] `src/modules/patients/use-cases/dependents/get-user-dependents.use-case.ts`
- [x] `src/modules/patients/use-cases/profile/get-patient-profile.use-case.ts`
- [x] `src/modules/patients/use-cases/profile/register-patient.use-case.ts`

### Staff Module
- [x] `src/modules/staff/repositories/management/doctor-services.commands.ts`
- [x] `src/modules/staff/repositories/management/get-active-doctors.queries.ts`
- [x] `src/modules/staff/repositories/management/user-management.commands.ts`
- [x] `src/modules/staff/repositories/management/user-management.queries.ts`
- [x] `src/modules/staff/repositories/profile/staff-profile.commands.ts`
- [x] `src/modules/staff/repositories/profile/staff-profile.queries.ts`
- [x] `src/modules/staff/repositories/schedule/staff-schedule.commands.ts`
- [x] `src/modules/staff/use-cases/management/assign-doctor-services.use-case.ts`
- [x] `src/modules/staff/use-cases/management/deactivate-user.use-case.ts`
- [x] `src/modules/staff/use-cases/management/get-all-users.use-case.ts`
- [x] `src/modules/staff/use-cases/management/get-doctors.use-case.ts`
- [x] `src/modules/staff/use-cases/profile/create-staff.use-case.ts`
- [x] `src/modules/staff/use-cases/profile/get-staff-profile.use-case.ts`
- [x] `src/modules/staff/use-cases/profile/terminate-staff.use-case.ts`
- [x] `src/modules/staff/use-cases/profile/update-staff.use-case.ts`
- [x] `src/modules/staff/use-cases/schedule/update-doctor-schedule.use-case.ts`

### Appointments Module
- [x] `src/modules/appointments/repositories/clinic/clinic-appointments.queries.ts`
- [x] `src/modules/appointments/repositories/patient/patient-appointments.queries.ts`
- [x] `src/modules/appointments/repositories/treatment/treatment.commands.ts`
- [x] `src/modules/appointments/use-cases/clinic/get-clinic-appointments.use-case.ts`
- [x] `src/modules/appointments/use-cases/patient/get-patient-appointments.use-case.ts`
- [x] `src/modules/appointments/use-cases/treatment/submit-treatment.use-case.ts`

### Billing Module
- [x] `src/modules/billing/repositories/invoicing/invoice.commands.ts`
- [x] `src/modules/billing/repositories/invoicing/invoice.queries.ts`
- [x] `src/modules/billing/use-cases/invoicing/finalize-invoice.use-case.ts`
- [x] `src/modules/billing/use-cases/invoicing/generate-invoice.use-case.ts`
- [x] `src/modules/billing/use-cases/invoicing/get-invoices.use-case.ts`
- [x] `src/modules/billing/use-cases/invoicing/update-invoice.use-case.ts`

---

## Phase 3: Module Boundary Enforcement (Barrel Traps)
**STATUS: COMPLETELY RESOLVED ✅**

The Barrel Trap issue where `index.ts` files were inadvertently causing Next.js to bundle server-only code to the client has been fully resolved.
All `index.ts` files have been migrated to explicit `exports.ts` files across all modules, and cross-module imports have been explicitly bound to `/exports`.

---

## Phase 4: File Structure & Naming Violations
**STATUS: COMPLETELY RESOLVED ✅**

### Invalid Layer Placement / Mock File Placement
- [x] `src/modules/appointments/dtos/shared/mock-appointments.ts` -> Relocated to `src/modules/appointments/mocks/mock-appointments.ts`.

### Invalid File Naming Conventions
The status query and command files have been renamed to follow plural conventions and end in `.queries.ts` or `.commands.ts`:
- [x] `src/modules/appointments/repositories/status/get-appointment-by-id.queries.ts`
- [x] `src/modules/appointments/repositories/status/increment-user-credibility-metric.commands.ts`
- [x] `src/modules/appointments/repositories/status/insert-ledger-entry.commands.ts`
- [x] `src/modules/appointments/repositories/status/update-status.commands.ts`