# Task: Guest Inquiry Submission Flow (Unauthenticated)

**Scope:** User-facing landing page form and the server-side pipeline that saves the guest inquiry as `status = 'NEW'` with no doctor assignment. Secretary-side confirmation is out of scope for this task.

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

From `revised-appointment-business-plan.md` §1.A (Guest Booking — "Fast Path"):

1. Guest enters: Name, Phone, Email, DOB
2. Guest selects: Service
3. System renders date calendar from combined working rosters of all doctors qualified for that service
4. Guest selects: Date + Time Preference (Morning / Afternoon)
5. On submit → saves to `appointment_inquiries` table with:
   - No `doctor_id` (inquiries table has no doctor column)
   - `status` = `'NEW'`

---

## 1. Database & Schema Verification

- [ ] **Verify `appointment_inquiries` table shape:**
  - Confirm columns: `first_name`, `last_name`, `middle_name`, `suffix`, `phone_number`, `email`, `preferred_service_id`, `preferred_date`, `date_of_birth`, `time_preference`, `patient_note`, `status`
  - Confirm NO `doctor_id` column exists on this table — guests do not select a doctor
  - Confirm `status` default is `'NEW'`
  - Confirm `time_preference` check constraint: `('MORNING', 'AFTERNOON')`

- [ ] **Verify `appointment_inquiries` RLS:**
  - The action uses `createAdminClient()` — verify this bypasses RLS correctly for anonymous submissions

---

## 2. Backend: DTO, Use Case, Action

### 2.1 DTO — `submit-inquiry.dto.ts`
> File: `src/modules/appointments/dtos/booking/submit-inquiry.dto.ts`

- [ ] **Verify `submitInquirySchema` has NO doctor field** — guest flow has no doctor selection
- [ ] **Verify required fields are validated:**
  - `firstName`, `lastName` — required, trimmed, min 1
  - `middleName`, `suffix` — optional, empty string → `undefined`
  - `phoneNumber` — E.164 regex
  - `email` — `.email()` validated
  - `preferredServiceId` — UUID validated
  - `preferredDate` — `YYYY-MM-DD` regex
  - `dateOfBirth` — optional, `YYYY-MM-DD` or empty string → `undefined`
  - `timePreference` — `'MORNING' | 'AFTERNOON'`, **required** (not optional)
  - `patientNote` — optional
- [ ] **Verify `timePreference` is REQUIRED** — guest must select Morning or Afternoon before submitting
- [ ] **Verify `inquiryResponseSchema`** maps DB `snake_case` → `camelCase` via Zod `.transform()`. No manual mapping code.
- [ ] **Verify sibling spec file `submit-inquiry.dto.spec.ts` covers:**
  - Valid full payload → passes
  - Missing `timePreference` → Zod error
  - Missing `firstName` → Zod error
  - Empty `middleName` → transforms to `undefined`
  - Invalid `email` → Zod error
  - Invalid `phoneNumber` → Zod error

### 2.2 Use Case — `submit-inquiry.use-case.ts`
> File: `src/modules/appointments/use-cases/booking/submit-inquiry.use-case.ts`

- [ ] **Verify functional DI pattern** — receives `createInquiry` command as injected dependency, NOT importing it directly inside the function body
- [ ] **Verify use case is pure** — no Supabase imports, no `req`/`res`, no HTTP logic
- [ ] **Verify DB payload mapping is correct (camelCase in, snake_case out to DB):**
  ```ts
  {
    first_name: data.firstName,
    last_name: data.lastName,
    phone_number: data.phoneNumber,
    preferred_service_id: data.preferredServiceId,
    preferred_date: data.preferredDate,
    time_preference: data.timePreference,
    date_of_birth: data.dateOfBirth ?? null,
    // NO doctor_id
  }
  ```
- [ ] **Verify sibling spec file `submit-inquiry.use-case.spec.ts`** — mocks `createInquiry`, asserts correct payload mapping, no real DB call

### 2.3 Server Action — `submit-inquiry.action.ts`
> File: `src/modules/appointments/actions/booking/submit-inquiry.action.ts`

- [ ] **Verify action is thin** — 3 steps only: (1) parse input, (2) DI setup, (3) call use case
- [ ] **Verify `'use server'` directive at line 1**
- [ ] **Verify uses `createAdminClient()`** — anon guests have no Supabase auth session
- [ ] **Verify returns standardized response:** `{ success: true, data }` or `{ success: false, error: string }`
- [ ] **Verify no slot validation, no doctor ID logic** — this saves an inquiry, not a confirmed booking
- [ ] **Verify sibling spec file `submit-inquiry.action.spec.ts`** covers:
  - Valid input → `{ success: true }`
  - Zod parse failure → `{ success: false, error: '...' }`
  - Use case throws → `{ success: false, error: '...' }`

---

## 3. Frontend: Landing Page Form

### 3.1 Client-Side Zod Schema
> Wherever `useLandingView` or the landing form hook lives

- [ ] **Verify client Zod schema mirrors server schema:**
  - `timePreference` is **required** — not `.optional()`
  - `dateOfBirth` is optional
  - No doctor field
- [ ] **Verify naming conventions:**
  - Schema variable: `camelCase` ending in `Schema` (e.g. `contactInquirySchema`)
  - Inferred type: `PascalCase` ending in `FormValues` (e.g. `ContactInquiryFormValues`)

### 3.2 Hook — `use-landing-view.ts`
> Abides by: Hook Binding Pattern (`3-REACT-HOOKS.md`)

- [ ] **Verify hook uses React Hook Form + `zodResolver`** — no manual `useState` per field
- [ ] **Verify hook correctly passes `timePreference` to `submitInquiryAction`:**
  ```ts
  const result = await submitInquiryAction({
    ...validData,
    timePreference: validData.timePreference, // 'MORNING' | 'AFTERNOON'
  });
  ```
- [ ] **Verify hook does NOT import Supabase** — all DB writes go through server action only
- [ ] **Verify hook does NOT use `useEffect` to hydrate initial domain data** — date availability comes from RSC or a dedicated read hook
- [ ] **Verify hook never returns JSX** — only primitives, objects, and callback functions
- [ ] **Verify `isSubmitting` state is tracked and returned** — used to disable submit button in UI

### 3.3 Form UI Component (Dumb Component)
> Abides by: Dumb Component Pattern (`2-REACT-COMPONENTS.md`)

- [ ] **Verify form has NO doctor selection field** — guest flow does not pick a doctor
- [ ] **Verify form captures all required fields visible to user:**
  - First Name *(required)*
  - Last Name *(required)*
  - Middle Name *(optional)*
  - Suffix *(optional)*
  - Phone Number *(required)*
  - Email *(required)*
  - Date of Birth *(optional)*
  - Service selector *(required)*
  - Preferred Date calendar *(required)*
  - Time Preference toggle: **Morning** / **Afternoon** *(required)*
  - Patient Note *(optional)*
- [ ] **`timePreference` toggle is required** — submit button stays disabled until one is selected
- [ ] **Verify component is dumb** — zero `useEffect`, zero Supabase calls, props-driven only
- [ ] **Verify submit button disabled while `isSubmitting === true`**
- [ ] **Verify server error renders alongside the form, NOT replacing it** — never use `if (error) return <ErrorPage />`
- [ ] **Verify all shared `<Input>` primitives use `React.forwardRef`** for RHF `register` spread compatibility

### 3.4 Date Calendar (Availability Rendering)
> Business rule: calendar dates = combined working rosters of all doctors who can perform the selected service

- [ ] **Verify calendar queries availability with no `doctorId`** — sends `doctorId: undefined` (or omits it) to backend, triggering aggregate of all rostered doctors for the service
- [ ] **Verify available dates fetch does NOT require auth** — guest is unauthenticated
- [ ] **Verify selecting a date populates `preferredDate` field in the form**
- [ ] **Verify calendar does not render dates where no doctors are rostered** — blocked/greyed out

---

## 4. Testing

- [ ] **`submit-inquiry.dto.spec.ts`** — all Zod branches pass (valid, missing required, empty optional, bad formats)
- [ ] **`submit-inquiry.use-case.spec.ts`** — mock `createInquiry` command, assert DB payload mapping, no real DB
- [ ] **`submit-inquiry.action.spec.ts`** — mock use case, thin shell behavior verified
- [ ] **`use-landing-view.spec.ts`** (if exists) — verify `timePreference` and `dateOfBirth` included in submission call
- [ ] **Full test suite:** `pnpm test` — all tests pass, no regressions

---

## Definition of Done

- Guest fills form (no doctor field), picks date from service-based combined-roster calendar, selects Morning or Afternoon, submits
- Submission saves to `appointment_inquiries` with `status = 'NEW'`, no `doctor_id`
- All Vitest tests pass; `pnpm test` clean
- No `any` type leaks, camelCase enforced in all UI props, no snake_case leaking into components, no DB client imports in any client hook or component
