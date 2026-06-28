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

---

## Dynamic Line-Item Checkout (Invoicing Upgrade)

> **Feature**: Upgrade the Checkout & Invoicing panel from a single price-override input to a full **dynamic line-item builder** that allows the secretary to append additional services/retail items on top of the doctor's initial draft. This reflects real-world clinic workflows where patients add retail purchases or the doctor verbally requests materials to be billed at the front desk.
>
> **Reference**: [7-CHECK-IN-OUT.md — Column 4 Checkout & Invoicing Panel](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/1-BUSSINESS-PLAN/5-SECRETARY-PORTAL/7-CHECK-IN-OUT.md)

### Database Schema

- `[x]` Verify `invoice_items` table exists with columns: `id`, `invoice_id` (FK → `invoices`), `service_id` (FK → `services`, nullable for free-text items), `description`, `unit_price`, `quantity`, `source` (`DOCTOR_BASELINE` | `SECRETARY_ADDITION`), `created_at`.
- `[x]` Ensure `invoices` table `total_amount` is recomputed or overridden at finalization time (not stored live during editing — computed from line items + discount at checkout RPC).
- `[x]` Write migration to add `source` enum column to `invoice_items` if not already present.

### Backend & Domain Layer

- `[x]` **DTOs**: Extend `FinalizeInvoiceDto` in [finalize-invoice.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/billing/dtos/invoicing/finalize-invoice.dto.ts):
  - Add `additionalItems: { serviceId?: string; description: string; unitPrice: number; quantity: number }[]` (optional, defaults to `[]`).
  - Add `discountPercent?: number` (0–100) alongside or replacing flat `discountApplied`.
- `[x]` **Repository**: Implement `getServiceCatalogQuery(supabase)` — fetches all active services from `services` table for the dropdown search (id, name, price).
- `[x]` **Repository**: Update `completeCheckoutCommand` / `complete_checkout_transaction` RPC to accept an array of additional line items and insert them into `invoice_items` before finalizing.
- `[x]` **Use Case**: Update `finalizeInvoiceUseCase` to pass `additionalItems` from DTO through to the command.
- `[x]` **Use Case**: Compute final `totalAmount = sum(baselineItems) + sum(additionalItems) - discount` inside the use-case or RPC before writing.

### Checkout RPC Changes

- `[x]` Update `complete_checkout_transaction` PG function to accept `p_additional_items JSONB DEFAULT '[]'`.
- `[x]` Inside RPC: loop over `p_additional_items`, insert each as a row in `invoice_items` with `source = 'SECRETARY_ADDITION'`.
- `[x]` Recompute `total_amount` inside the RPC from all `invoice_items` rows (baseline + additions) minus discount before setting `invoices.status = FINALIZED`.
- `[x]` Create migration for the updated `complete_checkout_transaction` function signature.

### Frontend UI — Checkout Panel Upgrade

- `[x]` **Service Catalog Fetch**: On panel open, fetch available services from `services` table (via server action or query). Cache result for the session.
- `[x]` **Line Items Display**: Replace the single price input with a dynamic list:
  - Render doctor-prescribed service from the appointment/invoice as a structured billing row, visually labelled "Doctor Prescribed".
  - Service name + doctor subtext on the left, price on the right — read-only baseline row.
  - Removed flat price-override field; amount is now pulled from the invoice record directly.
- `[x]` **Add Item UI** (future phase):
  - Searchable dropdown (combobox) bound to the services catalog.
  - Auto-fills unit price from catalog on selection.
  - `+ Add Item` button appends item to local line-items array.
  - Quantity input (default 1) per added item.
- `[x]` **Totals Computation** (client-side live preview):
  - `subtotal = sum(all line items × quantity)`
  - `discount = subtotal × (discountPercent / 100)`
  - `totalDue = subtotal - discount`
  - Display live-updating `💰 TOTAL DUE` as items are added or removed.
- `[x]` **Adjustments Row**: Discount percentage input (0–100). Remove the flat price-override field.
- `[x]` **Submit**: Pass all line items (baseline ids + new additions array) and `discountPercent` into `FinalizeInvoiceDto` when calling `checkoutAction`.
- `[x]` Handle loading and error states on the panel (spinner on submit, toast on failure).

### Quality Assurance

- `[x]` **Unit Tests**: Write tests for updated `finalizeInvoiceUseCase` verifying:
  - Baseline items preserved, additional items appended.
  - Total correctly computed with and without discount.
  - Rejects if `discountPercent` out of 0–100 range.
- `[x]` **Unit Tests**: Write tests for updated RPC command mock verifying additional items payload is passed through.
- `[x]` **E2E (Playwright)**: Add a checkout flow test that adds one extra service line item, verifies total updates, and confirms checkout completes with the correct `invoice_items` count in DB.
