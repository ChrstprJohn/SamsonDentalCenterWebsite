# Task: Inquiries Queue — Live Integration

> **Scope**: Backend new files + frontend wiring for `/secretary/inquiries`.
> All mutation actions (convert, drop) already exist and hit real DB.

---

## Phase 1 — Backend: Read Side

### 1.1 Inquiries List Query + Action
- `[ ]` `repositories/booking/appointment-inquiries.queries.ts`
  - `getInquiriesQuery(supabase)` → `SELECT * FROM appointment_inquiries WHERE status = 'NEW' ORDER BY created_at DESC`
  - Parse via `inquiryResponseSchema` (in `submit-inquiry.dto.ts`)
  - Returns `InquiryResponseDto[]`
- `[ ]` `repositories/booking/appointment-inquiries.queries.spec.ts`
- `[ ]` `actions/booking/get-inquiries.action.ts`
  - Auth: SECRETARY or ADMIN only
  - 3-step action pattern (validate → DI → execute)
  - Returns `{ success: true, data: InquiryResponseDto[] }`
- `[ ]` `actions/booking/get-inquiries.action.spec.ts`
- `[ ]` Add `getInquiriesQuery` to `repositories/exports.ts`

### 1.2 Available Doctors for Date Action
> `getDoctorSchedulesQuery` already exists. Just need a dedicated action.

- `[ ]` `dtos/availability/get-available-doctors-for-date.dto.ts`
  - Input: `{ date: YYYY-MM-DD, serviceId: UUID }`
  - Response: reuse `DoctorScheduleResponseDto` (already in exports)
- `[ ]` `dtos/availability/get-available-doctors-for-date.dto.spec.ts`
- `[ ]` `actions/availability/get-available-doctors-for-date.action.ts`
  - Auth: SECRETARY or ADMIN only
  - Calls `getDoctorSchedulesQuery(supabase)(date, undefined, serviceId)`
  - Returns distinct list of `{ doctorId, doctorName }` deduplicated by doctor
- `[ ]` `actions/availability/get-available-doctors-for-date.action.spec.ts`
- `[ ]` Add new DTO to `dtos/exports.ts`

---

## Phase 2 — Backend: Patient Search

> No patient search query exists. Need to create. Used in the convert pane to optionally link inquiry to an existing registered patient.

### 2.1 Patient Search Query + Action
- `[ ]` `src/modules/patients/repositories/profile/search-patients.queries.ts`
  - `searchPatientsQuery(supabase)` → takes `{ query: string }` (name or email)
  - `SELECT id, first_name, last_name, email, phone_number FROM users WHERE role = 'PATIENT' AND (email ILIKE '%query%' OR first_name ILIKE '%query%' OR last_name ILIKE '%query%') LIMIT 10`
  - Parse via `patientProfileSchema`
  - Returns `PatientProfileDto[]`
- `[ ]` `src/modules/patients/repositories/profile/search-patients.queries.spec.ts`
- `[ ]` `src/modules/patients/actions/profile/search-patients.action.ts`
  - Auth: SECRETARY or ADMIN only
  - Input: `{ query: string }` min 2 chars
  - Returns `{ success: true, data: PatientProfileDto[] }`
- `[ ]` `src/modules/patients/actions/profile/search-patients.action.spec.ts`
- `[ ]` Add `searchPatientsQuery` to `src/modules/patients/repositories/exports.ts`

### 2.2 Update Convert RPC + DTO to Support Optional Patient Linking + Guest Contacts
> Currently the RPC hardcodes `patient_id = NULL`. Need to add optional `p_patient_id` AND snapshot guest contact into `guest_contacts` when no patient linked.

- `[ ]` New migration: `20260623_update_convert_inquiry_rpc_add_patient_id.sql`
  - `CREATE OR REPLACE FUNCTION convert_inquiry_to_appointment(... p_patient_id UUID DEFAULT NULL ...)`
  - Pass `p_patient_id` to the `INSERT INTO appointments` row
  - When `p_patient_id IS NULL` → also `INSERT INTO guest_contacts (appointment_id, first_name, last_name, phone_number, email, ...)` using the (possibly edited) guest info passed from secretary
  - Mirror the pattern from `create_manual_booking` RPC which already does this correctly
- `[ ]` Update `dtos/booking/convert-inquiry.dto.ts`
  - Add `linkedPatientId: z.string().uuid().optional()`
  - Add optional edited guest fields: `guestFirstName`, `guestLastName`, `guestPhone`, `guestEmail` (secretary may correct typos before converting)
- `[ ]` Update `repositories/booking/appointment-conversion.commands.ts`
  - Pass `p_patient_id: data.linkedPatientId || null`
  - Pass corrected guest fields → RPC snapshots them into `guest_contacts` if no patient

---

## Phase 3 — Frontend: Service + Calendar (Date-First)

> Replace hardcoded service pills and mock calendar in the Convert pane.

- `[ ]` On inquiry row click → pre-fill `stagedInquiryService` from `inq.preferredServiceId`
- `[ ]` Service picker accordion wired to real services (currently 3 hardcoded mock pills)
  - Fetch real services list from DB — reuse `getServicesAction` from `services` module or existing action
  - Render each service as a pill/card
  - Pre-select `inq.preferredServiceId` on row click so secretary can see what guest originally wanted
- `[ ]` On service selected → call `getAvailableDaysAction({ serviceId, month })` (no doctorId)
  - Highlight returned `availableDates[]` on the calendar
  - Grey out all other dates
- `[ ]` Calendar is dynamic (not hardcoded June 2026) — uses current month, navigable
- `[ ]` On date selected → call `getAvailableDoctorsForDateAction({ date, serviceId })`
  - Populate doctor cards from response
- `[ ]` On doctor selected → call `getAvailableTimeSlotsAction({ serviceId, doctorId, date })`
  - Populate timeslot grid from response
- `[ ]` Calendar month navigation — prev/next month controls
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

- `[ ]` Implement toggle state `patientMode: 'SEARCH' | 'GUEST'`
- `[ ]` Implement debounced search input wired to `searchPatientsAction`
- `[ ]` Render search results + selectable rows
- `[ ]` Show selected patient chip with ability to clear
- `[ ]` Pass `linkedPatientId` + edited guest fields to `convertInquiryAction` on submit

---

## Phase 5 — Frontend: Service Name Resolution

> `InquiryResponseDto` only has `preferredServiceId` (UUID). Table column and detail card show service name — need to resolve it.

- `[ ]` Fetch services list on mount (reuse existing services action)
- `[ ]` Build a `serviceId → name` lookup map
- `[ ]` Use map to display `preferredServiceName` in left table column and Initial Request card
- `[ ]` Update `getInquiriesQuery` to JOIN services table and include `preferred_service_name` in the response schema (preferred — avoids client-side lookup)

---

## Phase 6 — Frontend: UX Polish

- `[ ]` Replace all `alert()` calls with toast notifications (success and error)
- `[ ]` Skeleton loading while inquiry list fetches on mount
- `[ ]` Spinner / disabled state on doctor cards while `getAvailableDoctorsForDateAction` is in-flight
- `[ ]` Spinner / disabled state on timeslot grid while `getAvailableTimeSlotsAction` is in-flight
- `[ ]` Error state on inquiry list if `getInquiriesAction` fails (show retry button)
- `[ ]` Inline error message on convert pane if `convertInquiryAction` or `dropInquiryAction` returns `success: false`
- `[ ]` Disable "Finish Review" button while any availability fetch is still in-flight (prevent submitting stale slot)

---

## Phase 7 — Frontend: Inquiries List (Live)

- `[ ]` On mount → call `getInquiriesAction()` → replace `MOCK_INQUIRIES`
- `[ ]` Show loading skeleton while fetching
- `[ ]` After Convert or Drop → re-fetch list, clear selection

---

## Phase 8 — Exports Wiring

- `[ ]` `repositories/exports.ts` → add `getInquiriesQuery`
- `[ ]` `dtos/exports.ts` → add `getAvailableDoctorsForDateSchema`, `GetAvailableDoctorsForDateDto`
- `[ ]` `patients/repositories/exports.ts` → add `searchPatientsQuery`

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
