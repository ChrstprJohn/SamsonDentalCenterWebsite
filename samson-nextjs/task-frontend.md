# 🦷 Samson Dental – Frontend Development Checklist

This document is the official implementation task list for the Samson Dental frontend. It is compiled in strict alignment with the **Frontend System Design Guidelines (V3.0)**, the **Architectural Blueprint (V2.0)**, **Mock-First Architecture**, and the **Dental Appointment Business Plan**.

---

## 🛠️ Phase 0: System Scaffolding & Shared Kernel UI

Set up the base directories, core configuration, and the Shared UI kernel to ensure unified styling and full type-safety.

- [x] **0.1 Setup Domain Folders in `src/modules/`**
  - Create directory structures for the modules if not already populated:
    - [x] `appointments/` (actions, views, components, hooks, dtos, mocks)
    - [x] `billing/` (actions, views, components, hooks, dtos, mocks)
    - [x] `clinic-config/` (actions, views, components, hooks, dtos, mocks)
    - [x] `patients/` (actions, views, components, hooks, dtos, mocks)
    - [x] `services/` (actions, views, components, hooks, dtos, mocks)
    - [x] `staff/` (actions, views, components, hooks, dtos, mocks)
    - [x] `audit-logs/` (actions, views, components, hooks, dtos, mocks)
- [x] **0.2 Shared UI Design System Primitives (`src/components/ui/`)**
  - *Constraint: All input primitives must use `React.forwardRef` to bind correctly with `react-hook-form`.*
  - [x] **Button (`button.tsx`)**: Premium styled with gradients, glassmorphism hovers, and active micro-animations.
  - [x] **Input (`input.tsx`)**: Native wrapper using `React.forwardRef` for standard text, email, date, and phone input styles.
  - [x] **Textarea (`textarea.tsx`)**: Native wrapper using `React.forwardRef` for notes.
  - [x] **Select (`select.tsx`)**: Dropdown wrapper using `React.forwardRef`.
  - [x] **Badge (`badge.tsx`)**: Status pill for appointments and invoices (green for completed, yellow for pending, blue for scheduled, red for cancelled/rejected).
  - [x] **Modal (`modal.tsx`)**: Animated premium backdrop-blur modal shell with escape key dismissal.
  - [x] **Dropdown & Menu Primitives**: Accessible dropdown wrapper for user profile menus.
- [x] **0.3 Core Global Shared Hooks (`src/shared/hooks/`) & Layout Utilities (`src/shared/context/`)**
  - [x] **`use-media-query.ts`**: Hook for screen dimension matching.
  - [x] **`use-disclosure.ts`**: Pure controller for dialog/modal open/close states.
  - [x] **`use-click-outside.ts`**: Hook to dismiss menus and popovers on clicking elsewhere.
- [x] **0.4 Global Theme & Core Providers**
  - [x] **`src/context/theme-context.tsx`**: Theme toggle context (Dark/Light mode) supporting elegant dark mode as default.
  - [x] **`src/app/layout.tsx`**: Unified root layout with dynamic typography (e.g., Google Font *Outfit* or *Inter*), CSS variables, and global context injection.
  - [x] **`src/components/feedback/toast-container.tsx`**: Notification/Toast system for interactive micro-feedback.


---

## 🔐 Phase 1: Authentication & Account Access Flow

Build the patient registration and portal login experiences. Collect minimal fields to ensure a frictionless onboarding process.

- [x] **1.1 Identity Collection & Schema Setup**
  - [x] **Zod Schema & DTO (`src/modules/patients/dtos/auth/sign-up.dto.ts`)**:
  - [x] **Form Hook (`src/modules/patients/hooks/auth/use-sign-up-form.hook.ts`)**:
    - Patient Fields: First Name (req), Middle Name (opt), Last Name (req), Suffix (opt), Email (req), Phone Number (req, E.164), Date of Birth (req, YYYY-MM-DD).
- [x] **1.2 Auth Pages Routing (`src/app/(public)/auth/`)**
  - [x] **Sign-up page (`views/signup-view.tsx` & `components/auth/signup-form.tsx`)**:
    - Refactored: all logic extracted to `hooks/auth/use-sign-up-view.hook.ts`.
    - View is now a pure dumb orchestrator — zero inline state or effects.
    - Co-located spec: `use-sign-up-view.hook.spec.ts` — tests routing URL, success toast, email encoding.
    - Includes interactive Terms of Service & Privacy Policy checkboxes.
  - [x] **Login page (`views/login-view.tsx` & `components/auth/login-form.tsx`)**:
    - Refactored: logic extracted to `hooks/auth/use-login-view.hook.ts`.
    - Password / OTP toggle on the form component.
    - Co-located spec: `use-login-view.hook.spec.ts` — tests routing, toast, email encoding.
  - [x] **OTP Verification Screen (`views/otp-verify-view.tsx`)**:
    - Refactored: all digit input, countdown timer, verify, and resend logic extracted to `hooks/auth/use-otp-verify-view.hook.ts`.
    - Co-located spec: `use-otp-verify-view.hook.spec.ts` — tests digit filtering, multi-char paste, incomplete OTP rejection, success navigation & toasts.
- [x] **1.3 Header Authentication Triggers**
  - [x] **Authenticated User Header (`components/auth/authenticated-user-header.tsx`)**: Displays dynamic avatar (initials fallback), patient name, chevron toggle, and dropdown navigation links (My Portal, Appointments, Settings, Sign Out). Driven by `hooks/auth/use-auth-header.hook.ts`.
  - [x] **Notification Indicator (`components/auth/notification-indicator.tsx`)**: Bell icon with animated red badge next to avatar. Shows count (capped at 99+).
  - [x] **Hook (`hooks/auth/use-auth-header.hook.ts`)**: Controls dropdown open/close state and `getInitials()` helper. Co-located spec `use-auth-header.hook.spec.ts` tests all pure logic paths.

> 📋 **Testing Rule**: Every new hook must have a co-located `.spec.ts` file from day one. Pure logic helpers (like `getInitials`, digit validation) are unit-tested directly. Trivial `useState` toggles are exempt per the Frontend Testing Guidelines (Section 1B). View components must be backed by a companion hook that is testable in the node environment. Hooks are organized into nested feature-based sub-folders under `hooks/{module}/{feature}/` (e.g. `hooks/auth/login/use-login-form.hook.ts`) to maintain clean namespace grouping.

---

## 🎨 Phase 2: Public Landing Experience & Marketing

A high-fidelity, visually stunning single-page landing site designed with custom colors, gradients, and micro-animations.

- [x] **2.1 Main Landing Page (`src/app/(public)/(marketing)/page.tsx`)**
  - [x] **Hero Section**: Premium tagline, professional background graphic, and a prominent "Book Now" CTA.
  - [x] **Services Section**: Interactive cards that dynamically open modular overlay windows detailing the treatment.
  - [x] **About Us Section**: Highlighting the team and medical approach.
  - [x] **Gallery Section**: Highlighting the modern dental facilities.
  - [x] **Contact Section**: Operating hours, contact info, and email inquiry form.
- [x] **2.2 Navigation & Layout**
  - [x] **Sticky Navbar**: Transparent background which transitions to solid backdrop-blur upon scroll, linking sections. Swaps with AuthenticatedUserHeader if a session exists.
  - [x] **Footer Primitive**: Consistent across public/private pages. Contains:
    - [x] Terms of Service and Privacy Policy separate pages.
    - [x] Contact details (address, phone, email).
    - [x] Operating hours (pulled dynamically from clinic config).
    - [x] Social links array and Copyright notice.

---

## 🗓️ Phase 3: Patient Booking Wizard (Booking Domain)

Develop the 4-step interactive wizard inside the `appointments` module using mock-first architecture.

- [x] **3.1 Set Up Booking Wizard Shell (`src/modules/appointments/views/booking-view.tsx`)**
  - [x] Create parent view tracking step transitions: `Service ➔ Schedule ➔ Details ➔ Review`.
  - [x] Establish `useUserBooking.ts` hook for wizard step states and temporary variables.
- [x] **3.2 Step 1: Service Selection (`UserServiceStep`)**
  - [x] Grid of services showing duration (e.g., 30m, 1h), description, and specialization category.
- [x] **3.3 Step 2: Schedule Selection (`DateTimeStep`)**
  - [x] Month/Week calendar picker displaying slot availability dynamically.
  - [x] **Slot Hold Trigger**: Selecting a slot initiates an optimistic 10-minute database slot hold. Shows a floating circular countdown timer.
- [x] **3.4 Step 3: Patient Details (`UserOtherInfoStep`)**
  - [x] **Self / Someone Else Selector**:
    - [x] If "Self", pre-populate and display the authenticated patient info.
    - [x] If "Someone Else", display the family member (Dependent) panel.
  - [x] **Dependent Management Sub-component**:
    - [x] Let the user select from their registered dependents.
    - [x] Or click "Add Family Member" to dynamically render a modal form collecting First, Middle, Last Name, Suffix, DOB, Relationship, Sex, and optional clinical notes on-the-fly.
- [x] **3.5 Step 4: Review & Submit (`UserReviewStep`)**
  - [x] Clear booking summary layout.
  - [x] Strict checkbox validation for Terms of Service and Privacy Policy.
  - [x] **Abuse Validation Call (`validateAbuse`)**: Captures overlaps, cap limits, and daily quotas prior to submission.
  - [x] **Atomic Submission**: Submits wizard payload, invalidates slot holds, and routes to a high-fidelity success confirmation page.

---

## 👤 Phase 4: Patient User Portal

The personal hub for patient dashboards, history logs, and notifications.

- [x] **4.1 Dashboard Layout (`src/app/(portals)/user/`)**
  - [x] **Upcoming Appointments Panel**: Display scheduled slots with statuses, assigned doctor, and cancel/reschedule triggers.
  - [x] **Appointment History Panel**: Log of past treatments, billing invoices, and clinician notes.
  - [x] **My Requests Section**: Grouped rows showing pending bookings currently awaiting secretary approval.
- [x] **4.2 User Settings & Preferences**
  - [x] **Profile Editor**: Edit contact fields, upload/select a custom avatar.
  - [x] **Notification Settings**: Control preferences for SMS, Email, and in-app bell alerts.
- [x] **4.3 Reschedule & Cancellation Workflows**
  - [x] **Cancellation Trigger**: Triggers validation check, requires filling out a cancellation reason, and pops up a custom modal verification before committing.
  - [x] **Reschedule Trigger**:
    - [x] Checks `{ rescheduleCount, maxReschedules }` parameters.
    - [x] If rescheduled limit is reached (1 by default), blocks actions and displays a notice requesting staff contact.
    - [x] If allowed, redirects to DateTimeStep, keeping original booking group history alive.

---

## 👩‍💼 Phase 5: Secretary Portal

The high-volume workflow center for clinic staff. Fully dynamic dashboard (no caching) featuring popups and invoices.

- [x] **5.1 Secretary Dashboard (`src/app/(portals)/secretary/`)**
  - [x] Priority columns displaying incoming pending requests, upcoming calendar, and check-in tracking.
- [x] **5.2 Pending & Grouped Booking Requests Panel**
  - [x] Show family bookings grouped under unified card containers to prevent UI separation.
  - [x] **Approval Dialog Popup**: Let secretaries add custom or pick from predefined reasons before approving.
  - [x] **Rejection Dialog Popup**: Mandatory custom rejection reason.
  - [x] **Batch Finalization**: Support selecting multiple rows for family groups and clicking "Finalize Group" to fire queued asynchronous notifications at once.
- [x] **5.3 Checked-In & Check-Out Workflows**
  - [x] **Check-in Tracker**: Quick action button to mark patients as checked-in upon arrival.
  - [x] **Check-Out Process (Finalizing Invoices)**:
    - [x] Renders a list of draft invoices created by doctors under **Treatment Rendered**.
    - [x] Let the secretary open the draft, add final prices, apply custom discounts/codes, select payment method, and click "Check-Out / Completed" to lock and finalize.
- [x] **5.4 Audit Logs & Communications**
  - [x] **Audit Viewer**: View a lightweight read-only log filtering decisions (approved, rejected, cancelled, rescheduled) with timestamps, actor IDs, and reasons.
  - [x] **Email Log Viewer**: Searchable log showing all system-generated emails sent out to patients.

---

## 🩺 Phase 6: Doctor Portal

A clinical dashboard designed to streamline in-operatory documentation.

- [ ] **6.1 Doctor Dashboard (`src/app/(portals)/doctor/`)**
  - [ ] Lists today's active schedule and upcoming patient queue assigned to the doctor.
- [ ] **6.2 Clinical Session View**
  - [ ] **Patient Dental History (Read-only)**: Vertical timeline showing all past clinical charts, notes, and services rendered.
  - [ ] **Treatment Rendered Form**:
    - Input boxes for entering clinical notes, diagnostic remarks, and actual dental procedures completed.
    - Multi-select checkbox grid of services to generate the **Draft Invoice** payload.
    - Submit action changes the appointment status to `Treatment Rendered` and routes back to the dashboard.

---

## 👑 Phase 7: Clinic Admin & Configuration Portal

Complete administrative oversight of clinical rosters, services, and system-wide operation parameters.

- [ ] **7.1 Admin Analytics Dashboard (`src/app/(portals)/admin/`)**
  - [ ] Analytics graphs (e.g. appointment statistics, daily clinic performance).
- [ ] **7.2 Administrative Roster CRUD Panels**
  - [ ] **Manage Services**: List, add, edit details, set durations (30m, 1h, etc.), toggle active state, or archive services.
  - [ ] **Manage Doctors**: Create doctor accounts, configure custom weekly work schedules, breaks, and days off.
  - [ ] **Manage Users & Secretaries**: System-wide list with user account search, status edits, and deactivation triggers.
- [ ] **7.3 Global Clinic Config Editor**
  - [ ] **Clinic Info**: Form fields for clinic name, physical address, email, and phone contact.
  - [ ] **Operating Hours Roster**: Set default open/close times per weekday with integrated validation constraints.
  - [ ] **Scheduling Policies**:
    - Toggle `allow_same_day_booking`.
    - Input box for `calendar_render_days` count.
    - Select default slot durations.
    - Input box for `max_reschedules_per_appointment`.
  - [ ] **Booking Toggle**: Primary toggle switch to open or close online booking. When toggled off, inputs a custom maintenance message to display on the public booking wizard page.
- [ ] **7.4 Global System Audit**
  - [ ] Lightweight read-only system-wide audit logs showing actors, times, and actions taken.

---

## 🧪 Phase 8: Mock Swap, Integration & Testing

Ensure perfect visual state boundaries, robust schema validations, and premium E2E flow testing.

- [ ] **8.1 Live Swap & Server Actions Hookup**
  - [ ] Replace RSC mock datasets (`mocks/*.mock.ts`) with live database queries (`services/*.server.ts`) inside routes.
  - [ ] Hook client boundary views to Server Actions (`actions/*.ts`), returning standard serialized payloads.
  - [ ] Implement the *Server-Action-to-RHF Error Bridge*: standardizing server exceptions and using RHF's `setError` to highlight the invalid inputs.
- [ ] **8.2 Vitest Component & Hook Unit Testing**
  - [x] Unit test auth hooks (`use-sign-up-form.hook`, `use-login-form.hook`).
  - [ ] Unit test custom hooks (`useUserBooking.ts`) under simulated error and success states.
  - [ ] Ensure Zod input rules correctly reject bad emails, incorrect E.164 phone formats, or invalid dates.
- [ ] **8.3 Playwright End-to-End Testing**
  - [ ] Script a full walkthrough flow:
    - [ ] 1. Visitor goes to Landing page -> clicks "Book Now".
    - [ ] 2. Navigates through User Signup, enters credentials, completes OTP verification.
    - [ ] 3. Books an appointment for a dependent family member.
    - [ ] 4. Admin adjusts reschedule limits in config.
    - [ ] 5. Secretary approves the appointment and updates check-in status.
    - [ ] 6. Doctor fills out clinical treatment notes, creating a draft invoice.
    - [ ] 7. Secretary reviews, applies discount, and checks out.
