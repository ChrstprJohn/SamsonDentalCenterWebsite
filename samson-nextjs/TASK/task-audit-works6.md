# Frontend System Design Audit & Task List

This document logs the frontend architecture audit findings for the Samson Dental Center codebase. The audit was conducted against the official **Frontend System Design Guidelines (0-GUIDELINES to 5-TESTING_GUIDELINES)** to ensure modularity, separation of concerns, DRY (Don't Repeat Yourself), correct testing compliance, and the prevention of God Components.

---

## 📋 Executive Summary of Violations

1. **RSC vs. Client Boundary Violations**: Next.js App Router route page entry points (`page.tsx`) must be Server Components (RSC) acting as secure data fetchers/orchestrators. In the Secretary portal, **every single page** is configured as a client component (`'use client'`) and handles logic directly.
2. **"God Component" File Length Limits**: No view or presentation component file should exceed **150 lines** of code. Multiple files across both the patient (user) portal and the secretary portal violate this limit.
3. **Missing Companion Hook Bindings (Dumb Component Pattern Violation)**: Complex interactive states, multi-step actions, and calendar slots API calls are handled directly inside page components rather than extracted into companion hooks. All logical controllers must reside in a companion hook, and presentational views must remain 100% dumb (only receiving props, with zero inline business calculations, network fetches, or complex state mutations).
4. **Casing & Naming Standards Violations**: Custom hooks are named `use-*.hook.ts` instead of `use-*.ts` (standard: `use-kebab-case.ts`).
5. **Testing Guidelines Violations (Missing Spec Files)**: React hooks and Server Actions must be accompanied by co-located sibling unit test files (`*.spec.ts`) from day one. Multiple hooks and actions lack test coverage.
6. **DRY Violations**: Re-fetching clinic services, checking date slot availability, and checking doctor schedules are written independently across 5+ different pages.

---

## 🛡️ Critical Backend & Integration Protection Guidelines

During frontend refactoring, you must preserve existing backend integrations:
> [!IMPORTANT]
> *   **Do NOT Alter Backend Logic**: Never modify the internal logic, database queries, migrations, or DTO structures of server actions (`src/modules/*/actions/`) or services (`src/modules/*/services/*.server.ts`).
> *   **Maintain API Contracts**: Keep the exact argument signature, return types, and response structure for all Server Actions and backend endpoints. Refactoring should strictly shift *where* and *how* these actions are called in the frontend, never altering their backend execution behavior.
> *   **Revalidate Correct Paths**: Ensure `revalidatePath` calls inside the server actions remain unchanged, as they trigger crucial page caching updates.

---

## 🔍 Detailed List of Violating Files

### 1. Route Entry Points (App Router `page.tsx` Violations)
*Next.js route pages must not have `'use client'` on line 1/2. They should be Server Components that fetch initial data and render a View Orchestrator.*

*   ❌ **[secretary/appointments/page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/%28portals%29/secretary/appointments/page.tsx)**
    * *Violation*: Marked `'use client'`, 781 lines long, manages complex booking, rescheduling, and cancellation logic inline.
    * *Remedy*: Convert to Server Component, delegate to a dumb view, move all business logic into a custom hook. Ensure that when calling `getClinicAppointmentsAction`, `getDoctorsAction`, and other actions, the parameters are passed exactly as before to preserve the database fetches.
*   ❌ **[secretary/book/page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/%28portals%29/secretary/book/page.tsx)**
    * *Violation*: Marked `'use client'`, 725 lines long, manages patient searches and dependent registration inline.
    * *Remedy*: Convert to Server Component, delegate to a dumb view, move lookup/scheduling logic into a custom hook. Do not modify the patient search database payload formats or dependent creation actions.
*   ❌ **[secretary/check-in/page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/%28portals%29/secretary/check-in/page.tsx)**
    * *Violation*: Marked `'use client'`, 1,050 lines long, imports database client directly, builds invoices/checkouts inline.
    * *Remedy*: Convert to Server Component, delegate to a dumb view, move payment flow states to a custom hook. Preserve existing supbase/client-side calls for subscription/realtime events if applicable, but isolate them. Keep checkout billing action parameters identical.
*   ❌ **[secretary/inquiries/page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/%28portals%29/secretary/inquiries/page.tsx)**
    * *Violation*: Marked `'use client'`, 953 lines long, handles guest profiles and inquiry conversions inline.
    * *Remedy*: Convert to Server Component, delegate to a dumb view, move conversion stepper logic to a custom hook. Ensure inquiry conversion server action contracts are unchanged.
*   ❌ **[secretary/pending/page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/%28portals%29/secretary/pending/page.tsx)**
    * *Violation*: Marked `'use client'`, 776 lines long, handles patient approval checks and calendar overlays inline.
    * *Remedy*: Convert to Server Component, delegate to a dumb view, move validation logic to a custom hook.
*   ❌ **[secretary/reschedule-requests/page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/%28portals%29/secretary/reschedule-requests/page.tsx)**
    * *Violation*: Marked `'use client'`, 439 lines long, handles reschedule requests inline.
    * *Remedy*: Convert to Server Component, delegate to a dumb view, move approval flow states to a custom hook.
*   ❌ **[secretary/audits/page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/%28portals%29/secretary/audits/page.tsx)**
    * *Violation*: Marked `'use client'`, contains inline states for log filters.
    * *Remedy*: Convert to Server Component, delegate to a dumb view, move search state to a custom hook.
*   ❌ **[secretary/emails/page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/%28portals%29/secretary/emails/page.tsx)**
    * *Violation*: Marked `'use client'`, has inline states for search and log views.
    * *Remedy*: Convert to Server Component, delegate to a dumb view, move logs presentation to a custom hook.
*   ❌ **[secretary/invoices/page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/%28portals%29/secretary/invoices/page.tsx)**
    * *Violation*: Marked `'use client'`, contains invoice search states and prints receipts inline.
    * *Remedy*: Convert to Server Component, delegate to a dumb view, move filters state to a custom hook.
*   ❌ **[secretary/profile/page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/%28portals%29/secretary/profile/page.tsx)**
    * *Violation*: Marked `'use client'`, handles profile fields and update submissions inline.
    * *Remedy*: Convert to Server Component, delegate to a dumb view, move profile input states to a custom hook.

---

### 2. File Length Violations (>150 Lines Threshold)
*Component and view files must be modularized and kept under 150 lines.*

#### A. Patient (User) Portal Views & Components
*   ❌ **[appointment-detail-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/views/appointment-detail-view.tsx)** (183 lines)
    * *Remedy*: Extract the clinical notes or sub-status detail rows into local sub-components.
*   ❌ **[patient-appointments-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/views/patient-appointments-view.tsx)** (152 lines)
    * *Remedy*: Split out tab navigation or filters container.
*   ❌ **[appointment-schedule-card.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/components/sub-components/appointment-schedule-card.tsx)** (163 lines)
    * *Remedy*: Extract action buttons (Reschedule/Cancel) or date display badge.
*   ❌ **[authenticated-user-header.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/auth/authenticated-user-header.tsx)** (165 lines)
    * *Remedy*: Extract drop-down navigation links.

#### B. Landing Page Components
*   ❌ **[contact-section.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/contact-section.tsx)** (416 lines)
    * *Remedy*: Extract custom inline calendar picker.
*   ❌ **[about-section.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/about-section.tsx)** (159 lines)
    * *Remedy*: Clean inline JSX grids.
*   ❌ **[gallery-section.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/gallery-section.tsx)** (503 lines)
    * *Remedy*: Extract the image carousels or image zoom popup details.
*   ❌ **[journey-section.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/journey-section.tsx)** (196 lines)
    * *Remedy*: Extract timeline/stepper nodes.
*   ❌ **[services-section.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/services-section.tsx)** (214 lines)
    * *Remedy*: Extract single service card item.
*   ❌ **[testimonials-section.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/testimonials-section.tsx)** (184 lines)
    * *Remedy*: Extract testimonial review card.

---

### 3. File Naming Casing Violations
*Custom hooks must follow the `use-kebab-case.ts` naming convention, avoiding `.hook` in the extension.*

*   ❌ `use-forgot-password-view.hook.ts` & `*.spec.ts` $\rightarrow$ Rename to `use-forgot-password-view.ts`
*   ❌ `use-auth-header.hook.ts` & `*.spec.ts` $\rightarrow$ Rename to `use-auth-header.ts`
*   ❌ `use-login-form.hook.ts` & `*.spec.ts` $\rightarrow$ Rename to `use-login-form.ts`
*   ❌ `use-login-view.hook.ts` & `*.spec.ts` $\rightarrow$ Rename to `use-login-view.ts`
*   ❌ `use-otp-verify-view.hook.ts` & `*.spec.ts` $\rightarrow$ Rename to `use-otp-verify-view.ts`
*   ❌ `use-reset-password-view.hook.ts` & `*.spec.ts` $\rightarrow$ Rename to `use-reset-password-view.ts`
*   ❌ `use-sign-up-form.hook.ts` & `*.spec.ts` $\rightarrow$ Rename to `use-sign-up-form.ts`
*   ❌ `use-sign-up-view.hook.ts` & `*.spec.ts` $\rightarrow$ Rename to `use-sign-up-view.ts`
*   ❌ `use-landing-view.hook.ts` & `*.spec.ts` $\rightarrow$ Rename to `use-landing-view.ts`
*   ❌ `use-profile-settings-view.hook.ts` & `*.spec.ts` $\rightarrow$ Rename to `use-profile-settings-view.ts`
*   ❌ `use-secretary.hook.ts` $\rightarrow$ Rename to `use-secretary.ts`
*   ❌ `use-staff-login-form.hook.ts` $\rightarrow$ Rename to `use-staff-login-form.ts`
*   ❌ `use-staff-login-view.hook.ts` $\rightarrow$ Rename to `use-staff-login-view.ts`

---

### 4. Testing Violations (Missing Sibling Unit Tests)
*Custom hooks and Server Actions must have a sibling `*.spec.ts` test file.*

*   ❌ **[use-user-dashboard-summary.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/hooks/dashboard/use-user-dashboard-summary.ts)**
    * *Status*: Missing `use-user-dashboard-summary.spec.ts` sibling.
*   ❌ **[use-appointment-detail.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/hooks/detail/use-appointment-detail.ts)**
    * *Status*: Missing `use-appointment-detail.spec.ts` sibling.
*   ❌ **[use-notifications.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/hooks/notifications/use-notifications.ts)**
    * *Status*: Missing `use-notifications.spec.ts` sibling.
*   ❌ **[use-admin-dashboard.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/use-admin-dashboard.ts)**
    * *Status*: Missing `use-admin-dashboard.spec.ts` sibling.
*   ❌ **[use-doctor-dashboard.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/use-doctor-dashboard.ts)**
    * *Status*: Missing `use-doctor-dashboard.spec.ts` sibling.
*   ❌ **[use-secretary-dashboard.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/use-secretary-dashboard.ts)**
    * *Status*: Missing `use-secretary-dashboard.spec.ts` sibling.
*   ❌ **[use-secretary.hook.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/use-secretary.hook.ts)**
    * *Status*: Missing `use-secretary.spec.ts` sibling.
*   ❌ **[use-staff-login-form.hook.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/auth/login/use-staff-login-form.hook.ts)**
    * *Status*: Missing `use-staff-login-form.spec.ts` sibling.
*   ❌ **[use-staff-login-view.hook.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/auth/login/use-staff-login-view.hook.ts)**
    * *Status*: Missing `use-staff-login-view.spec.ts` sibling.
*   ❌ **[get-doctors.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/actions/management/get-doctors.action.ts)**
    * *Status*: Missing `get-doctors.action.spec.ts` sibling.

---

## 🛠️ Refactoring Action Items (Task List)

- [ ] **Phase 1: Standardize Hook Names & Add Sibling Tests**
  - [ ] Rename all `*.hook.ts` and `*.hook.spec.ts` custom hook files to `*.ts` and `*.spec.ts` respectively.
  - [ ] Create Vitest sibling test files for all the 9 missing hooks and the 1 missing server action listed above.

- [ ] **Phase 2: Extract Reusable Scheduling Logic (Fix DRY Violations)**
  - [ ] Create a single custom hook `use-booking-scheduler.ts` under `src/modules/appointments/hooks/shared/` to coordinate calendar dates queries, available doctors, and slot resolutions.
  - [ ] Use Zod schema validation for scheduling inputs.

- [ ] **Phase 3: Refactor Landing Pages & Forms**
  - [ ] Refactor [use-landing-view.hook.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/hooks/landing/use-landing-view.hook.ts) to utilize Zod + React Hook Form for contact inquiries.
  - [ ] Split [contact-section.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/contact-section.tsx) (extract inline custom calendar).
  - [ ] Split landing page sections that exceed 150 lines (`about-section.tsx`, `gallery-section.tsx`, `journey-section.tsx`, `services-section.tsx`, `testimonials-section.tsx`).

- [ ] **Phase 4: Refactor Patient (User) Portal Components**
  - [ ] Modularize views exceeding 150 lines (`appointment-detail-view.tsx`, `patient-appointments-view.tsx`).
  - [ ] Modularize components exceeding 150 lines (`appointment-schedule-card.tsx`, `authenticated-user-header.tsx`).

- [ ] **Phase 5: Re-architect Secretary Portal Pages (Server Components + Views)**
  - [ ] Convert all secretary sub-directory pages from Client Components to Server Components.
  - [ ] Create respective presentational view orchestrators (e.g. `AppointmentsView`, `BookAppointmentView`, `CheckInOutTrackerView`, `InquiriesQueueView`, `PendingRequestsView`, `RescheduleRequestsView`, `AuditLogView`, `EmailLogView`, `InvoiceManagementView`, `SecretaryProfileView`).
  - [ ] Ensure all view orchestrators and components are strictly presentational and 100% dumb (taking only props, no inline state/calculators/fetches).
  - [ ] Move state management and logical workflows from pages to dedicated custom hooks under `src/modules/staff/hooks/`.
  - [ ] Break down the giant tables, forms, and modals into separate components under 150 lines.
  - [ ] Double-verify all action calls: Ensure that backend Server Actions and DTO interfaces are **never** modified, preserving the original parameter payloads and DB constraints completely.
