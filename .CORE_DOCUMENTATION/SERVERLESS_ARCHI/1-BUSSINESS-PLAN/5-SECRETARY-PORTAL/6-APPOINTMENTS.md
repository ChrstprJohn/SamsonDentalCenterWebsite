# Secretary Portal: Appointments Directory

**Route**: `/secretary/appointments`

The secretary's tool for **future scheduling management** and **historical auditing**. Strictly scoped to planning ahead and reviewing the past — not for managing patients currently in the building.

- Approve/Reject requests → `/secretary/pending`
- Manage today's active patients → `/secretary/check-in`
- Everything else → here

---

## 1. Tab Structure

- **Tab 1 — Upcoming** (default): Only `APPROVED` appointments. Future commitments that can still be rescheduled or cancelled.
- **Tab 2 — History**: Read-only archive of all closed appointments: `COMPLETED`, `CANCELLED`, `REJECTED`, `DISPLACED`, `NO_SHOW`.

> **Why no PENDING?** Lives in `/secretary/pending`. Single action surface per status.

> **Why no CHECKED_IN / TREATMENT_RENDERED?** If a patient is physically in the building today, the secretary will be on the Tracker page (`/secretary/check-in`). Showing CHECKED_IN here risks action confusion — a secretary could accidentally try to cancel or reschedule someone who is literally in the dentist's chair. Clean rule: **in the building = Tracker. Future or past = Directory.**

---

## 2. Tab 1: Upcoming (APPROVED Only)

Shows all `APPROVED` appointments — future dates and any approved slots today that haven't been checked in yet.

### 2.1 Filters
- **Search Bar**: Match patient name (including dependent/guest profiles), email, phone, or doctor name.
- **Date Range Picker**: Filter by appointment target date.
- **Doctor Filter**: Filter by assigned dentist.

### 2.2 Table Columns
- **Patient**: Full name. Dependent: `Name (Dependent: Holder Name)`. Guest: `Name (Guest)`.
- **Service**: Treatment name.
- **Doctor**: Assigned dentist. Display with assignment indicator (see §2.4).
- **Date & Time**: e.g., `Jun 30, 2026 | 9:00 AM – 9:30 AM`.
- **Source**: `SELF_BOOKED` or `STAFF_CREATED`.
- **Status**: `APPROVED` badge.
- **Actions**: **Reschedule** / **Cancel** inline buttons.

### 2.3 Detail Slide-Over
- **Appointment Summary**: Patient info, service, doctor (with assignment indicator), date/time, source.
- **Status History Log**: Full immutable ledger from `appointment_status_history`.
- **Reschedule Control**: Dynamic dual-lock chooser (see §2.5). Writes ledger entry on confirm.
- **Cancel Control**: Mandatory cancellation reason from preset list or custom text. Transitions to `CANCELLED`. Writes ledger entry.

### 2.4 Doctor Assignment Indicator

Every appointment carries a `doctorAssignmentSource` field that tells the system how the doctor was assigned:

| Value | Label in UI | Meaning |
|---|---|---|
| `SYSTEM` | 🤖 System Assigned | Doctor was auto-assigned at booking (patient did not choose) |
| `USER` | 👤 Patient's Choice | Patient explicitly requested this specific doctor |

This indicator is shown in:
- The **table row** next to the doctor name (small badge/icon)
- The **detail slide-over** summary block
- The **reschedule form** header (to inform the secretary whether patient loyalty matters for this slot)

**Business rule**: The indicator is informational only — the secretary can always choose any available doctor during a reschedule regardless of the original assignment source.

### 2.5 Reschedule Dynamic Chooser

The reschedule form uses a **dual-lock UX** pattern. Both service and doctor are locked by default because a reschedule is typically just a time change, not a treatment change. Unlocking is always possible but requires a deliberate action.

#### Lock States on Open
```
🔒 Treatment: [Current Service Name]        [Change Treatment]
🔒 Doctor:    [Current Doctor Name] 🤖/👤   [Change Doctor]
```

#### Step-by-step flow

**When both locks are ON (default — just pick a new date/time):**
```
Step 1: 🔒 Treatment locked  +  🔒 Doctor locked
         ↓
Step 2: Calendar — only dates where current doctor has availability for current service
         (calls getAvailableDaysAction({ serviceId, doctorId, month }))
         ↓
Step 3: Timeslot grid — slots for locked doctor on selected date
         (calls getAvailableTimeSlotsAction({ serviceId, doctorId, date }))
         ↓ (doctor card step is skipped — doctor already known)
Step 4: Justification note (mandatory)  →  Confirm Reschedule
```

**When "Change Treatment" is unlocked (doctor still locked):**
```
Step 1: 🔓 Treatment unlocked → service chip selector appears
         ↓ (after new service picked)
Step 2: Calendar — dates for new service where locked doctor is available
         (calls getAvailableDaysAction({ serviceId: newServiceId, doctorId, month }))
         ↓
Step 3: Timeslot grid — slots for locked doctor on selected date
         (calls getAvailableTimeSlotsAction({ serviceId: newServiceId, doctorId, date }))
         ↓ (doctor card step is skipped — doctor still locked)
Step 4: Justification note (mandatory)  →  Confirm Reschedule
```

**When "Change Doctor" is unlocked (service still locked):**
```
Step 1: 🔓 Doctor unlocked
         ↓
Step 2: Calendar — all dates available for the service (any doctor)
         (calls getAvailableDaysAction({ serviceId, month }) — no doctorId)
         ↓
Step 3: Doctor cards — doctors available on selected date
         (calls getAvailableDoctorsForDateAction({ serviceId, date }))
         ↓
Step 4: Timeslot grid for chosen doctor on selected date
         (calls getAvailableTimeSlotsAction({ serviceId, doctorId: chosenDoctorId, date }))
         ↓
Step 5: Justification note (mandatory)  →  Confirm Reschedule
```

**When both locks are OFF:**
```
Step 1: 🔓 Treatment unlocked → service chip selector appears
         ↓ (after new service picked)
Step 2: 🔓 Doctor unlocked
         ↓
Step 3: Calendar — all dates for new service (any doctor)
         (calls getAvailableDaysAction({ serviceId: newServiceId, month }))
         ↓
Step 4: Doctor cards — doctors available on selected date
         (calls getAvailableDoctorsForDateAction({ serviceId: newServiceId, date }))
         ↓
Step 5: Timeslot grid for chosen doctor
         (calls getAvailableTimeSlotsAction({ serviceId: newServiceId, doctorId: chosenDoctorId, date }))
         ↓
Step 6: Justification note (mandatory)  →  Confirm Reschedule
```

#### API Call Matrix (quick reference)

| Service Lock | Doctor Lock | `getAvailableDaysAction` params | Doctor picker step? |
|:---:|:---:|---|:---:|
| ON | ON | `{ serviceId, doctorId, month }` | ❌ Skip — doctor pre-locked |
| OFF | ON | `{ serviceId: newId, doctorId, month }` | ❌ Skip — doctor pre-locked |
| ON | OFF | `{ serviceId, month }` | ✅ Show doctor cards after date |
| OFF | OFF | `{ serviceId: newId, month }` | ✅ Show doctor cards after date |

#### Reset Cascade Rules
- Toggle **"Change Treatment" ON** → reset: `serviceId`, `date`, `doctorId`, `startTime`, `endTime`.
- Toggle **"Change Treatment" OFF** (re-lock) → restore original `serviceId`, reset: `date`, `doctorId`, `startTime`, `endTime`.
- Toggle **"Change Doctor" ON** → reset: `date`, `doctorId`, `startTime`, `endTime`.
- Toggle **"Change Doctor" OFF** (re-lock) → restore original `doctorId`, reset: `date`, `startTime`, `endTime`.

#### Submit guard
Submit is blocked unless ALL of the following are satisfied:
- A date is selected
- A doctor is confirmed (either locked original or newly chosen)
- A timeslot (`startTime` + `endTime`) is selected
- Justification text is non-empty

---

## 3. Tab 2: History (Read-Only)

### 3.1 Filters
- **Status Filter**: `COMPLETED`, `CANCELLED`, `REJECTED`, `DISPLACED`, `NO_SHOW`.
- **Search Bar**: Same as Tab 1.
- **Date Range Picker**: Filter by target date.

### 3.2 Table Columns
Same as Tab 1. Status badge color-coded:
- 🟢 Green: `COMPLETED`
- 🔴 Red: `CANCELLED`, `REJECTED`
- 🟡 Amber: `DISPLACED`, `NO_SHOW`

No action buttons — read-only.

### 3.3 Detail Slide-Over (Read-Only)
- **Appointment Summary**: Full appointment details including doctor assignment indicator.
- **Status History Log**: Every state transition with actor, reason, and timestamp.
- **Invoice Receipt** *(COMPLETED only)*: Link/summary to the finalized invoice.

---

## 4. Status Ownership (Strict Separation)

```
[Booking] ──> PENDING        → /secretary/pending    (Approve / Reject / Displace)
                 │
                 └──> APPROVED     → /secretary/appointments Tab 1  (Reschedule / Cancel)
                          │
                          └──> CHECKED_IN        → /secretary/check-in  (Undo / Monitor)
                                   │
                                   └──> TREATMENT_RENDERED → /secretary/check-in  (Process Billing)
                                              │
                                              └──> COMPLETED  → /secretary/appointments Tab 2  (Read-only)
```

| Status | Owning Page | Actions |
|---|---|---|
| `PENDING` | `/secretary/pending` | Approve / Reject / Displace |
| `APPROVED` | `/secretary/appointments` Tab 1 | Reschedule / Cancel |
| `CHECKED_IN` | `/secretary/check-in` Col 2 | Undo Check-In |
| `TREATMENT_RENDERED` | `/secretary/check-in` Col 3 | Process Billing |
| `COMPLETED` | `/secretary/appointments` Tab 2 | Read-only + Invoice |
| `CANCELLED` / `REJECTED` / `DISPLACED` / `NO_SHOW` | `/secretary/appointments` Tab 2 | Read-only |
