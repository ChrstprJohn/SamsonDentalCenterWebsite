# Secretary V2 Architecture, "One File, One Job" Refactoring & Folder Structure Blueprint

> **Scope**: Comprehensive Audit & Execution Blueprint for **Frontend & Backend** in Secretary V2 (`src/app/(portals)/secretary-v2/`, `src/modules/staff/views/secretary/`, `src/modules/staff/hooks/secretary/`, and invoked Backend Actions/Repositories/Utilities).
> **Goal**: Detail file-by-file recommendations for every multi-responsibility file, map exact proposed folder structures, and guarantee zero breaking changes via backward-compatible re-exports.

---

## 1. Executive Summary & Architectural Principles

To transform Secretary V2 into an easily maintainable, enterprise-grade architecture:
1. **"One File, One Job" Rule**:
   - **Views**: Main view files must only orchestrate layout (<150 lines). Sub-views and dialogs live in sub-components.
   - **Server Actions**: Max 1 action per file (`<action-name>.action.ts`).
   - **Repositories**: Separate SQL queries (`*.queries.ts`) from mutations (`*.commands.ts` or `*.repository.ts`) and DTO mapping (`*.mapper.ts`).
   - **Hooks**: Separate data-fetching queries (`use-*-query.ts`) from state mutations (`use-*-mutations.ts`).
2. **Zero Breaking Changes Safeguard**:
   - Use barrel re-exports (`export * from './new-path'`) in original file locations so existing imports across the project never break.
   - Retain exact prop interfaces and API parameters.

---

## 2. File-by-File Refactoring Blueprint & Folder Structure

Below is the concrete recommendation matrix mapping every non-compliant file to its exact new single-purpose file breakdown.

---

### A. Frontend Views & Sub-Components

#### 1. `src/modules/staff/views/secretary/sub-components/check-in-detail-pane.tsx`
- **Current Size**: **1,408 lines**
- **Current Multiple Jobs**:
  1. Patient contact badge & info header
  2. Identity verification toggle logic & badges
  3. Check-in/Checkout status action buttons
  4. Invoice & payment status summary
  5. Status history timeline pagination
  6. Reschedule drawer form state
  7. Multi-step confirmation dialogs
- **Recommended New Folder Structure**:
  Create directory `src/modules/staff/views/secretary/sub-components/check-in/`:
  - `check-in-patient-header.tsx` (~120 lines): Patient avatar, contact info, & tags.
  - `check-in-verification-card.tsx` (~100 lines): ID verification status & toggle.
  - `check-in-billing-summary.tsx` (~150 lines): Payment badge & invoice link CTA.
  - `check-in-action-bar.tsx` (~150 lines): Check-in, Checkout, & Undo buttons.
  - `check-in-timeline.tsx` (~150 lines): Status history timeline feed.
  - `check-in-reschedule-drawer.tsx` (~180 lines): Reschedule request form drawer.
  - `check-in-detail-pane.tsx` (~120 lines): **Clean orchestrator container**, imports child components and re-exports same interface.

---

#### 2. `src/modules/staff/views/secretary/secretary-chat-inbox-view.tsx`
- **Current Size**: **1,135 lines**
- **Current Multiple Jobs**:
  1. Chat conversation search & filter state
  2. Message stream viewport & auto-scroll bottom anchoring
  3. Message composition textarea, attachments, & quick replies
  4. Real-time polling & WebSocket subscription lifecycle
  5. Patient detail context sidebar & appointment drawer toggle
  6. Inline reschedule request modal
- **Recommended New Folder Structure**:
  Create directory `src/modules/staff/views/secretary/sub-components/chat/`:
  - `use-chat-inbox-view-state.ts` (~120 lines): Manages selected thread, filter tab, search query, and real-time listeners.
  - `chat-inbox-sidebar.tsx` (~200 lines): Thread list, search input, unread filters.
  - `chat-thread-viewport.tsx` (~250 lines): Message feed, timestamps, auto-scroll.
  - `chat-input-toolbar.tsx` (~150 lines): Composition area, attachment button, quick response templates.
  - `chat-patient-context-drawer.tsx` (~180 lines): Right-side patient metadata & appointment drawer toggle.
  - `secretary-chat-inbox-view.tsx` (~140 lines): Orchestrator view assembling sidebar, thread viewport, and context drawer.

---

#### 3. `src/modules/staff/views/secretary/secretary-book-appointment-view.tsx`
- **Current Size**: **861 lines**
- **Current Multiple Jobs**:
  1. Wizard Step 1: Patient lookup & guest patient creation
  2. Wizard Step 2: Doctor schedule lookup & slot generation calculation
  3. Wizard Step 3: Booking summary & confirmation modal
- **Recommended New Folder Structure**:
  Create directory `src/modules/staff/views/secretary/sub-components/booking-wizard/`:
  - `step-patient-selection.tsx` (~200 lines): Patient search bar & guest creation form.
  - `step-doctor-schedule-picker.tsx` (~250 lines): Doctor grid, date picker, slot grid.
  - `step-appointment-summary.tsx` (~150 lines): Booking confirmation summary card.
  - `secretary-book-appointment-view.tsx` (~120 lines): Step stepper manager view.

---

#### 4. `src/modules/staff/views/secretary/secretary-pending-requests-view-v2.tsx`
- **Current Size**: **701 lines**
- **Current Multiple Jobs**:
  1. Queue request table/cards rendering
  2. Quick inline approval & rejection actions
  3. Search & status filter toolbar
  4. Request detail drawer
- **Recommended New Folder Structure**:
  Create directory `src/modules/staff/views/secretary/sub-components/pending/`:
  - `pending-requests-toolbar.tsx` (~150 lines): Search bar & filter pills.
  - `pending-requests-table.tsx` (~200 lines): Request table & row action buttons.
  - `pending-request-drawer.tsx` (~180 lines): Side drawer for full request details.
  - `secretary-pending-requests-view-v2.tsx` (~120 lines): Main view container.

---

#### 5. `src/modules/staff/views/secretary/appointment-email-timeline-view.tsx` (613 lines) & `secretary-past-appointment-follow-ups-view.tsx` (535 lines)
- **Current Size**: **613 & 535 lines**
- **Current Multiple Jobs**:
  1. Raw HTML iframe preview parsing
  2. Timeline feed cards
  3. Status filter state
  4. Follow-up notes dialog
- **Recommended New Folder Structure**:
  - `src/modules/staff/utils/email-timeline.util.ts`: HTML sanitizer & log parser.
  - `src/modules/staff/views/secretary/sub-components/email-preview-modal.tsx`: Standalone preview modal.
  - `src/modules/staff/views/secretary/sub-components/follow-up-notes-modal.tsx`: Standalone follow-up note dialog.

---

### B. Custom Hooks (Secretary V2 Domain)

| File Path | Current Lines | Violating Responsibilities | Recommended Split Files |
| :--- | :--- | :--- | :--- |
| `src/modules/staff/hooks/secretary/use-secretary-inquiries-queue.ts` | **469** | Combines queue fetching, search debounce, pagination, inquiry conversion mutation, & drop mutation. | • `use-inquiries-query.ts` (data fetching + pagination)<br>• `use-inquiries-mutations.ts` (convert & drop actions) |
| `src/modules/staff/hooks/secretary/use-secretary-appointments.ts` | **407** | Combines appointment list fetching, filter state, real-time subscription, & status mutation actions. | • `use-secretary-appointments-query.ts` (fetch + real-time)<br>• `use-secretary-status-mutations.ts` (status actions) |
| `src/modules/staff/hooks/secretary/use-secretary-check-in-out-tracker.ts` | **361** | Combines live wait-time timer counter, status transition handlers, & table state. | • `use-wait-time-counter.ts` (live timer)<br>• `use-check-in-tracker-state.ts` (table state) |
| `src/modules/staff/hooks/secretary/use-secretary-book-appointment.ts` | **322** | Manages patient selection, doctor schedule lookup, time slot fetching, & booking submission mutation. | • `use-booking-wizard-state.ts` (wizard step state)<br>• `use-booking-submit.ts` (submit mutation) |

---

### C. Backend Layer (Actions, Repositories & Utilities)

#### 1. `src/modules/appointments/actions/status/resend-notification.action.ts` (217 lines)
- **Current Problem**: Mixes notification payload construction, email dispatch calls, SMS dispatch calls, outbox log creation, and retry logic.
- **Recommended Split**:
  - `src/modules/appointments/utils/notification-payload.builder.ts`: Constructs email & SMS template payloads.
  - `src/modules/notifications/services/outbox-logger.service.ts`: Writes outbox record.
  - `resend-notification.action.ts`: Pure <50 line action handler delegating to services.

#### 2. `src/modules/appointments/repositories/chat/chat.queries.ts` (306 lines)
- **Current Problem**: Combines multi-table JOIN SQL queries, unread message counters, thread metadata formatters, and message payload transformers.
- **Recommended Split**:
  - `chat-thread.queries.ts`: Conversation list & unread count queries.
  - `chat-message.queries.ts`: Message stream queries & pagination.
  - `chat-dto.mapper.ts`: Database row to UI DTO transformations.

#### 3. `src/shared/database/database.types.ts` (813 lines)
- **Current Problem**: Monolithic auto-generated DB type definition.
- **Recommended Split**:
  - Create directory `src/shared/database/types/`:
    - `appointments.types.ts`
    - `patients.types.ts`
    - `staff.types.ts`
    - `billing.types.ts`
  - Re-export all types in `database.types.ts` (`export * from './types/appointments.types'`) so zero imports break.

#### 4. `src/shared/auth/auth.util.ts` (90 lines)
- **Current Problem**: Bundles session parsing, RBAC permission checking, cookie handling, and portal redirects.
- **Recommended Split**:
  - `src/shared/auth/session.util.ts`: Cookie & session parsing.
  - `src/shared/auth/permissions.util.ts`: RBAC permission checking.

---

### D. App Router Page Layer (`src/app/(portals)/secretary-v2/`)

- **Anomalous Inline Pages**:
  - `src/app/(portals)/secretary-v2/doctors/page.tsx` (**141 lines**): Contains full doctor table JSX inline.
  - `src/app/(portals)/secretary-v2/schedules/page.tsx` (**120 lines**): Contains full schedule tab management JSX inline.
- **Recommended Recommendation**:
  - Extract view components into `src/modules/staff/views/secretary/`:
    - `secretary-doctors-view.tsx`
    - `secretary-schedules-view.tsx`
  - Simplify both App Router `page.tsx` files to clean 6-line wrappers:
    ```tsx
    import { SecretaryDoctorsView } from '@/modules/staff/views/secretary/secretary-doctors-view';
    export default function Page() {
      return <SecretaryDoctorsView />;
    }
    ```

---

## 3. Complete Proposed Target Directory Tree

```
src/
├── app/(portals)/secretary-v2/
│   ├── appointments/page.tsx          # Clean wrapper (<10 lines)
│   ├── chat/page.tsx                  # Clean wrapper (<10 lines)
│   ├── check-in/page.tsx               # Clean wrapper (<10 lines)
│   ├── doctors/page.tsx               # Clean wrapper (<10 lines)
│   ├── pending/page.tsx               # Clean wrapper (<10 lines)
│   └── schedules/page.tsx             # Clean wrapper (<10 lines)
│
├── modules/
│   ├── appointments/
│   │   ├── actions/status/
│   │   │   └── resend-notification.action.ts  # Lightweight action (<50 lines)
│   │   ├── repositories/chat/
│   │   │   ├── chat-dto.mapper.ts             # [NEW] DTO mapper
│   │   │   ├── chat-message.queries.ts        # [NEW] Message queries
│   │   │   └── chat-thread.queries.ts         # [NEW] Thread queries
│   │   └── utils/
│   │       └── notification-payload.builder.ts# [NEW] Payload builder
│   │
│   └── staff/
│       ├── hooks/secretary/
│       │   ├── use-booking-submit.ts          # [NEW] Submit mutation
│       │   ├── use-booking-wizard-state.ts    # [NEW] Step state
│       │   ├── use-inquiries-mutations.ts     # [NEW] Inquiry mutations
│       │   ├── use-inquiries-query.ts         # [NEW] Inquiry queries
│       │   ├── use-secretary-appointments-query.ts # [NEW] Appointment queries
│       │   ├── use-secretary-status-mutations.ts    # [NEW] Status mutations
│       │   └── use-wait-time-counter.ts       # [NEW] Live timer hook
│       │
│       └── views/secretary/
│           ├── sub-components/
│           │   ├── check-in/
│           │   │   ├── check-in-action-bar.tsx       # [NEW] Action buttons
│           │   │   ├── check-in-billing-summary.tsx  # [NEW] Payment & invoice
│           │   │   ├── check-in-detail-pane.tsx     # Container (<120 lines)
│           │   │   ├── check-in-patient-header.tsx   # [NEW] Patient header
│           │   │   ├── check-in-reschedule-drawer.tsx# [NEW] Reschedule drawer
│           │   │   ├── check-in-timeline.tsx         # [NEW] History timeline
│           │   │   └── check-in-verification-card.tsx# [NEW] ID verification
│           │   │
│           │   ├── chat/
│           │   │   ├── chat-inbox-sidebar.tsx        # [NEW] Thread sidebar
│           │   │   ├── chat-input-toolbar.tsx        # [NEW] Textarea & quick replies
│           │   │   ├── chat-patient-context-drawer.tsx# [NEW] Patient drawer
│           │   │   ├── chat-thread-viewport.tsx      # [NEW] Message feed
│           │   │   └── use-chat-inbox-view-state.ts  # [NEW] Real-time hook
│           │   │
│           │   ├── booking-wizard/
│           │   │   ├── step-appointment-summary.tsx  # [NEW] Step 3
│           │   │   ├── step-doctor-schedule-picker.tsx# [NEW] Step 2
│           │   │   └── step-patient-selection.tsx    # [NEW] Step 1
│           │   │
│           │   └── pending/
│           │       ├── pending-request-drawer.tsx    # [NEW] Request drawer
│           │       ├── pending-requests-table.tsx    # [NEW] Table view
│           │       └── pending-requests-toolbar.tsx  # [NEW] Search & filters
│           │
│           ├── secretary-book-appointment-view.tsx   # Step manager (<120 lines)
│           ├── secretary-chat-inbox-view.tsx          # Orchestrator view (<140 lines)
│           ├── secretary-doctors-view.tsx             # [NEW] Extracted view
│           ├── secretary-pending-requests-view-v2.tsx # Orchestrator view (<120 lines)
│           └── secretary-schedules-view.tsx           # [NEW] Extracted view
│
└── shared/
    ├── auth/
    │   ├── permissions.util.ts         # [NEW] RBAC checks
    │   └── session.util.ts             # [NEW] Session parsing
    └── database/
        ├── database.types.ts           # Re-exports all types (0 broken imports)
        └── types/
            ├── appointments.types.ts   # [NEW] Appointment table types
            ├── billing.types.ts        # [NEW] Billing table types
            ├── patients.types.ts       # [NEW] Patient table types
            └── staff.types.ts          # [NEW] Staff table types
```

---

## 4. Implementation Protocol (Zero Breaking Changes)

To execute this blueprint safely without breaking active features or styling rules:
1. **Barrel Re-export Verification**:
   Leave a barrel re-export in every original file path:
   ```typescript
   // e.g. check-in-detail-pane.tsx
   export { CheckInDetailPaneContainer as CheckInDetailPane } from './check-in/check-in-detail-pane';
   ```
2. **Strict Component Contract Preservation**:
   Prop names, callback signatures, and return values remain identical.
3. **Respect Styling Rules (AGENTS.md)**:
   Ensure `AppointmentDetailPane` & `SharedAppointmentDetail` preserve `compact={true}` (`bg-sidebar`) vs `compact={false}` (`bg-card`) container background rules.
4. **Automated Verification**:
   Execute `pnpm test` and `pnpm exec tsc --noEmit` after refactoring each component cluster.

---

*End of Refactoring & Folder Structure Blueprint.*
