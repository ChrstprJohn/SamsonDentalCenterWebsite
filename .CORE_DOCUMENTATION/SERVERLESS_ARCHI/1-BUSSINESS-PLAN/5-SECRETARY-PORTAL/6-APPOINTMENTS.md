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
- **Doctor**: Assigned dentist.
- **Date & Time**: e.g., `Jun 30, 2026 | 9:00 AM – 9:30 AM`.
- **Source**: `SELF_BOOKED` or `STAFF_CREATED`.
- **Status**: `APPROVED` badge.
- **Actions**: **Reschedule** / **Cancel** inline buttons.

### 2.3 Detail Slide-Over
- **Appointment Summary**: Patient info, service, doctor, date/time, source.
- **Status History Log**: Full immutable ledger from `appointment_status_history`.
- **Reschedule Control**: New date/time slot + mandatory justification note. Writes ledger entry.
- **Cancel Control**: Mandatory cancellation reason. Transitions to `CANCELLED`. Writes ledger entry.

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
- **Appointment Summary**: Full appointment details.
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
