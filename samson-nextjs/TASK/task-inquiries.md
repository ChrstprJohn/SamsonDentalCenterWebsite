# Task: Inquiries Queue — Live Integration

> **Scope**: Backend new files + frontend wiring for `/secretary/inquiries`.
> All mutation actions (convert, drop) already exist and hit real DB.

---

## Phase 1 — Backend: Read Side

### 1.1 Inquiries List Query + Action
- `[x]` `repositories/booking/appointment-inquiries.queries.ts`
  - `getInquiriesQuery(supabase)` → `SELECT * FROM appointment_inquiries WHERE status = 'NEW' ORDER BY created_at DESC`
  - Parse via `inquiryResponseSchema` (in `submit-inquiry.dto.ts`)
  - Returns `InquiryResponseDto[]`
- `[x]` `repositories/booking/appointment-inquiries.queries.spec.ts`
- `[x]` `actions/booking/get-inquiries.action.ts`
  - Auth: SECRETARY or ADMIN only
  - 3-step action pattern (validate → DI → execute)
  - Returns `{ success: true, data: InquiryResponseDto[] }`
- `[x]` `actions/booking/get-inquiries.action.spec.ts`
- `[x]` Add `getInquiriesQuery` to `repositories/exports.ts`

### 1.2 Available Doctors for Date Action
> `getDoctorSchedulesQuery` already exists. Just need a dedicated action.

- `[x]` `dtos/availability/get-available-doctors-for-date.dto.ts`
  - Input: `{ date: YYYY-MM-DD, serviceId: UUID }`
  - Response: reuse `DoctorScheduleResponseDto` (already in exports)
- `[x]` `dtos/availability/get-available-doctors-for-date.dto.spec.ts`
- `[x]` `actions/availability/get-available-doctors-for-date.action.ts`
  - Auth: SECRETARY or ADMIN only
  - Calls `getDoctorSchedulesQuery(supabase)(date, undefined, serviceId)`
  - Returns distinct list of `{ doctorId, doctorName }` deduplicated by doctor
- `[x]` `actions/availability/get-available-doctors-for-date.action.spec.ts`
- `[x]` Add new DTO to `dtos/exports.ts`

---

## Phase 2 — Backend: Patient Search

> No patient search query exists. Need to create. Used in the convert pane to optionally link inquiry to an existing registered patient.

### 2.1 Patient Search Query + Action
- `[x]` `src/modules/patients/repositories/profile/search-patients.queries.ts`
  - `searchPatientsQuery(supabase)` → takes `{ query: string }` (name or email)
  - `SELECT id, first_name, last_name, email, phone_number FROM users WHERE role = 'PATIENT' AND (email ILIKE '%query%' OR first_name ILIKE '%query%' OR last_name ILIKE '%query%') LIMIT 10`
  - Parse via `patientProfileSchema`
  - Returns `PatientProfileDto[]`
- `[x]` `src/modules/patients/repositories/profile/search-patients.queries.spec.ts`
- `[x]` `src/modules/patients/actions/profile/search-patients.action.ts`
  - Auth: SECRETARY or ADMIN only
  - Input: `{ query: string }` min 2 chars
  - Returns `{ success: true, data: PatientProfileDto[] }`
- `[x]` `src/modules/patients/actions/profile/search-patients.action.spec.ts`
- `[x]` Add `searchPatientsQuery` to `src/modules/patients/repositories/exports.ts`

### 2.2 Update Convert RPC + DTO to Support Optional Patient Linking + Guest Contacts
> Currently the RPC hardcodes `patient_id = NULL`. Need to add optional `p_patient_id` AND snapshot guest contact into `guest_contacts` when no patient linked.

- `[x]` New migration: `20260623_update_convert_inquiry_rpc_add_patient_id.sql`
  - `CREATE OR REPLACE FUNCTION convert_inquiry_to_appointment(... p_patient_id UUID DEFAULT NULL ...)`
  - Pass `p_patient_id` to the `INSERT INTO appointments` row
  - When `p_patient_id IS NULL` → also `INSERT INTO guest_contacts (appointment_id, first_name, last_name, phone_number, email, ...)` using the (possibly edited) guest info passed from secretary
  - Mirror the pattern from `create_manual_booking` RPC which already does this correctly
- `[x]` Update `dtos/booking/convert-inquiry.dto.ts`
  - Add `linkedPatientId: z.string().uuid().optional()`
  - Add optional edited guest fields: `guestFirstName`, `guestLastName`, `guestPhone`, `guestEmail` (secretary may correct typos before converting)
- `[x]` Update `repositories/booking/appointment-conversion.commands.ts`
  - Pass `p_patient_id: data.linkedPatientId || null`
  - Pass corrected guest fields → RPC snapshots them into `guest_contacts` if no patient

---

## Phase 3 — Frontend: Service + Calendar (Date-First)

> Replace hardcoded service pills and mock calendar in the Convert pane.

- `[x]` On inquiry row click → pre-fill `stagedInquiryService` from `inq.preferredServiceId`
- `[x]` Service picker accordion wired to real services (currently 3 hardcoded mock pills)
  - Fetch real services list from DB — reuse `getServicesAction` from `services` module or existing action
  - Render each service as a pill/card
  - Pre-select `inq.preferredServiceId` on row click so secretary can see what guest originally wanted
- `[x]` On service selected → call `getAvailableDaysAction({ serviceId, month })` (no doctorId)
  - Highlight returned `availableDates[]` on the calendar
  - Grey out all other dates
- `[x]` Calendar is dynamic (not hardcoded June 2026) — uses current month, navigable
- `[x]` On date selected → call `getAvailableDoctorsForDateAction({ date, serviceId })`
  - Populate doctor cards from response
- `[x]` On doctor selected → call `getAvailableTimeSlotsAction({ serviceId, doctorId, date })`
  - Populate timeslot grid from response
- `[x]` Calendar month navigation — prev/next month controls
  - `month` state drives `getAvailableDaysAction({ serviceId, month })`
  - Navigating month re-fetches available dates

---

## Phase 4 — Frontend: Patient Search Toggle (Search-First Approach)

> Replace the `<Select>` patient dropdown with a proper search-first UI in the Convert pane.

**UI pattern:**
```
[ 🔍 Search Existing Patient ]  [ 👤 Continue as Guest ]  ← toggle/slider
```

**If "Search Existing Patient" selected:**
- Accordion opens with search input (`<Input type="search">`)
- Secretary types name or email (debounced, min 2 chars)
- Calls `searchPatientsAction({ query })` on input
- Results render as selectable rows (name, email, phone)
- Clicking a row sets `linkedPatientId`
- Selected patient shown as a confirmation chip

**If "Continue as Guest" selected:**
- No search shown
- `linkedPatientId` = null
- Appointment created as guest (`patient_id = NULL` in DB)

- `[x]` Implement toggle state `patientMode: 'SEARCH' | 'GUEST'`
- `[x]` Implement debounced search input wired to `searchPatientsAction`
- `[x]` Render search results + selectable rows
- `[x]` Show selected patient chip with ability to clear
- `[x]` Pass `linkedPatientId` + edited guest fields to `convertInquiryAction` on submit

---

## Phase 5 — Frontend: Service Name Resolution

> `InquiryResponseDto` only has `preferredServiceId` (UUID). Table column and detail card show service name — need to resolve it.

- `[x]` Fetch services list on mount (reuse existing services action)
- `[x]` Build a `serviceId → name` lookup map
- `[x]` Use map to display `preferredServiceName` in left table column and Initial Request card
- `[x]` Update `getInquiriesQuery` to JOIN services table and include `preferred_service_name` in the response schema (preferred — avoids client-side lookup)

---

## Phase 6 — Frontend: UX Polish

- `[x]` Replace all `alert()` calls with toast notifications (success and error)
- `[x]` Skeleton loading while inquiry list fetches on mount
- `[x]` Spinner / disabled state on doctor cards while `getAvailableDoctorsForDateAction` is in-flight
- `[x]` Spinner / disabled state on timeslot grid while `getAvailableTimeSlotsAction` is in-flight
- `[x]` Error state on inquiry list if `getInquiriesAction` fails (show retry button)
- `[x]` Inline error message on convert pane if `convertInquiryAction` or `dropInquiryAction` returns `success: false`
- `[x]` Disable "Finish Review" button while any availability fetch is still in-flight (prevent submitting stale slot)

---

## Phase 7 — Frontend: Inquiries List (Live)

- `[x]` On mount → call `getInquiriesAction()` → replace `MOCK_INQUIRIES`
- `[x]` Show loading skeleton while fetching
- `[x]` After Convert or Drop → re-fetch list, clear selection

---

## Phase 8 — Exports Wiring

- `[x]` `repositories/exports.ts` → add `getInquiriesQuery`
- `[x]` `dtos/exports.ts` → add `getAvailableDoctorsForDateSchema`, `GetAvailableDoctorsForDateDto`
- `[x]` `patients/repositories/exports.ts` → add `searchPatientsQuery`

---

## Phase 9 — Frontend: Landing Page Inquiry Submission Integration

- `[x]` Wire up landing page contact/inquiry form to invoke `submitInquiryAction` with real database inputs
- `[x]` Update frontend form fields to collect all necessary fields (name, email, phone, preferred service, date, message/notes)
- `[x]` Render dynamic specialty/treatment services option menu mapping to active services in the DB
- `[x]` Make preferred date inputs dynamic and validate formats before submission
- `[x]` Resolve TypeScript type errors and ESLint warnings in landing hook unit tests

---

## Phase 10 — Secretary Notes on Conversion

- `[x]` Add "Secretary Call Notes" textarea to conversion panel on frontend inquiries page
- `[x]` Generate predefined default note messages based on guest mode or linked account selection
- `[x]` Pass the secretary notes input to the `convertInquiryAction` payload instead of hardcoding `undefined`

---

## Reused (no changes needed)
| What | Status |
|---|---|
| `getAvailableDaysAction` | ✅ exists |
| `getAvailableTimeSlotsAction` | ✅ exists |
| `convertInquiryAction` | ✅ exists (update DTO for linkedPatientId) |
| `dropInquiryAction` | ✅ exists |
| `patientProfileSchema` + `PatientProfileDto` | ✅ exists |
| `DoctorScheduleResponseDto` | ✅ exists |
| `getDoctorSchedulesQuery` | ✅ exists |

---

## Rules / Architecture (must not violate)
- One file per operation, co-located `.spec.ts` mandatory
- Zod `.transform()` for all DB → App shape conversions (no manual mapping)
- Functional DI pattern — no classes
- SECRETARY or ADMIN auth guard on all new actions
- No server action re-exported through barrel `index.ts`
- Convert action remains ACID — RPC does all DB writes atomically
