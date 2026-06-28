# Tasks: Secretary Check-In/Out Kanban Board Implementation

Implement the 5-column Kanban board at `/secretary/check-in` for managing daily patient visit flows, including real-time updates, invoicing, ledger writes, and status checks.

## Backend & Domain Layer (Modulith Architecture)

- `[x]` **DTOs & Validation Rules** (Dedicated schema per operation in aggregate subfolders)
  - `[x]` Create `CheckInDto` in [check-in.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/status/check-in.dto.ts) (validate `appointmentId`).
  - `[x]` Create `MarkNoShowDto` in [mark-no-show.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/status/mark-no-show.dto.ts) (validate `appointmentId`).
  - `[x]` Create `UndoCheckInDto` in [undo-check-in.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/status/undo-check-in.dto.ts) (validate `appointmentId`).
  - `[x]` Create `FinalizeInvoiceDto` in [finalize-invoice.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/billing/dtos/invoicing/finalize-invoice.dto.ts) (validate `invoiceId`, `paymentMethod`, optional `discountApplied`, optional `amount` override).

- `[x]` **Repository Layer (Supabase Queries & Commands)** (Functional queries/commands in resource subfolders)
  - `[x]` Implement query to fetch today's appointments (filter `appointment_date = today` only).
  - `[x]` Implement command to update appointment status with ledger writes.
  - `[x]` Implement `updateAppointmentStatusTransactionCommand` using admin client to bypass RLS.
  - `[x]` Implement invoice queries/commands to fetch draft and finalize status.

- `[x]` **Use Case Layer** (Dedicated use-case per operation)
  - `[x]` Create `checkInUseCase` in [check-in.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/status/check-in.use-case.ts) (updates status to `CHECKED_IN`, writes history log).
  - `[x]` Create `undoCheckInUseCase` in [undo-check-in.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/status/undo-check-in.use-case.ts) (reverts status to `APPROVED`, writes history log).
  - `[x]` Create `markNoShowUseCase` in [mark-no-show.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/status/mark-no-show.use-case.ts) (updates status to `NO_SHOW`, writes history log).
  - `[x]` Create `finalizeInvoiceUseCase` in [finalize-invoice.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/billing/use-cases/invoicing/finalize-invoice.use-case.ts) and orchestrate checkout via `checkoutOrchestrator` in [checkout.orchestrator.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/orchestrators/checkout.orchestrator.ts).

- `[x]` **Server Actions Layer** (Dedicated server action file per operation)
  - `[x]` Implement `checkInAction` in [check-in.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/status/check-in.action.ts).
  - `[x]` Implement `undoCheckInAction` in [undo-check-in.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/status/undo-check-in.action.ts).
  - `[x]` Implement `markNoShowAction` in [mark-no-show.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/status/mark-no-show.action.ts).
  - `[x]` Implement `checkoutAction` in [checkout.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/billing/actions/invoicing/checkout.action.ts) (triggers `checkoutOrchestrator` and uses Next.js `after` for async receipts).

## Frontend UI Components & Views

- `[x]` **Real-Time Kanban View**
  - `[x]` Setup Supabase realtime subscription stream for `appointments` and `invoices` table changes on today's date.
  - `[x]` Implement Column 1: **APPROVED**
    - `[x]` Render today's awaiting arrivals.
    - `[x]` Implement client-side time-gate logic for "Check In" button (`start_time - 30min` to `end_time`).
    - `[x]` Render "No-Show" button past slot end time.
    - `[x]` *Tested & Verified: Check-in button works and updates state in DB.*
  - `[x]` Implement Column 2: **NO-SHOW**
    - `[x]` Render today's missed slot appointments.
    - `[x]` Add "Reschedule" button pointing to reschedule modal (untested).
    - `[x]` *Tested & Verified: No-Show transition works and correctly flags missed appointments (reschedule action flow untested).*
  - `[x]` Implement Column 3: **CHECKED IN**
    - `[x]` Render ongoing appointments.
    - `[x]` Add confirmation modal for "Undo Check-In" action.
    - `[x]` *Tested & Verified: Undo Check-In (redo/revert) works and successfully returns card to Column 1.*
  - `[x]` Implement Column 4: **READY FOR CHECKOUT**
    - `[x]` Render appointments where status is `TREATMENT_RENDERED`.
    - `[x]` Add checkout slide-over/dialog to manage draft invoice review, discounts, overrides, and payment methods.
  - `[x]` Implement Column 5: **COMPLETED**
    - `[x]` Render read-only list of today's completed visits.
    - `[x]` Add "View" button opening visit log, invoice summary, and history logs.

- `[x]` **Frontend Enhancements**
  - `[x]` Display full time range (`startTime - endTime`) on cards instead of only start time.
  - `[x]` Investigate/Fix Checkout button in Column 4 (Ready Checkout) when `draftInvoice` is missing.

## Bug Fixes & Correctness

- `[x]` **Timezone-safe date handling**
  - `[x]` Extracted `getTodayLocalDateStr()` into `src/shared/utils/date.util.ts` — YYYY-MM-DD local string instead of UTC mismatch.
  - `[x]` Replaced raw `toLocaleTimeString()` calls with `formatClinicTime()` from shared util for consistent timezone display.
- `[x]` **Check-in time gate timezone and SSR/hydration fixes**
  - `[x]` Created `toNaiveUtc(d)` helper so time comparisons use the same timezone offset.
  - `[x]` Solved SSR/hydration mismatch by initializing time as `null` and populating client-side only via `useEffect`.
- `[x]` **Rogue timer removal**
  - `[x]` Deleted secondary duplicate `setInterval` that was corrupting naive-UTC comparisons.

- `[x]` **Option B: Atomic Checkout Transaction (Postgres RPC)**
  - `[x]` Create `complete_checkout_transaction` PostgreSQL RPC function (finalizes invoice, completes appointment, logs status history, writes audit logs atomically).
  - `[x]` Implement repository command `completeCheckoutCommand` invoking the RPC.
  - `[x]` Refactor `checkoutOrchestrator` to call `completeCheckoutCommand` instead of individual operations.



## Quality Assurance & Testing (80/15/5 Pyramid)

- `[x]` **Unit Tests (Vitest)** (Co-located `*.spec.ts` files next to source files)
  - `[x]` Write tests for DTO validation (`check-in.dto.spec.ts`, `undo-check-in.dto.spec.ts`, `mark-no-show.dto.spec.ts`).
  - `[x]` Write tests for use-cases (`check-in.use-case.spec.ts`, `undo-check-in.use-case.spec.ts`, `mark-no-show.use-case.spec.ts`) mocking repositories.
  - `[x]` Write tests for server actions (`check-in.action.spec.ts`, `undo-check-in.action.spec.ts`, `mark-no-show.action.spec.ts`).
  - `[x]` Fix stale test mocks across booking specs missing `doctorAssignmentSource` field (TS2345/TS2741).

- `[ ]` **E2E & Integration Tests (Playwright)** (Located in root `e2e/` folder)
  - `[ ]` Implement E2E test verifying state transition flow: Col 1 -> Col 3 -> Col 4 -> Col 5.
  - `[ ]` Test real-time subscription update by simulating doctor committing notes.
  - `[ ]` Test checkout pricing validations and discount limits.

## ACID Atomicity Hardening

> **Problem**: All status use-cases (check-in, no-show, undo-check-in) do a separate `getAppointmentById` SELECT in app-layer JS, validate status in JS, then call the RPC. Between the SELECT and the RPC call, a concurrent request can mutate the row — causing two simultaneous check-ins on the same appointment to both succeed. The Postgres RPCs did NOT re-validate `current_status` before updating, so the DB offered no protection against this race.
>
> **Fix**: Add `expected_status` guards inside both RPCs. The UPDATE uses `WHERE id = p_appointment_id AND status = p_expected_status`. If the row was already mutated, zero rows update → explicit RAISE EXCEPTION. Fully atomic within the DB transaction. No new round-trips needed.

### `update_appointment_status_transaction` RPC

- `[x]` Add `p_expected_status public.appointment_status DEFAULT NULL` parameter.
- `[x]` Add guard: `IF p_expected_status IS NOT NULL AND v_previous_status <> p_expected_status THEN RAISE EXCEPTION ... END IF;` after the initial SELECT.
- `[x]` Create migration [20260628020000_add_status_guard_to_appointment_rpc.sql](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/migrations/20260628020000_add_status_guard_to_appointment_rpc.sql).

### `complete_checkout_transaction` RPC

- `[x]` Add guard: appointment must be `TREATMENT_RENDERED` before checkout completes — `IF v_previous_status <> 'TREATMENT_RENDERED' THEN RAISE EXCEPTION ... END IF;` after fetching appointment status.
- `[x]` Create migration [20260628030000_add_status_guard_to_checkout_rpc.sql](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/migrations/20260628030000_add_status_guard_to_checkout_rpc.sql).

### App-Layer (TypeScript)

- `[x]` Pass `p_expected_status` from each use-case into `updateAppointmentStatusTransactionCommand` for check-in (`APPROVED`), no-show (`APPROVED`), undo-check-in (`CHECKED_IN`).
- `[x]` Update `updateAppointmentStatusTransactionCommand` signature to accept optional `expectedStatus`.
- `[x]` Update use-cases to pass expected status down.
