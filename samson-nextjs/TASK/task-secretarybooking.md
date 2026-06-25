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
