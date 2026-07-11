# Task: Authenticated Booking Submission Flow

**Scope:** User-facing booking wizard and the server-side pipeline for authenticated users. Covers nullable `doctor_id` (ANY/specific doctor), `timePreference` selection, and `PENDING` submission. Secretary-side confirmation is out of scope for this task.

**Architecture Constraints:**  
All code must strictly abide by the system design docs:
- [1-ARCHITECTURE.md](../../.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/1-ARCHITECTURE.md) — Modulith, facade pattern, one file per operation
- [1.5-CODING-PATTERNS.md](../../.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/1.5-CODING-PATTERNS.md) — Zod transform pipeline, functional CQRS, functional DI
- [2-NEXTJS.md](../../.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/2-NEXTJS.md) — Thin server actions, `'use server'` directive, Supabase SSR
- [3-CLEAN_CODE.md](../../.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/3-CLEAN_CODE.md) — Layer separation, write ops go through full chain
- [4-TESTING_GUIDELINES.md](../../.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/4-TESTING_GUIDELINES.md) — Co-located `.spec.ts`, Vitest, mocked DB
- [frontend/1-ARCHITECTURE.md](../../.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/1-ARCHITECTURE.md) — `'use client'` in hooks/views, RSC pages, no DB calls from client
- [frontend/2-REACT-COMPONENTS.md](../../.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/2-REACT-COMPONENTS.md) — Dumb components, no state/fetching inside component
- [frontend/3-REACT-HOOKS.md](../../.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/3-REACT-HOOKS.md) — Hook binding pattern, hooks must not import DB clients
- [frontend/4-CODING-PATTERNS.md](../../.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/4-CODING-PATTERNS.md) — camelCase everywhere, Zod+RHF form arch, `forwardRef` on primitives

---

## Business Logic Reference

From `revised-appointment-business-plan.md` §1.B (Auth Booking — "Relationship Path"):

1. User logs in
2. User selects **Service**
3. User selects **Doctor Preference:**
   - **"Any Available Doctor"** → `doctor_id = NULL`, `doctor_assignment_source = 'SYSTEM'`
   - **Specific Doctor** → `doctor_id = <UUID>`, `doctor_assignment_source = 'USER'`
4. **Date Calendar** renders based on doctor selection:
   - If "Any Doctor" → combined rosters of all doctors qualified for the service
   - If specific doctor → only dates where that doctor is rostered
5. User selects **Date** + **Time Preference** (Morning / Afternoon)
6. On submit → saves to `appointments` table as `status = 'PENDING'` with:
   - `doctor_id` = `NULL` or `<UUID>`
   - `doctor_assignment_source` = `'SYSTEM'` or `'USER'`
   - `start_time`, `end_time` = `NULL` (not assigned yet)
   - `time_preference` = `'MORNING'` or `'AFTERNOON'`

---

## 1. Database Migration

- [x] **Run migration — make `doctor_id` nullable on `appointments` table:**
  ```sql
  ALTER TABLE public.appointments ALTER COLUMN doctor_id DROP NOT NULL;
  ```
  - This is a non-breaking additive change
  - Existing rows with a doctor are unaffected
  - PENDING rows will now legally hold `doctor_id = NULL`

- [x] **Verify exclusion constraint `no_overlapping_appointments` still works:**
  - Constraint should only apply to non-`PENDING` / non-`RESCHEDULE_REQUESTED` states
  - `NULL` doctor_id rows in PENDING state must NOT trigger overlap errors

- [x] **Verify `doctor_assignment_source` column exists** with check constraint `('SYSTEM', 'USER')`
- [x] **Verify `time_preference` column exists** with check constraint `('MORNING', 'AFTERNOON')`
- [x] **Verify `start_time` and `end_time` are already nullable** — PENDING rows have no confirmed time yet

---

## 2. Backend: DTO, Use Case, Action

### 2.1 DTO — `submit-booking.dto.ts`
> File: `src/modules/appointments/dtos/booking/submit-booking.dto.ts`

- [x] **Update `doctorId` field to allow `null`:**
  ```ts
  // Before (wrong — requires UUID string):
  doctorId: z.string().uuid('Invalid Doctor ID format'),

  // After (correct — allows null for ANY doctor):
  doctorId: z.string().uuid('Invalid Doctor ID format').nullable().optional(),
  ```
- [x] **Verify `doctorAssignmentSource` defaults correctly:**
  ```ts
  doctorAssignmentSource: z.enum(['SYSTEM', 'USER']).optional().default('SYSTEM'),
  ```
- [x] **Verify `timePreference` is present and correctly typed:**
  ```ts
  timePreference: z.enum(['MORNING', 'AFTERNOON']),
  ```
  This is required for auth booking — user must select one.
- [x] **Verify `startTime` and `endTime` remain optional** — they are `NULL` at PENDING state, assigned later by secretary
- [x] **Update sibling spec `submit-booking.dto.spec.ts` to cover:**
  - Valid payload with `doctorId: null` (ANY doctor) → passes
  - Valid payload with specific UUID `doctorId` → passes
  - Missing `timePreference` → Zod error
  - Missing `serviceId` → Zod error
  - All dependent/patient type branches still pass

### 2.2 Use Case — `submit-booking.use-case.ts`
> File: `src/modules/appointments/use-cases/booking/submit-booking.use-case.ts`

- [x] **Verify use case does NOT validate slot availability** — this is a request-to-confirm flow. No hourly slot checking. Secretary handles final slot assignment.
- [x] **Verify use case builds DB payload with `doctor_id` as `null` when `ANY`:**
  ```ts
  doctor_id: data.doctorId ?? null,
  doctor_assignment_source: data.doctorAssignmentSource,
  time_preference: data.timePreference,
  start_time: null,  // Not assigned at PENDING
  end_time: null,    // Not assigned at PENDING
  status: 'PENDING',
  ```
- [x] **Verify use case is pure** — no Supabase imports, no HTTP objects, functional DI
- [x] **Verify `submit-booking.use-case.spec.ts` is updated:**
  - Mock `executeBookingTransaction`, assert correct payload when `doctorId = null`
  - Assert correct payload when `doctorId = 'some-uuid'`
  - Assert status is always `'PENDING'`

### 2.3 Server Action — `submit-booking.action.ts`
> File: `src/modules/appointments/actions/booking/submit-booking.action.ts`

- [x] **Verify action is thin** — parse → DI → use case → return
- [x] **Verify `'use server'` directive at line 1**
- [x] **Verify auth check: `getAuthenticatedUser()` called before any business logic**
- [x] **Verify `doctorId: null` flows through without being rejected** — action must accept `null` after schema update
- [x] **Verify action returns standardized response:** `{ success: true, data: { appointmentId } }` or `{ success: false, error: string }`
- [x] **Verify `submit-booking.action.spec.ts` is updated:**
  - Mock user auth, mock use case, submit with `doctorId: null` → `{ success: true }`
  - Submit with specific doctor UUID → `{ success: true }`
  - Unauthenticated → `{ success: false, error: 'Unauthorized' }`

---

## 3. Frontend: Booking Wizard

### 3.1 Payload Mapper — `submit-booking-payload.mapper.ts`
> File: `src/modules/appointments/hooks/booking/submit-booking-payload.mapper.ts`

- [x] **Update `PayloadMapperParams.resolvedDoctorId` to `string | null`:**
  ```ts
  interface PayloadMapperParams {
    // ...
    resolvedDoctorId: string | null; // null when 'ANY' is selected
  }
  ```
- [x] **Remove any fallback to `data.doctors[0]?.id`** — if ANY is selected, `resolvedDoctorId` must be `null`, never a fallback UUID
- [x] **Verify `doctorAssignmentSource` mapping:**
  ```ts
  doctorAssignmentSource: selectedDoctorId === 'ANY' ? 'SYSTEM' : 'USER',
  ```
- [x] **Update sibling spec `submit-booking-payload.mapper.spec.ts`:**
  - `selectedDoctorId = 'ANY'` → `doctorId: null`, `doctorAssignmentSource: 'SYSTEM'`
  - `selectedDoctorId = 'some-uuid'` → `doctorId: 'some-uuid'`, `doctorAssignmentSource: 'USER'`

### 3.2 Hook — `use-user-booking.ts`
> File: `src/modules/appointments/hooks/booking/use-user-booking.ts`

- [x] **Fix `resolvedDoctorId` logic — remove fallback to `data.doctors[0]?.id`:**
  ```ts
  // BEFORE (wrong — auto-assigns first doctor):
  resolvedDoctorId: state.selectedDoctorId === 'ANY'
    ? (data.doctors[0]?.id || '')
    : state.selectedDoctorId,

  // AFTER (correct — null when ANY):
  resolvedDoctorId: state.selectedDoctorId === 'ANY'
    ? null
    : state.selectedDoctorId,
  ```
- [x] **Fix reschedule path too** — same null-instead-of-fallback logic:
  ```ts
  // BEFORE:
  newDoctorId: state.selectedDoctorId === 'ANY' ? (data.doctors[0]?.id || '') : state.selectedDoctorId,

  // AFTER:
  newDoctorId: state.selectedDoctorId === 'ANY' ? null : state.selectedDoctorId,
  ```
- [x] **Verify `setTimePreference` is exposed from hook return** — user must be able to change preference in UI
- [x] **Verify hook does NOT import Supabase** — all writes go through server actions
- [x] **Update `use-user-booking.spec.ts`:**
  - Assert `resolvedDoctorId = null` when `selectedDoctorId = 'ANY'`
  - Assert `resolvedDoctorId = 'uuid'` when specific doctor picked
  - Assert `doctorAssignmentSource = 'SYSTEM'` when ANY, `'USER'` when specific

### 3.3 Step 2 — `date-time-step.tsx` (Doctor Preference + Date + Time Preference)
> File: `src/modules/appointments/components/booking/date-time-step.tsx`
> Abides by: Dumb Component Pattern (`2-REACT-COMPONENTS.md`)

- [x] **Verify Doctor Preference selector is rendered:**
  - Option 1: "Any Available Doctor"
  - Option 2+: List of doctors who can perform the selected service
- [x] **Verify selecting "Any Doctor" sets `selectedDoctorId = 'ANY'` in hook state**
- [x] **Verify date calendar adapts to doctor selection:**
  - "Any Doctor" selected → calendar queries combined rosters of all qualified doctors
  - Specific doctor selected → calendar queries only that doctor's rostered dates
- [x] **Verify Time Preference toggle is rendered and required:**
  - "Morning" / "Afternoon" toggle
  - Must be selected before "Next" is enabled
- [x] **Verify component is dumb** — all state in hook, component only receives props and fires callbacks

### 3.4 Step 4 — `review-step.tsx` / `review-appointment-details.tsx` (Review Screen)
> Files: `src/modules/appointments/components/booking/review-step.tsx`
> `src/modules/appointments/components/booking/sub-components/review-appointment-details.tsx`
> Abides by: Dumb Component Pattern

- [x] **Display doctor as "Any Available Doctor" when `selectedDoctorId === 'ANY'`** — do NOT show a specific doctor name when ANY was selected
  ```ts
  const doctorLabel = selectedDoctorId === 'ANY'
    ? 'Any Available Doctor (Secretary will assign)'
    : doctors.find(d => d.id === selectedDoctorId)
        ? `Dr. ${doctor.firstName} ${doctor.lastName}`
        : 'Unknown';
  ```
- [x] **Display `timePreference` clearly** — "Morning (09:00 AM – 12:00 PM)" or "Afternoon (01:00 PM – 05:00 PM)"
- [x] **Do NOT display `startTime` / `endTime`** — these are null at PENDING state; exact time is assigned by secretary

### 3.5 Booking Success View — `booking-success-view.tsx`
> File: `src/modules/appointments/components/booking/booking-success-view.tsx`

- [x] **Display "Any Available Doctor" when `selectedDoctorId === 'ANY'` or `doctors` array is empty:**
  ```ts
  const doctorName = selectedDoctorId === 'ANY' || !selectedDoc
    ? 'Any Available Doctor'
    : `Dr. ${selectedDoc.firstName} ${selectedDoc.lastName}`;
  ```
- [x] **Verify status badge shows "Pending Staff Review"** — not "Confirmed" ✅ (already correct)
- [x] **Verify "What happens next?" section explains secretary review** — already present ✅

---

## 4. Testing

- [x] **`submit-booking.dto.spec.ts`** — `doctorId: null` passes, `doctorId: uuid` passes, missing `timePreference` fails
- [x] **`submit-booking.use-case.spec.ts`** — null doctor payload → `status: 'PENDING'`, `doctor_id: null`
- [x] **`submit-booking.action.spec.ts`** — null doctor flows through, auth check fires, standardized response returned
- [x] **`submit-booking-payload.mapper.spec.ts`** — ANY → `null`/`SYSTEM`, specific → `uuid`/`USER`
- [x] **`use-user-booking.spec.ts`** — no fallback to `doctors[0]`, correct null mapping
- [x] **Full test suite:** `pnpm test` — all tests pass, no regressions

---

## Definition of Done

- Authenticated user can select service, pick doctor preference (Any or specific), select date from roster-filtered calendar, pick Morning/Afternoon, and submit
- Submission saves to `appointments` with `status = 'PENDING'`, nullable `doctor_id`, no `start_time`/`end_time`
- Review step shows "Any Available Doctor" when applicable
- Success screen shows correct doctor label and "Pending Staff Review" status
- All Vitest tests pass; `pnpm test` clean
- No `any` type leaks, camelCase enforced in all UI props, no snake_case in components, no DB client imports in client hooks
