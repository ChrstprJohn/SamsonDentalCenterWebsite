# Tasks: Secretary Check-In/Out Kanban Board Implementation

Implement the 5-column Kanban board at `/secretary/check-in` for managing daily patient visit flows, including real-time updates, invoicing, ledger writes, and status checks.

## Backend & Domain Layer (Modulith Architecture)

- `[x]` **DTOs & Validation Rules** (Satisfied by generic DTOs: `StaffUpdateAppointmentStatusDto`, `FinalizeInvoiceDto`)
  - `[x]` Create `CheckInDto` (validate `appointment_id`, `actor_role = 'secretary'`).
  - `[x]` Create `NoShowDto` (validate `appointment_id`, `actor_role = 'secretary'`).
  - `[x]` Create `UndoCheckInDto` (validate `appointment_id`, `actor_role = 'secretary'`).
  - `[x]` Create `CheckoutInvoiceDto` (validate `appointment_id`, flat override, discount %, payment method).

- `[x]` **Repository Layer (Supabase Queries / Commands)** (Satisfied by existing repositories)
  - `[x]` Implement query to fetch today's appointments (filter `appointment_date = today` only).
  - `[x]` Implement query/command to update appointment status.
  - `[x]` Implement query/command to write to `appointment_status_history` using admin client (bypassing RLS).
  - `[x]` Implement invoice queries (fetch draft, finalize status).

- `[x]` **Use Case Layer** (Satisfied by existing use cases)
  - `[x]` Create `CheckInUseCase` (updates status, inserts ledger log).
  - `[x]` Create `UndoCheckInUseCase` (reverts status, inserts ledger log).
  - `[x]` Create `MarkNoShowUseCase` (updates status, inserts ledger log).
  - `[x]` Create `CheckoutInvoiceUseCase` (orchestrates completing appointment, finalizing invoice, writing history).

- `[x]` **Server Actions Layer** (Satisfied by existing server actions: `updateAppointmentStatusAction`, `checkoutAction`)
  - `[x]` Implement `checkInAction` (revalidate path `/secretary/check-in`).
  - `[x]` Implement `undoCheckInAction` (revalidate path `/secretary/check-in`).
  - `[x]` Implement `markNoShowAction` (revalidate path `/secretary/check-in`).
  - `[x]` Implement `checkoutInvoiceAction` (revalidate path `/secretary/check-in`).

## Frontend UI Components & Views

- `[x]` **Real-Time Kanban View**
  - `[x]` Setup Supabase realtime subscription stream for `appointments` and `invoices` table changes on today's date.
  - `[x]` Implement Column 1: **APPROVED**
    - `[x]` Render today's awaiting arrivals.
    - `[x]` Implement client-side time-gate logic for "Check In" button (`start_time - 30min` to `end_time`).
    - `[x]` Render "No-Show" button past slot end time.
  - `[x]` Implement Column 2: **NO-SHOW**
    - `[x]` Render today's missed slot appointments.
    - `[x]` Add "Reschedule" button pointing to reschedule modal.
  - `[x]` Implement Column 3: **CHECKED IN**
    - `[x]` Render ongoing appointments.
    - `[x]` Add confirmation modal for "Undo Check-In" action.
  - `[x]` Implement Column 4: **READY FOR CHECKOUT**
    - `[x]` Render appointments where status is `TREATMENT_RENDERED`.
    - `[x]` Add checkout slide-over/dialog to manage draft invoice review, discounts, overrides, and payment methods.
  - `[x]` Implement Column 5: **COMPLETED**
    - `[x]` Render read-only list of today's completed visits.
    - `[x]` Add "View" button opening visit log, invoice summary, and history logs.

## Bug Fixes & Correctness

- `[x]` **Timezone-safe date handling**
  - `[x]` Extracted `getTodayLocalDateStr()` into `src/shared/utils/date.util.ts` — replaces `new Date().toISOString().split('T')[0]` (UTC) with a local-timezone-safe YYYY-MM-DD string. Prevents wrong-day fetches for UTC+8 users between 00:00–08:00 local time.
  - `[x]` Replaced raw `toLocaleTimeString()` calls in kanban cards with `formatClinicTime()` from shared util so all pages display times consistently in UTC (matching how `start_time` is stored as `TIMESTAMPTZ`).

- `[x]` **Check-in time gate wrong timezone comparison (reported by Christopher Picardo)**
  - `[x]` Root cause: `start_time` stored as naive-UTC (e.g. `09:00:00Z` = "9 AM clinic local", not real UTC). `new Date()` returns real UTC epoch — 8hr offset caused "Too early" all morning for UTC+8 users.
  - `[x]` Fix: `toNaiveUtc(d)` helper — takes local clock components, builds a `Date.UTC(...)` so both sides of the comparison are in the same naive-UTC space. Applied in `page.tsx` (`getCheckInStatus`).
  - `[x]` Fix: SSR/hydration mismatch — server TZ ≠ browser TZ caused gate to flash "Slot expired → Too early" on reload. Changed `currentTime` to init as `null`, set client-side only in `useEffect` with a 60s tick interval. Added `null` guard in `getCheckInStatus` and `isPastEnd`.

- `[x]` **Duplicate rogue timer overwriting naive-UTC currentTime (reported by Christopher Picardo)**
  - `[x]` Root cause: second `useEffect` had `setInterval(() => setCurrentTime(new Date()), 10000)` — raw `Date` with no `toNaiveUtc`. Fired every 10s and overwrote the correctly offset `currentTime` set by the first `useEffect`, reverting the gate back to real-UTC space → "Too early" persisted all morning for UTC+8.
  - `[x]` Fix: Removed rogue `setInterval` from second `useEffect`. First `useEffect` already owns the 60s tick with `toNaiveUtc`. `currentTime` now stays in naive-UTC space permanently.

## Quality Assurance & Testing (80/15/5 Pyramid)

- `[x]` **Unit Tests (Vitest)**
  - `[x]` Write tests for DTO validation (`check-in.dto.spec.ts`, `undo-check-in.dto.spec.ts`, `mark-no-show.dto.spec.ts`).
  - `[x]` Write tests for use-cases (`CheckInUseCase`, `UndoCheckInUseCase`, `MarkNoShowUseCase`) mocking repository layers.
  - `[x]` Write tests for server actions (`check-in.action.spec.ts`, `undo-check-in.action.spec.ts`, `mark-no-show.action.spec.ts`).
  - `[x]` Fix stale test mocks across booking specs missing `doctorAssignmentSource` field (TS2345/TS2741).

- `[ ]` **E2E & Integration Tests (Playwright)**
  - `[ ]` Implement test verifying state transition flow: Col 1 -> Col 3 -> Col 4 -> Col 5.
  - `[ ]` Test real-time subscription update by simulating doctor committing notes.
  - `[ ]` Test checkout pricing validations and discount limits.
