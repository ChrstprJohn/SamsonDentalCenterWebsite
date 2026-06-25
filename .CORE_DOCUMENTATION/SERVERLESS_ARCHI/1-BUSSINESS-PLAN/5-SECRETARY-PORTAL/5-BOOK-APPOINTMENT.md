# Secretary Portal: Book Appointment

**Route**: `/secretary/book`

This page is a dedicated booking interface used by secretaries to schedule appointments manually for phone calls or walk-in patients.

It is implemented as a **Two-Column Split-Pane Layout** (consistent with the Inquiries Queue and Appointment Requests views) for a unified staff experience.

---

## 1. Split-Pane Layout Structure

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│                                       │                                       │
│          LEFT COLUMN:                 │             RIGHT COLUMN:             │
│          Patient Identity             │          Service & Schedule          │
│          & Info Search                │             Configuration             │
│                                       │                                       │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. Left Column: Patient Identity (Search-First Verification)

The secretary resolves patient details first to lock in the target individual.

- **Patient Search Bar**:
  - Search input matching against Name, Email, or Phone.
  - Asynchronous search results show matches immediately (300ms debounce).
- **Linked Patient Card**:
  - Selecting an existing patient locks the profile fields.
  - Displays registered info (First Name, Last Name, Phone, Email) with a "Clear" button.
  - Badge: 🟢 Linked Account
- **New Guest / Create Patient Form**:
  - Renders when secretary switches to "Register Guest" mode.
  - Fields remain fully editable:
    - **First Name** (Required)
    - **Middle Name** (Optional)
    - **Last Name** (Required)
    - **Suffix** (Optional)
    - **Phone Number** (Required, E.164)
    - **Email Address** (Optional)
  - Badge: 🟡 Creating as Guest

---

## 3. Right Column: Service & Schedule Selection

Interactive parameters to resolve appointment slots dynamically:

- **Service Selection**: Chip/pill buttons for each active service. Selected service determines slot duration.
- **Dynamic Calendar Availability**:
  - Interactive monthly calendar that dynamically enables/disables days via `getAvailableDaysAction`.
  - Enabled dates shown with emerald highlight; disabled dates greyed out.
- **Doctor Cards** (shown after date selected):
  - Cards for each available doctor via `getAvailableDoctorsForDateAction`.
- **Dynamic Timeslots Grid** (shown after doctor selected):
  - Time slot pills via `getAvailableTimeSlotsAction`.
  - Occupied/conflicting slots excluded server-side.
- **Patient Note** (Optional):
  - Free-text field for notes the secretary records on behalf of the patient (e.g., tooth sensitivity, urgency).

---

## 4. Submission & Auto-Approval

At the bottom of the Right Column:

- **"Book Appointment" Action Button**:
  - Disabled until: service + date + doctor + time selected AND patient identity resolved.
  - Calls `createManualBookingAction` directly from action file path.
  - Registers the appointment and marks it as **auto-approved** (`APPROVED`), bypassing the pending queue.
  - If an email was provided, triggers an appointment confirmation email via outbox.
  - Displays success screen upon completion with "Book Another" option.

---

## 5. Implementation Status

### Backend ✅ COMPLETE
All backend layers done and tested (39/39 tests pass).

### Frontend ✅ COMPLETE
- [x] Two-column split-pane layout at `/secretary/book`
- [x] Patient Search (async, debounced, real `searchPatientsAction`)
- [x] Linked account card (🟢 badge, clear button)
- [x] Guest form (🟡 badge, all fields, phone required, email optional)
- [x] Service chip selector (real `getServicesAction`)
- [x] Calendar date picker (real `getAvailableDaysAction`)
- [x] Doctor cards (real `getAvailableDoctorsForDateAction`)
- [x] Timeslot grid (real `getAvailableTimeSlotsAction`)
- [x] Patient note field
- [x] Submit guard (all fields required)
- [x] `createManualBookingAction` wired (imported directly, not via barrel)
- [x] Success screen with "Book Another" reset
- [x] Toast notifications (success/error)

---

## 6. Phase 2: Dependent Support 🔲 PLANNED

### Overview

When a secretary selects an existing patient account, the left column must expand to ask **"Who is this appointment for?"** — revealing the account holder, all existing dependents, and an inline "Add Dependent" form. The dependent is created **atomically with the appointment** inside the RPC on submission.

### Updated Left Column Flow (Search Mode)

```
┌──────────────────────────────────────┐
│  Patient Identity                    │
│                                      │
│  [🔍 Search Patient] [👤 Guest]      │
│                                      │
│  ─ Search results ─                  │
│  [John Santos]  ← secretary clicks   │
│                                      │
│  ─ Who is this for? ─────────────── │
│  ○ John Santos  (Account Holder)    │
│  ○ Maria Santos · Child · 2015      │
│  ○ + Add Dependent  ▼               │
│    ┌──────────────────────────────┐ │
│    │ First Name:   [           ]  │ │
│    │ Last Name:    [           ]  │ │
│    │ Date of Birth:[           ]  │ │
│    │ Relationship: [ Child    ▾]  │ │
│    └──────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Patient Identity Resolution Modes

| Mode | `patientId` | `dependentId` | `guest_contacts` |
|---|---|---|---|
| Account holder (self) | ✅ account id | `null` | — |
| Existing dependent | ✅ account id | ✅ dependent id | — |
| New dependent (inline) | ✅ account id | created atomically by RPC | — |
| Guest (no account) | `null` | `null` | ✅ created by RPC |

### Key Rule: Atomicity

The new dependent is **never saved before appointment submission**. All fields are held in UI state. On submit, the `create_manual_booking` RPC receives the new dependent fields and performs a single atomic transaction: creates the dependent row + creates the appointment row with `dependent_id` set.

---

## 7. Phase 2 — Planned Implementation Checklist

### Database
- [ ] `migrations/20260626_add_dependent_support_to_manual_booking_rpc.sql`
  - Add params: `p_dependent_id`, `p_new_dependent_first_name`, `p_new_dependent_middle_name`, `p_new_dependent_last_name`, `p_new_dependent_suffix`, `p_new_dependent_date_of_birth`, `p_new_dependent_relationship`
  - RPC branches: use existing dependent → or create new dependent → or no dependent
  - Update `APPOINTMENT_MANUALLY_BOOKED_PATIENT` outbox to include `dependent_id` + `dependent_name`

### Backend

**DTOs**
- [ ] `create-manual-booking.dto.ts` — add `dependentId?`, `newDependent*` fields, `.refine()` cross-field validation
- [ ] `create-manual-booking.dto.spec.ts` — new test cases for dependent paths

**Repository**
- [ ] `create-manual-booking.command.ts` — pass 7 new `p_dependent_*` params to RPC
- [ ] `create-manual-booking.command.spec.ts` — assert new params per booking path

**Use Case**
- [ ] `create-manual-booking.use-case.spec.ts` — add passthrough test for dependent fields

**Server Action**
- [ ] `create-manual-booking.action.spec.ts` — new test case
- [ ] Verify/update `get-user-dependents.action.ts` allows `SECRETARY` + `ADMIN` roles
- [ ] [If needed] `get-dependents-for-booking.action.ts` + `.spec.ts` (SECRETARY/ADMIN only)

**Email**
- [ ] `manual-booking-patient.event.dto.ts` — add `dependentId?`, `dependentName?`
- [ ] `manual-booking-patient.event.dto.spec.ts` — new test cases
- [ ] `on-manual-booking-patient.subscriber.ts` — use `dependentName` in email if present
- [ ] `on-manual-booking-patient.subscriber.spec.ts` — test both paths (with/without dependent)

**Shared**
- [ ] `database.types.ts` — verify `appointments.dependent_id` column

### Frontend
- [ ] `book/page.tsx` — "Who is this for?" section after patient selected
  - Radio list: account holder + each existing dependent + "Add Dependent"
  - Inline form (firstName, lastName, DOB, relationship) when "Add Dependent" selected
  - `loadDependents(patientId)` called after patient selected
  - Updated submit payload (self / existing dep / new dep paths)
  - Updated submit guard for all three dependent modes
