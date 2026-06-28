# Task: Track Doctor Assignment Source

Track whether a doctor was specifically selected by the user (`USER`) or automatically assigned by the system (`SYSTEM`) during appointment creation.

## 1. Database RPC Updates
- [x] **Update `submit_booking_transaction` RPC**
  - Add parameter `p_doctor_assignment_source public.doctor_assignment_source DEFAULT 'SYSTEM'::public.doctor_assignment_source`
  - Pass parameter into the `INSERT INTO public.appointments` statement
- [x] **Update `create_manual_booking` RPC**
  - Add parameter `p_doctor_assignment_source public.doctor_assignment_source DEFAULT 'SYSTEM'::public.doctor_assignment_source`
  - Pass parameter into the `INSERT INTO public.appointments` statement
- [x] **Update `convert_inquiry_to_appointment` RPC**
  - Add parameter `p_doctor_assignment_source public.doctor_assignment_source DEFAULT 'SYSTEM'::public.doctor_assignment_source`
  - Pass parameter into the `INSERT INTO public.appointments` statement

## 2. Application Layer & DTO Updates
- [x] **Update `SubmitBookingDto`**
  - Path: [submit-booking.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/booking/submit-booking.dto.ts)
  - Add validation rule: `doctorAssignmentSource` as `z.enum(['SYSTEM', 'USER']).optional().default('SYSTEM')`
  - Update unit tests in [submit-booking.dto.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/booking/submit-booking.dto.spec.ts)
- [x] **Update `createBookingPayload` Mapper**
  - Path: [submit-booking-payload.mapper.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/hooks/booking/submit-booking-payload.mapper.ts)
  - Map `doctorAssignmentSource` based on slot/selection criteria:
    - If specific doctor selected (e.g. `selectedDoctorId` is NOT `'ANY'`), set to `USER`
    - If "Any Doctor" (`selectedDoctorId === 'ANY'`), set to `SYSTEM`
- [x] **Update Repository Commands**
  - [appointment-booking.commands.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/booking/appointment-booking.commands.ts): Pass `doctorAssignmentSource` (mapped to snake_case `p_doctor_assignment_source`) to `submit_booking_transaction`
  - [create-manual-booking.command.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/booking/create-manual-booking.command.ts): Pass `doctorAssignmentSource` (mapped to snake_case `p_doctor_assignment_source`) to `create_manual_booking`
  - [appointment-conversion.commands.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/booking/appointment-conversion.commands.ts): Pass `doctorAssignmentSource` (mapped to snake_case `p_doctor_assignment_source`) to `convert_inquiry_to_appointment`

## 3. Unit & Integration Testing
- [x] Add unit tests for use-cases, mappers, and repository commands verifying that the correct enum value is passed downstream:
  - Unit tests co-located next to implementation files (e.g., `*.spec.ts`)
  - Mock repository calls and assert arguments passed to Supabase RPCs

## 4. Refactor Reschedule Flow to be ACID

> Goal: replace 3 sequential non-atomic DB calls with one RPC that runs inside a single Postgres transaction block.
> Must comply with: 1-ARCHITECTURE (one-file-per-op, functional CQRS), 1.5-CODING-PATTERNS (functional DI), 3-CLEAN_CODE (write rule = full chain), 4-TESTING_GUIDELINES (co-located `.spec.ts`, mock repo in unit tests).

### 4.1 Database Layer — Migration

- [x] **Create migration file** `migrations/20260626110000_add_reschedule_transaction_rpc.sql`
  - Define `request_reschedule_transaction(p_appointment_id, p_actor_id, p_actor_role, p_reason, p_proposed_date, p_proposed_start_time, p_proposed_end_time, p_proposed_doctor_id)` as a single `plpgsql` function
  - Inside one transaction block, atomically:
    1. `UPDATE appointments SET status = 'RESCHEDULE_REQUESTED', reschedule_count = reschedule_count + 1, proposed_date, proposed_start_time, proposed_end_time, proposed_doctor_id, status_reason WHERE id = p_appointment_id`
    2. `INSERT INTO appointment_status_history` (ledger entry)
    3. Call `increment_credibility_metric(p_patient_id, 'reschedule_count')` (or inline the UPDATE on `user_credibility_metrics`)
  - Return the updated appointment row (or just `UUID`)
  - Use `SECURITY DEFINER` + `SET search_path = public` (matches existing RPC pattern)

### 4.2 Repository Layer — New Command File

- [x] **Create** [request-reschedule-transaction.command.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/status/request-reschedule-transaction.command.ts)
  - Follow functional CQRS pattern: `export const requestRescheduleTransactionCommand = (supabase: SupabaseClient) => async (...) => { ... }`
  - Call `supabase.rpc('request_reschedule_transaction', { ... })` with snake_case params
  - Throw `DomainError` on failure (matches existing error pattern)
  - Return `AppointmentDto` via `mapAppointmentRecord` (or at minimum `{ success: boolean }` — match what use-case needs)

- [x] **Create** [request-reschedule-transaction.command.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/status/request-reschedule-transaction.command.spec.ts) *(mandatory co-located test)*
  - Mock `supabase.rpc` with `vi.fn()`
  - Assert correct snake_case params passed to RPC
  - Assert `DomainError` thrown on RPC error

### 4.3 Repository Exports Barrel

- [x] **Update** [exports.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/status/exports.ts)
  - Added: `export * from './request-reschedule-transaction.command';`

### 4.4 Use-Case Layer — Refactor

- [x] **Refactor** [request-reschedule.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/status/request-reschedule.use-case.ts)
  - Removed deps: `updateStatus`, `insertLedgerEntry`, `incrementUserCredibilityMetric`
  - Added single dep: `requestRescheduleTransaction: (...) => Promise<AppointmentDto>`
  - Business validation logic kept intact (terminal state check, reschedule limit check)
  - Replaced the 3 sequential awaits with one `await deps.requestRescheduleTransaction(...)` call

- [x] **Create** [request-reschedule.use-case.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/status/request-reschedule.use-case.spec.ts) *(mandatory co-located test)*
  - Mocks only `requestRescheduleTransaction` (single dep now)
  - Covers: all 4 terminal states throw, reschedule limit throws, happy path, fetch failure short-circuit
  - Verifies `requestRescheduleTransaction` called with correct args

### 4.5 Action Layer — Wire New Command

- [x] **Update** [request-reschedule.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/status/request-reschedule.action.ts)
  - Removed injections of `updateStatusCommand`, `insertLedgerEntryCommand`, `incrementUserCredibilityMetricCommand`
  - Injected `requestRescheduleTransactionCommand(supabase)` instead
  - Follows 3-step action pattern: parse input → DI setup → call use-case

- [x] **Update** [request-reschedule.action.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/status/request-reschedule.action.spec.ts)
  - Mocks only the new single `requestRescheduleTransactionCommand` dep

> ✅ All 10 tests pass (3 files): repository command, use-case, action

---

## 5. Make Secretary Status Update ACID

> **Problem:** `updateAppointmentStatusAction` (used by the secretary for reschedule, cancel, approve, reject, no-show) executes 3 sequential non-atomic app-layer calls:
> 1. `updateStatusCommand` — UPDATE appointment row
> 2. `insertLedgerEntryCommand` — INSERT appointment_status_history
> 3. `incrementUserCredibilityMetricCommand` — UPDATE user_credibility_metrics (conditional)
>
> If step 2 or 3 fails after step 1 completes → partial write. Appointment mutated but no audit trail.
>
> **Goal:** Replace with a single Postgres `plpgsql` RPC that wraps all 3 writes in one transaction block. Same pattern as §4 (`request_reschedule_transaction`).
>
> Must comply with: `1-ARCHITECTURE` (one-file-per-op, functional CQRS), `1.5-CODING-PATTERNS` (functional DI, no `any`), `2-NEXTJS` (thin action, Zod validation), `3-CLEAN_CODE` (write rule = full chain), `4-TESTING_GUIDELINES` (co-located `.spec.ts`, mock repo in unit tests, 80/15/5 pyramid).

### 5.1 Database Layer — Migration

- [x] **Create migration file** `migrations/YYYYMMDDHHMMSS_add_update_appointment_status_transaction_rpc.sql`
  - Define `update_appointment_status_transaction(p_appointment_id, p_actor_id, p_actor_role, p_new_status, p_reason, p_reschedule_date, p_reschedule_start_time, p_reschedule_end_time, p_reschedule_doctor_id, p_clear_proposed_metadata, p_reschedule_count)` as a single `plpgsql` function
  - Inside one transaction block, atomically:
    1. Fetch current status + `patient_id` (existence check, raise if not found)
    2. `UPDATE public.appointments SET status, status_reason, date/start_time/end_time/doctor_id (if rescheduling), reschedule_count, clear proposed_* cols (if flag), updated_at WHERE id = p_appointment_id`
    3. `INSERT INTO public.appointment_status_history` ledger entry (only if status actually changed OR proposed metadata cleared)
    4. Conditionally call `public.increment_credibility_metric(p_patient_id, metric)` for `CANCELLED`, `NO_SHOW`, or rescheduling transitions
  - Return `SETOF public.appointments` (same pattern as `request_reschedule_transaction`)
  - Use `SECURITY DEFINER` + `SET search_path = public`

### 5.2 Repository Layer — New Command File

- [x] **Create** `src/modules/appointments/repositories/status/update-appointment-status-transaction.command.ts`
  - Functional CQRS pattern: `export const updateAppointmentStatusTransactionCommand = (supabase: SupabaseClient) => async (...): Promise<AppointmentDto> => { ... }`
  - Call `supabase.rpc('update_appointment_status_transaction', { ...snakeCaseParams })` 
  - Throw `DomainError` on RPC error (match existing pattern)
  - Return `AppointmentDto` via `mapAppointmentRecord(Array.isArray(data) ? data[0] : data)`
  - No `any` types — all params strictly typed

- [x] **Create** `src/modules/appointments/repositories/status/update-appointment-status-transaction.command.spec.ts` *(mandatory co-located test)*
  - Mock `supabase.rpc` with `vi.fn()`
  - Assert correct snake_case params passed to RPC
  - Assert `DomainError` thrown on RPC error response
  - Assert correct `AppointmentDto` returned on success

### 5.3 Repository Exports Barrel

- [x] **Update** `src/modules/appointments/repositories/status/exports.ts`
  - Add: `export * from './update-appointment-status-transaction.command';`

### 5.4 Use-Case Layer — Refactor

- [x] **Refactor** `src/modules/appointments/use-cases/status/update-appointment-status.use-case.ts`
  - Remove deps: `updateStatus`, `insertLedgerEntry`, `incrementUserCredibilityMetric`
  - Add single dep: `updateAppointmentStatusTransaction: (...) => Promise<AppointmentDto>`
  - Keep all business validation intact:
    - Terminal state guard (`CANCELLED`, `REJECTED`, `COMPLETED`, `NO_SHOW`)
    - Reschedule limit check (`rescheduleCount >= 1`)
    - "Hold and Swap" resolution logic (`RESCHEDULE_REQUESTED` → `APPROVED` swaps proposed→actual; `RESCHEDULE_REQUESTED` → `REJECTED` reverts to `APPROVED`)
  - Derive `clearProposedMetadata`, `finalStatus`, `finalRescheduleMetadata`, `nextRescheduleCount` as before
  - Replace 3 sequential awaits with one `await deps.updateAppointmentStatusTransaction(...)` call
  - No `any` types

- [x] **Update** `src/modules/appointments/use-cases/status/update-appointment-status.use-case.spec.ts` *(mandatory co-located test — update existing or create if absent)*
  - Mock only `updateAppointmentStatusTransaction` (single dep now)
  - Cover: terminal state throws, reschedule limit throws, Hold-and-Swap APPROVED path (proposed→actual), Hold-and-Swap REJECTED path (reverts to APPROVED), direct secretary reschedule (no prior request), cancel, no-show, happy path
  - Verify `updateAppointmentStatusTransaction` called with correct derived args

### 5.5 Action Layer — Wire New Command

- [x] **Update** `src/modules/appointments/actions/status/update-appointment-status.action.ts`
  - Remove injections of `updateStatusCommand`, `insertLedgerEntryCommand`, `incrementUserCredibilityMetricCommand`
  - Inject `updateAppointmentStatusTransactionCommand(supabase)` instead
  - Keep 3-step thin action pattern: parse → DI setup → call use-case
  - Keep `authorizeRole('SECRETARY')` guard
  - Keep `staffUpdateAppointmentStatusSchema.parse(formData)` Zod validation
  - No `any` types

- [x] **Update** `src/modules/appointments/actions/status/update-appointment-status.action.spec.ts`
  - Mock only the new single `updateAppointmentStatusTransactionCommand` dep
  - Cover: unauthorized role returns error, Zod validation failure, use-case DomainError, happy path

### 5.6 Verification

- [x] All existing tests still pass (`pnpm test`)
- [x] `pnpm build` — 0 TypeScript errors
- [ ] Manually test secretary: reschedule APPROVED appointment → confirm appointment row updated + history log entry created
- [ ] Manually test secretary: approve a `RESCHEDULE_REQUESTED` appointment → confirm proposed→actual swap + history log
- [ ] Manually test secretary: reject a `RESCHEDULE_REQUESTED` appointment → confirm reverts to `APPROVED` + history log
- [ ] Manually test secretary: cancel APPROVED appointment → confirm status `CANCELLED` + history log

