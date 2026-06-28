# Task: Secretary Manual Appointment Creation

## Objective
Create a manual booking interface for secretaries to schedule appointments for walk-ins or phone calls. The flow must mirror the step-by-step structure of the Convert Request task, but dynamically handle both existing registered users and brand-new guest patients from a single form.

> **Architecture Reference:**
> All backend code must strictly follow [1-ARCHITECTURE.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/1-ARCHITECTURE.md) and [1.5-CODING-PATTERNS.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/1.5-CODING-PATTERNS.md).

---

## Core Rules & Reusability

### UI Alignment
Reuse the exact step components (Doctor Select, Date Picker, Time Slots, Review Step) from the conversion task.

### Database States
- **If an Existing Patient is selected:** Save the appointment with their `userId` (linked account).
- **If a New Patient is filled manually:** Save the appointment with `userId: null` (Guest Mode). Guest details are snapshotted in `guest_contacts`, holding: First Name, Last Name, Phone, optional Email — linked 1:1 to the appointment via FK.

---

## Email Flow Design

### Why Email IS Required on the Public Inquiry Form
When a visitor fills out a form on the public website, they are completely anonymous:
- Spam/bot protection via email field
- Async communication — staff reply via email
- User is already online

### Why Email is OPTIONAL for Secretary's Manual Booking
- **"Elderly or Urgent" Factor:** Walk-ins/phone callers may not have email
- **No bot risk:** Secure portal, staff-only
- **Phone is the fallback contact method**

### Email Event Architecture
Two separate outbox events — emitted by the `create_manual_booking` RPC at DB level:

| Event | Triggered when | Subscriber behavior |
|---|---|---|
| `APPOINTMENT_MANUALLY_BOOKED_GUEST` | Guest (no patient account) | Send email **only if** `guestEmail` is present; silently skip if null |
| `APPOINTMENT_MANUALLY_BOOKED_PATIENT` | Registered patient | Always send — email fetched from `users` table |
| `APPOINTMENT_CONVERTED_FROM_INQUIRY` | Inquiry converted to appt | Always send — inquiry always has email (required on public form) |

> **Note:** `appointment-converted.event.dto.ts` keeps `guestEmail: z.string().email()` as **required** — the converted flow always has an email. Do NOT make it optional.

---

## Backend Implementation — Appointments Module

All files follow: `src/modules/appointments/{layer}/{aggregate}/`  
**One file = one operation. Co-located `.spec.ts` is MANDATORY for every file.**

### 1. DTO Layer — `src/modules/appointments/dtos/booking/`

- [x] **`create-manual-booking.dto.ts`** — `createManualBookingSchema` + `CreateManualBookingDto`
  - Zod validation schema for manual booking inputs (camelCase)
  - Required: `serviceId`, `doctorId`, `date`, `startTime`, `endTime`, `firstName`, `lastName`, `phoneNumber`
  - Optional/nullable: `patientId`, `middleName`, `suffix`, `email`, `patientNote`, `statusReason`
  - Email: `.optional().or(z.literal(''))` — allows blank or valid email
  - Phone: E.164 format validation
- [x] **`create-manual-booking.dto.spec.ts`** — validates required fields, email optionality, E.164 phone

> **Architecture check:** DTO barrel `dtos/exports.ts` must re-export all booking DTOs via named export.

### 2. Repository Layer — `src/modules/appointments/repositories/booking/`

Follows **Functional CQRS** pattern: `export const createManualBookingCommand = (supabase: SupabaseClient) => async (data) => ...`

- [x] **`create-manual-booking.command.ts`** — `createManualBookingCommand`
  - Calls `create_manual_booking` Supabase RPC
  - The RPC handles all DB writes atomically (appointments insert, inquiry snapshot, status history, outbox event emission)
  - Command returns `{ appointmentId: string }` — no direct outbox writes in TypeScript layer
- [x] **`create-manual-booking.command.spec.ts`** — mocks Supabase client, asserts RPC call args

### 3. Use Case Layer — `src/modules/appointments/use-cases/booking/`

Follows **Functional Use Case** pattern: pure functions, no `this`, Functional DI via deps parameter.

- [x] **`create-manual-booking.use-case.ts`** — `createManualBookingUseCase`
  - Receives `createManualBooking` and `getAvailableTimeSlots` as injected deps
  - Runs live slot availability check before committing
  - Throws `ValidationError('SLOT_UNAVAILABLE')` if slot taken
  - Catches Supabase constraint errors (`23P01`, `23505`) and re-throws as `ValidationError('SLOT_ALREADY_BOOKED')`
- [x] **`create-manual-booking.use-case.spec.ts`** — mocks deps, tests conflict scenarios

### 4. Server Action Layer — `src/modules/appointments/actions/booking/`

Follows **Streamlined Server Action** blueprint: Parse → DI Setup + Auth → Execute.

- [x] **`create-manual-booking.action.ts`** — `createManualBookingAction`
  - `'use server'` directive at top of file
  - Step 1: `createManualBookingSchema.parse(data)`
  - Step 2: `getAuthenticatedUser()` — role check: `SECRETARY` or `ADMIN` only
  - Step 3: Functional DI wiring (`createManualBookingCommand`, `getAvailableTimeSlotsUseCase`, `createManualBookingUseCase`)
  - Step 4: Execute use case, return `{ success: true, data }` or `{ success: false, error }`
  - Step 5: `after(() => { bootstrapEventSubscribers(); globalOutboxDispatcher()(); })` for non-blocking outbox processing
  - **CRITICAL:** Do NOT re-export via `src/modules/appointments/index.ts`. Import directly from file path in UI components.
- [x] **`create-manual-booking.action.spec.ts`** — tests auth guard, role check, error paths

---

## Backend Implementation — Emails Module

All files follow: `src/modules/emails/{layer}/{aggregate}/`  
Event DTOs live in: `src/modules/emails/dtos/events/`  
Subscribers live in: `src/modules/emails/subscribers/`

### 5. Email Event DTOs — `src/modules/emails/dtos/events/`

- [x] **`manual-booking-guest.event.dto.ts`** — `manualBookingGuestEventSchema` + `ManualBookingGuestEventDto`
  - Fields: `appointmentId`, `serviceId`, `doctorId`, `date`, `startTime`, `durationMinutes`, `inquiryId`, `guestName`, `guestPhone`
  - `guestEmail`: `.nullable().optional()` — may be null/absent when guest has no email
- [x] **`manual-booking-guest.event.dto.spec.ts`** — validates schema, confirms email optional behavior
- [x] **`manual-booking-patient.event.dto.ts`** — `manualBookingPatientEventSchema` + `ManualBookingPatientEventDto`
  - Fields: `appointmentId`, `patientId`, `serviceId`, `doctorId`, `date`, `startTime`, `durationMinutes`
  - No email field — subscriber fetches from `users` table
- [x] **`manual-booking-patient.event.dto.spec.ts`** — validates schema fields

### 6. Email Subscribers — `src/modules/emails/subscribers/`

- [x] **`on-manual-booking-guest.subscriber.ts`** — `onManualBookingGuestSubscriber`
  - Parses payload via `manualBookingGuestEventSchema`
  - Early-returns (no-op) if `!guestEmail`
  - Fetches service name + doctor name from DB
  - Sends `appointment_confirmed` template via `ResendService`
- [x] **`on-manual-booking-guest.subscriber.spec.ts`** — tests: no-op when email null, sends when email present
- [x] **`on-manual-booking-patient.subscriber.ts`** — `onManualBookingPatientSubscriber`
  - Parses payload via `manualBookingPatientEventSchema`
  - Fetches patient email + name from `users` table
  - Fetches service name + doctor name from DB
  - Sends `appointment_confirmed` template via `ResendService`
- [x] **`on-manual-booking-patient.subscriber.spec.ts`** — tests: patient fetch, email dispatch

### 7. Orchestrator — `src/orchestrators/event-subscribers.ts`

- [x] Register `APPOINTMENT_MANUALLY_BOOKED_GUEST` → `onManualBookingGuestSubscriber.handle`
- [x] Register `APPOINTMENT_MANUALLY_BOOKED_PATIENT` → `onManualBookingPatientSubscriber.handle`

---

## Frontend Implementation — Secretary Portal

All UI components live in: `src/app/(portals)/secretary/`  
Import Server Actions **directly** from their action file paths — never via `index.ts` barrel.

### Phase 1: Patient Identity Step (Step 1)

- [x] **Patient Search Bar**
  - Async combobox querying `users` by Name, Email, or Phone
- [x] **Path A: Existing Patient (Linked Account)**
  - Auto-populate: First Name, Middle Name, Last Name, Suffix, Email, Phone
  - Lock fields as read-only
  - State: `selectedUserId = user.id`
  - Badge: 🟢 Linked to Account
- [x] **Path B: New Guest Patient**
  - All fields editable (Email optional, Phone required)
  - State: `selectedUserId = null`
  - Badge: 🟡 Creating as Guest

### Phase 2: Appointment & Schedule (Steps 2 & 3)

- [x] **Step 2: Department & Provider**
  - [x] Service/Department chip selector (real `getServicesAction`)
  - [x] Doctor cards (real `getAvailableDoctorsForDateAction`, filtered by service+date)
  - [x] Patient Note text field
- [x] **Step 3: Date & Time**
  - [x] Calendar date picker (real `getAvailableDaysAction`)
  - [x] Time slot grid (real `getAvailableTimeSlotsAction`, unavailable excluded server-side)

### Phase 3: Review & Submit (Step 4)

- [x] **Step 4: Confirmation Screen**
  - Success screen shows patient name + date/time
  - Shows guest vs linked patient name
- [x] **Submit Handler**
  - Imports `createManualBookingAction` directly from action file path
  - Handles `{ success, error }` response
- [x] **Success State**
  - "Book Another" resets all form state
  - Toast notification on success/error

---

## Architecture Decision: `guest_contacts` Table

**Decision:** Use a dedicated `guest_contacts` table instead of reusing `appointment_inquiries` for guest contact storage.

**Rationale:**
- `appointment_inquiries` remains purpose-pure for public form submissions
- `guest_contacts` is semantically correct — one record per guest appointment, 1:1 FK to `appointments`
- No cross-contamination of "pending inquiry" queries with staff-created guest records

**Impact:**
- [x] `migrations/20260622130000_create_guest_contacts.sql` — new table + RLS + unique index
- [x] `migrations/20260622130001_update_manual_booking_rpc_guest_contacts.sql` — RPC updated, `inquiryId` → `guestContactId` in outbox payload
- [x] `src/shared/database/database.types.ts` — `guest_contacts` table type added; `appointments.patient_id` made nullable
- [x] `manual-booking-guest.event.dto.ts` — `inquiryId` → `guestContactId`
- [x] `manual-booking-guest.event.dto.spec.ts` — field renamed
- [x] `on-manual-booking-guest.subscriber.spec.ts` — payload field renamed

> ⚠️ **Migrations must be executed on Supabase before testing the full flow.**

---

## Remaining Work Summary

### Backend ✅ COMPLETE
All backend layers done and tested (39/39 tests pass).

### Frontend ✅ COMPLETE
- [x] Two-column split-pane at `/secretary/book` — patient identity left, service+schedule right
- [x] All real API actions wired (search, services, days, doctors, slots, submit)
- [x] Guest form + linked account modes with badges
- [x] Toast + success screen

---

## Phase 2: Dependent Support in Manual Booking

### Overview

When a secretary selects an existing patient account, the booking flow must ask **"Who is this appointment for?"** — allowing the secretary to book for the account holder themselves, an existing dependent, or a brand-new dependent added inline. The new dependent is created **atomically with the appointment** inside the RPC — never created independently before submission.

### UX Flow

```
Secretary searches "Santos" → selects [John Santos] (account holder)
        │
        ▼
"Who is this appointment for?"
  ○ John Santos              ← account holder himself
  ○ Maria Santos (Child, 2015)  ← existing dependent
  ○ Luis Santos (Spouse)     ← existing dependent
  [+ Add Dependent]          ← expands inline form:
        First Name, Last Name, Date of Birth, Relationship
        (held in state; saved ONLY when appointment is submitted)
```

- Selecting **account holder** → `patientId = john.id`, `dependentId = null`
- Selecting **existing dependent** → `patientId = john.id`, `dependentId = dependent.id`
- Filling **new dependent form** → `patientId = john.id` + `newDependent*` fields → RPC creates dependent + appointment atomically
- **Guest mode unchanged:** No account → guest form → `guest_contacts` table

---

### Architecture Rules Reference

All new files follow:
- **1-ARCHITECTURE.md**: One file = one operation. Co-located `.spec.ts` mandatory. Aggregate subfolders from day one. No Server Action re-export via `index.ts` barrel.
- **1.5-CODING-PATTERNS.md**: Functional CQRS repositories (`export const command = (supabase) => async (data) => ...`). Functional use-cases (pure functions, deps injected). 3-step streamlined server actions (Parse → DI → Execute).
- **3-CLEAN_CODE.md**: `camelCase` everywhere in app layer. `snake_case` only at DB boundary via Zod `.transform()`. No raw DB row returned to client.
- **4-TESTING_GUIDELINES.md**: 80% unit tests, `vi.mock` for all Supabase calls, co-located `.spec.ts` for every `.ts` file. No real DB in unit tests.
- **2-NEXTJS.md**: `'use server'` at top of action file. Import server actions directly from file path in UI — never via `index.ts` barrel.

---

### Step 1: Database Migration

#### [NEW] `migrations/20260626_add_dependent_support_to_manual_booking_rpc.sql`

Update `create_manual_booking` PostgreSQL RPC to accept dependent parameters:

**New RPC params:**
- `p_dependent_id UUID DEFAULT NULL` — links to existing `dependents.id`
- `p_new_dependent_first_name TEXT DEFAULT NULL`
- `p_new_dependent_middle_name TEXT DEFAULT NULL`
- `p_new_dependent_last_name TEXT DEFAULT NULL`
- `p_new_dependent_suffix TEXT DEFAULT NULL`
- `p_new_dependent_date_of_birth DATE DEFAULT NULL`
- `p_new_dependent_relationship TEXT DEFAULT NULL`

**RPC internal branching:**
1. If `p_dependent_id` is not null → use existing dependent (no insert)
2. Else if `p_new_dependent_first_name` is not null → `INSERT INTO dependents`, use new `id`
3. Else → no dependent (booking for self or guest)

Sets `appointments.dependent_id` accordingly.

**Also update `APPOINTMENT_MANUALLY_BOOKED_PATIENT` outbox payload** to include `dependent_id` and `dependent_name` (nullable) so email subscriber can reference the correct name.

> ⚠️ Migration must be applied to Supabase before testing.

---

### Step 2: DTO Layer — `src/modules/appointments/dtos/booking/`

#### [MODIFY] `create-manual-booking.dto.ts`

Add optional dependent fields to `createManualBookingSchema`:

```ts
dependentId: z.string().uuid().optional().nullable(),
newDependentFirstName: z.string().min(1).optional(),
newDependentMiddleName: z.string().optional(),
newDependentLastName: z.string().min(1).optional(),
newDependentSuffix: z.string().optional(),
newDependentDateOfBirth: z.string().optional(),   // ISO date string YYYY-MM-DD
newDependentRelationship: z.enum(['CHILD','SPOUSE','SIBLING','PARENT','OTHER']).optional(),
```

Add `.refine()`: if `newDependentFirstName` is present → `newDependentLastName`, `newDependentDateOfBirth`, `newDependentRelationship` must also be present.

#### [MODIFY] `create-manual-booking.dto.spec.ts`

New test cases:
- Valid: payload with `dependentId` only
- Valid: payload with all `newDependent*` fields
- Fails: `newDependentFirstName` present but `newDependentLastName` absent
- Fails: `newDependentDateOfBirth` absent when creating new dependent

---

### Step 3: Repository Layer — `src/modules/appointments/repositories/booking/`

#### [MODIFY] `create-manual-booking.command.ts`

Add new RPC params to the `supabase.rpc('create_manual_booking', {...})` call:

```ts
p_dependent_id: data.dependentId || null,
p_new_dependent_first_name: data.newDependentFirstName || null,
p_new_dependent_middle_name: data.newDependentMiddleName || null,
p_new_dependent_last_name: data.newDependentLastName || null,
p_new_dependent_suffix: data.newDependentSuffix || null,
p_new_dependent_date_of_birth: data.newDependentDateOfBirth || null,
p_new_dependent_relationship: data.newDependentRelationship || null,
```

#### [MODIFY] `create-manual-booking.command.spec.ts`

New test cases:
- Asserts `p_dependent_id` passed when `dependentId` provided
- Asserts `p_new_dependent_*` params passed when new dependent fields provided
- Asserts all dependent params are `null` when booking for self (no dependent)

---

### Step 4: Verify Patient Dependents Action

#### Verify: `src/modules/patients/actions/dependents/get-user-dependents.action.ts`

- Confirm it accepts `userId: string` (the patient account ID)
- Confirm it returns `DependentProfileDto[]`
- **Critical:** Confirm auth guard allows `SECRETARY` and `ADMIN` roles (not just `PATIENT`)
- If auth guard is `PATIENT` only → create new action:

#### [NEW if needed] `src/modules/patients/actions/dependents/get-dependents-for-booking.action.ts`

```ts
'use server';
// Role check: SECRETARY | ADMIN only
// Accepts: { patientId: string }
// Returns: DependentProfileDto[]
// Pattern: Parse → DI Setup + Auth → Execute (via getDependentsByPatientIdQuery)
```

#### [NEW if needed] `src/modules/patients/actions/dependents/get-dependents-for-booking.action.spec.ts`

- Tests: role guard blocks PATIENT, allows SECRETARY/ADMIN
- Tests: returns empty array when patient has no dependents
- Tests: returns mapped DependentProfileDto[] on success

---

### Step 5: Use Case Layer — `src/modules/appointments/use-cases/booking/`

#### [MODIFY] `create-manual-booking.use-case.spec.ts`

Add test case: payload containing `newDependentFirstName` passes through unchanged to `createManualBooking` command dep.

> No logic change to `create-manual-booking.use-case.ts` — the slot check is unchanged; dependent creation is inside the RPC.

---

### Step 6: Email — `src/modules/emails/`

#### [MODIFY] `src/modules/emails/dtos/events/manual-booking-patient.event.dto.ts`

Add to `manualBookingPatientEventSchema`:
```ts
dependentId: z.string().uuid().optional().nullable(),
dependentName: z.string().optional().nullable(),
```

#### [MODIFY] `src/modules/emails/dtos/events/manual-booking-patient.event.dto.spec.ts`

- Tests: `dependentId` and `dependentName` are optional/nullable — schema validates without them
- Tests: schema validates with both present

#### [MODIFY] `src/modules/emails/subscribers/on-manual-booking-patient.subscriber.ts`

Update email rendering:
- If payload `dependentName` present → use `dependentName` in email ("Appointment for: Maria Santos")
- Else → use patient name fetched from `users` table (existing behavior unchanged)

#### [MODIFY] `src/modules/emails/subscribers/on-manual-booking-patient.subscriber.spec.ts`

New test cases:
- Sends email addressed to `dependentName` when `dependentId` present in payload
- Sends email addressed to account holder name when no `dependentId`

---

### Step 7: Frontend — `src/app/(portals)/secretary/book/page.tsx`

#### [MODIFY] `book/page.tsx`

**New state:**
```ts
type BookingFor = 'SELF' | 'EXISTING_DEP' | 'NEW_DEP';
const [dependents, setDependents] = useState<any[]>([]);
const [isLoadingDependents, setIsLoadingDependents] = useState(false);
const [bookingFor, setBookingFor] = useState<BookingFor>('SELF');
const [selectedDependent, setSelectedDependent] = useState<any | null>(null);
const [newDepFirstName, setNewDepFirstName] = useState('');
const [newDepMiddleName, setNewDepMiddleName] = useState('');
const [newDepLastName, setNewDepLastName] = useState('');
const [newDepSuffix, setNewDepSuffix] = useState('');
const [newDepDOB, setNewDepDOB] = useState('');
const [newDepRelationship, setNewDepRelationship] = useState('');
```

**After `setSelectedPatient(pat)`** → call `loadDependents(pat.id)` (calls `getUserDependentsAction` or the new secretary action).

**New "Who is this for?" UI section** (visible only in SEARCH mode after patient selected):

```
[○] John Santos (Account Holder)
[○] Maria Santos · Child · 2015-03-01
[○] + Add Dependent ▼
    First Name:   [        ]
    Last Name:    [        ]
    Date of Birth:[        ]
    Relationship: [Child  ▾]
```

**Submit payload:**
```ts
const dependentPayload =
  bookingFor === 'EXISTING_DEP' ? { dependentId: selectedDependent!.id } :
  bookingFor === 'NEW_DEP' ? {
    newDependentFirstName: newDepFirstName,
    newDependentMiddleName: newDepMiddleName || undefined,
    newDependentLastName: newDepLastName,
    newDependentSuffix: newDepSuffix || undefined,
    newDependentDateOfBirth: newDepDOB,
    newDependentRelationship: newDepRelationship,
  } : {};

const payload = {
  serviceId: selectedService,
  doctorId: selectedDoctor,
  date: selectedDate,
  startTime: selectedTime,
  endTime: selectedEndTime,
  patientNote: patientNote || undefined,
  ...(patientMode === 'SEARCH' && selectedPatient
    ? { patientId: selectedPatient.id, ...dependentPayload }
    : { firstName, lastName, phoneNumber, /* guest fields */ }),
};
```

**Submit guard updated:**
```ts
const isReadyToSubmit =
  selectedService && selectedDate && selectedDoctor && selectedTime &&
  (patientMode === 'GUEST'
    ? !!(firstName && lastName && phoneNumber)
    : selectedPatient !== null && (
        bookingFor === 'SELF' ||
        (bookingFor === 'EXISTING_DEP' && selectedDependent !== null) ||
        (bookingFor === 'NEW_DEP' && !!(newDepFirstName && newDepLastName && newDepDOB && newDepRelationship))
      ));
```

---

### Step 8: Shared Types

#### [MODIFY] `src/shared/database/database.types.ts`

Verify `appointments` table has `dependent_id: string | null` column. Add if missing.

---

### File Checklist

#### Database
- [ ] `migrations/20260626_add_dependent_support_to_manual_booking_rpc.sql`

#### DTOs — Appointments
- [ ] `src/modules/appointments/dtos/booking/create-manual-booking.dto.ts` — add dependent fields + `.refine()` validation
- [ ] `src/modules/appointments/dtos/booking/create-manual-booking.dto.spec.ts` — new test cases

#### DTOs — Emails
- [ ] `src/modules/emails/dtos/events/manual-booking-patient.event.dto.ts` — add `dependentId`, `dependentName`
- [ ] `src/modules/emails/dtos/events/manual-booking-patient.event.dto.spec.ts` — new test cases

#### Repositories
- [ ] `src/modules/appointments/repositories/booking/create-manual-booking.command.ts` — pass new RPC params
- [ ] `src/modules/appointments/repositories/booking/create-manual-booking.command.spec.ts` — assert new params

#### Use Cases
- [ ] `src/modules/appointments/use-cases/booking/create-manual-booking.use-case.spec.ts` — add passthrough test

#### Server Actions — Appointments
- [ ] `src/modules/appointments/actions/booking/create-manual-booking.action.spec.ts` — new test case

#### Server Actions — Patients
- [ ] Verify `src/modules/patients/actions/dependents/get-user-dependents.action.ts` allows SECRETARY role
- [ ] [NEW if needed] `src/modules/patients/actions/dependents/get-dependents-for-booking.action.ts`
- [ ] [NEW if needed] `src/modules/patients/actions/dependents/get-dependents-for-booking.action.spec.ts`

#### Email Subscribers
- [ ] `src/modules/emails/subscribers/on-manual-booking-patient.subscriber.ts` — use `dependentName` in email
- [ ] `src/modules/emails/subscribers/on-manual-booking-patient.subscriber.spec.ts` — new test cases

#### Frontend
- [ ] `src/app/(portals)/secretary/book/page.tsx` — "Who is this for?" section + inline add-dependent form

#### Shared
- [ ] `src/shared/database/database.types.ts` — verify `appointments.dependent_id` column
