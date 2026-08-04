# Codebase Architecture, Folder Structure & "One File, One Job" Audit

> **Audit Objective**: Evaluate backend and frontend modules for clean separation of concerns, single-responsibility adherence ("One File, One Job"), folder organization, and component size maintainability—**without breaking existing features or API contracts**.

---

## Executive Summary & Architectural Overview

The codebase is organized into domain-driven feature modules under `src/modules/` (e.g., `appointments`, `staff`, `patients`, `billing`, `doctors`, `notifications`), along with `src/app` for Next.js App Router pages, `src/shared` for cross-cutting utilities, and `src/orchestrators` for background events.

While the backend server actions generally adhere to one-action-per-file (`<action-name>.action.ts`), several **frontend view components, custom hooks, shared database definitions, and complex sub-components violate the Single Responsibility Principle**. Certain components exceed 1,000 lines of code and handle 5-7 distinct operational concerns.

---

## 1. Top Long & Multi-Responsibility Files

### Frontend Views & Components

#### 1. `src/modules/staff/views/secretary/sub-components/check-in-detail-pane.tsx`
- **Current Size**: **1,408 lines**
- **Problems**:
  - Acts as a monolithic container performing:
    1. Patient demography & contact rendering
    2. Identity verification toggle logic
    3. Check-in & checkout status mutation handling
    4. Payment/invoice status breakdown & billing summary
    5. Appointment history timeline pagination
    6. Reschedule drawer state & form submission
    7. Multi-step confirmation dialogs
- **Proposed Solution (Non-breaking)**:
  - Decompose into specialized sub-components inside `sub-components/check-in/`:
    - `check-in-patient-header.tsx` (~120 lines): Patient details & contact badges.
    - `check-in-verification-card.tsx` (~100 lines): ID verification toggle & badges.
    - `check-in-billing-summary.tsx` (~150 lines): Payment status & invoice link.
    - `check-in-action-bar.tsx` (~150 lines): Check-in / Undo / Complete buttons.
    - `check-in-timeline.tsx` (~150 lines): History timeline feed.
  - Keep `check-in-detail-pane.tsx` as a lightweight orchestrator wrapper (<150 lines) re-exporting the same interface.

---

#### 2. `src/modules/staff/views/secretary/secretary-chat-inbox-view.tsx`
- **Current Size**: **1,135 lines**
- **Problems**:
  - Mixes 6 distinct responsibilities into one file:
    1. Chat conversation thread search & filtering
    2. Real-time message list rendering & auto-scroll
    3. Message composition input & quick response templates
    4. Real-time polling / WebSocket subscription lifecycle
    5. Patient sidebar metadata & appointment drawer integration
    6. Multi-tab chat filter state (All, Unread, Pending)
- **Proposed Solution (Non-breaking)**:
  - Extract state management into custom hook `use-chat-inbox-view-state.ts`.
  - Extract child UI elements into dedicated files:
    - `chat-inbox-sidebar.tsx` (~200 lines): Conversation list & search bar.
    - `chat-thread-viewport.tsx` (~250 lines): Message stream & auto-scroll.
    - `chat-input-toolbar.tsx` (~150 lines): Input area & quick templates.
    - `chat-patient-context-drawer.tsx` (~180 lines): Patient drawer panel.

---

#### 3. `src/modules/staff/views/secretary/secretary-book-appointment-view.tsx`
- **Current Size**: **861 lines**
- **Problems**:
  - Combines full multi-step wizard state, doctor schedule lookup, patient lookup/creation modal, slot generation algorithm, and final confirmation summary into one view.
- **Proposed Solution (Non-breaking)**:
  - Split wizard steps into dedicated files under `sub-components/booking-wizard/`:
    - `step-patient-selection.tsx` (~200 lines)
    - `step-doctor-schedule-picker.tsx` (~250 lines)
    - `step-appointment-summary.tsx` (~150 lines)

---

#### 4. `src/modules/staff/views/secretary/secretary-pending-requests-view-v2.tsx`
- **Current Size**: **701 lines**
- **Problems**:
  - Handles pending queue grid/list rendering, inline quick actions, batch processing controls, request detail modal, and filter status toolbar.
- **Proposed Solution (Non-breaking)**:
  - Extract `pending-requests-toolbar.tsx` and `pending-requests-table.tsx`.

---

#### 5. `src/modules/staff/views/secretary/appointment-email-timeline-view.tsx` (613 lines) & `secretary-past-appointment-follow-ups-view.tsx` (535 lines)
- **Current Size**: **613 & 535 lines**
- **Problems**:
  - Contains raw HTML iframe preview logic, email log parsing utilities, timeline rendering, and status filtering all inside the React component.
- **Proposed Solution (Non-breaking)**:
  - Move log parsing to `email-timeline.util.ts`.
  - Extract `email-preview-modal.tsx` into a standalone UI component.

---

#### 6. `src/components/ui/sidebar.tsx`
- **Current Size**: **714 lines**
- **Problems**:
  - Combines main layout context provider, mobile sheet drawer, sidebar header/content/footer wrappers, collapsible group states, and tooltip providers.
- **Proposed Solution (Non-breaking)**:
  - Modularize `sidebar.tsx` into `sidebar-context.tsx`, `sidebar-menu.tsx`, and `sidebar-mobile.tsx`, with `sidebar.tsx` serving as the main entry barrel file.

---

### Frontend Hooks

#### 1. `src/modules/staff/hooks/secretary/use-secretary-inquiries-queue.ts`
- **Current Size**: **469 lines**
- **Problems**:
  - Handles inquiry data fetching, debounced search filtering, pagination, optimistic UI updates, inquiry conversion actions, and inquiry drop actions in one single hook.
- **Proposed Solution (Non-breaking)**:
  - Split into:
    - `use-inquiries-query.ts`: Fetching, debouncing, pagination.
    - `use-inquiries-mutations.ts`: Convert & drop server action calls.

---

#### 2. `src/modules/staff/hooks/secretary/use-secretary-appointments.ts` (407 lines) & `use-secretary.ts` (382 lines)
- **Current Size**: **407 & 382 lines**
- **Problems**:
  - Aggregates all appointment data queries, status change handlers (cancel, reschedule, check-in, no-show), and filter states.
- **Proposed Solution (Non-breaking)**:
  - Separate query fetching from mutation actions (`use-appointment-status-actions.ts`).

---

### Backend & Shared Layer

#### 1. `src/shared/database/database.types.ts`
- **Current Size**: **813 lines**
- **Problems**:
  - Single monolithic generated file containing types for all database tables (appointments, patients, staff, audit_logs, billing, notifications, etc.). Slows down IDE auto-completion and produces huge git diffs during schema updates.
- **Proposed Solution (Non-breaking)**:
  - Split into domain schema types under `src/shared/database/types/`:
    - `appointments.types.ts`
    - `patients.types.ts`
    - `staff.types.ts`
    - `billing.types.ts`
    - `notifications.types.ts`
  - Re-export all types from `database.types.ts` to preserve 100% backward compatibility for all existing imports across the application.

---

#### 2. `src/modules/appointments/repositories/chat/chat.queries.ts`
- **Current Size**: **306 lines**
- **Problems**:
  - Blends raw SQL join builders, pagination helpers, unread count calculators, and message mapping transformations into one file.
- **Proposed Solution (Non-breaking)**:
  - Split query execution into `chat-read.repository.ts` and `chat-write.repository.ts`.

---

#### 3. `src/orchestrators/event-subscribers.ts` & Outbox Handler Isolation
- **Problems**:
  - Multiple event subscriber handlers registered for outbox notifications execute inside a single loop. If a downstream subscriber fails (e.g. SMS gateway timeout), previously successful subscribers (e.g. Email dispatch) re-execute upon retry.
- **Proposed Solution (Non-breaking)**:
  - Ensure subscriber handler idempotency or split distinct outbox event types (e.g. `APPOINTMENT_BOOKED_EMAIL` vs `APPOINTMENT_BOOKED_SMS`).

---

## 2. Folder Structure & Route Consolidation Strategy

### Route Duplication (`secretary` vs `secretary-v2`, `user` vs `user-v2`)
- **Current Observation**:
  - Under `src/app/(portals)/`, there exist parallel directories:
    - `secretary` and `secretary-v2`
    - `user` and `user-v2`
- **Problem**:
  - Causes codebase bloat, split logic, and confusion over canonical routes.
- **Proposed Solution (Non-breaking)**:
  - Establish `v2` as canonical views.
  - Convert duplicate route pages in legacy `secretary/` to route redirects or lightweight re-export wrappers forwarding to `secretary-v2/` views until legacy routes are officially decommissioned.

---

## 3. Best Practice "One File, One Job" Refactoring Checklist

| Layer | Refactoring Standard ("One File, One Job") |
| :--- | :--- |
| **Server Actions** | Max 1 action export per file (`<action-name>.action.ts`). |
| **Use Cases** | Max 1 use case class or function per file (`<use-case-name>.use-case.ts`). |
| **Repositories** | Separate read queries (`*.queries.ts`) from write mutations (`*.repository.ts`). |
| **DTOs** | 1 request DTO + 1 response DTO per domain action. |
| **React Views** | Max 250-300 lines. Delegate complex sub-layouts to `sub-components/`. |
| **React Hooks** | Split data-fetching hooks (`use-*-query.ts`) from mutation hooks (`use-*-mutations.ts`). |
| **Shared Utils** | Group by domain (`date.util.ts`, `string.util.ts`, `currency.util.ts`). |

---

## 4. Safe Refactoring Protocol (Zero Downtime / Zero Breaking Changes)

To ensure **no features or existing imports are broken**:

1. **Maintain Barrel Re-exports (`index.ts`)**:
   When extracting child components or helper functions from large files, leave re-exports in the original file location:
   ```typescript
   // original check-in-detail-pane.tsx remains importable as before:
   export { CheckInDetailPane } from './check-in/check-in-detail-pane-container';
   ```
2. **Preserve Interface Contracts**:
   Do not modify prop names, function signatures, or returned types during structural extraction.
3. **Automated & Visual Verification**:
   - Execute unit test suite (`pnpm test` / `vitest run`) after refactoring each module.
   - Run type checking (`pnpm exec tsc --noEmit`).

---

*End of Audit Document.*
