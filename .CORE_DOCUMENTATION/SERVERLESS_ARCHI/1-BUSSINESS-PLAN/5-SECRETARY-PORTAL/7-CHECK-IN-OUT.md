# Secretary Portal: Check-In / Out Tracker

**Route**: `/secretary/check-in`

Tracks daily patient visit flow from arrival to billing completion. Uses a **4-column Kanban layout** showing today's appointments only, progressing left-to-right through the visit lifecycle.

---

## 1. Layout Overview

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│   Col 1          │   Col 2          │   Col 3          │   Col 4          │
│   APPROVED       │   CHECKED IN     │   READY FOR      │   COMPLETED      │
│   (Today)        │   (Ongoing)      │   CHECKOUT       │   (Today)        │
│                  │                  │   TREATMENT_     │                  │
│                  │                  │   RENDERED       │                  │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Awaiting arrival │ Patient in room  │ Doctor done,     │ Billed & done    │
│ [Check In btn]   │ [Undo Check-In]  │ invoice drafted  │ Read-only        │
│                  │                  │ [Checkout btn]   │                  │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

All four columns show **today's appointments only**. No past or future dates.

---

## 2. Column 1: Approved (Awaiting Arrival)

Lists all `APPROVED` appointments scheduled for today, ordered by slot time.

**Card shows**: Patient name, scheduled slot, doctor, service.

**Actions**:
- **Check In** button: Transitions status to `CHECKED_IN`. Logs action in `appointment_status_history`. Card moves to Column 2.
  - Time-gate: Button is only enabled within a reasonable window of the scheduled slot (e.g., 30 minutes before). Disabled if too early.
- **No-Show** button (optional, visible only past the slot end time): Marks appointment as `NO_SHOW`. Writes ledger entry.

---

## 3. Column 2: Checked In (Ongoing)

Lists appointments currently in `CHECKED_IN` status. These patients are in the treatment room with the doctor.

This column is passive from the secretary's perspective — it reflects state set by the doctor portal. Cards stay here until the assigned doctor submits clinical notes, which transitions the appointment to `TREATMENT_RENDERED` and creates a `DRAFT` invoice record.

**Card shows**: Patient name, check-in time, doctor, service.

**Actions**:
- **Undo Check-In** button: Reverts status to `APPROVED` if checked in by mistake. Card moves back to Column 1. Requires brief confirmation.

---

## 4. Column 3: Ready for Checkout (Treatment Rendered)

Lists appointments in `TREATMENT_RENDERED` status where the doctor has completed and submitted clinical treatment details. A `DRAFT` invoice record exists for each entry here.

**Card shows**: Patient name, check-in time, service, doctor, invoice draft indicator.

**Actions**:
- **Checkout** button: Opens the Checkout & Invoicing panel (inline slide-over or dialog):

  ### Checkout & Invoicing Panel
  - **Review Draft Invoice**: Displays service name, doctor, and base price (pulled from `services.price`).
  - **Price Adjustments**: Enter a flat price override or a discount percentage (0–100%).
  - **Payment Method**: Dropdown — `CASH`, `CARD`, `HMO`.
  - **Complete Checkout** button:
    - Updates `invoices` status → `FINALIZED`.
    - Updates appointment status → `COMPLETED`.
    - Inserts a ledger entry into `appointment_status_history`.
    - Triggers async outbox notification event (e.g., receipt email).
    - Card moves to Column 4.

---

## 5. Column 4: Completed (Today)

Read-only column. Shows all appointments that reached `COMPLETED` status today.

**Card shows**: Patient name, service, doctor, completion time, payment method badge.

No actions. This is a same-day done list — a quick visual confirmation for the secretary that checkout was processed.

---

## 6. Implementation Notes

### Today-Only Scope
All columns filter by `appointment_date = today`. This page is an operational daily view, not a history browser (→ use `/secretary/appointments` History tab for past records).

### Status Flow (this page only)
```
APPROVED → CHECKED_IN → TREATMENT_RENDERED → COMPLETED
   Col 1       Col 2           Col 3            Col 4
```

### Doctor-Triggered Transition
The `CHECKED_IN → TREATMENT_RENDERED` transition is **not** triggered by the secretary. It is triggered by the assigned doctor via the Doctor Portal when they submit their clinical notes/treatment record. The secretary's Column 3 updates reactively (via real-time subscription or periodic polling).

### Ledger Writes
Every status transition on this page writes an immutable row to `appointment_status_history` (`appointment_id`, `actor_role`, `previous_status`, `new_status`, `reason`, `created_at`) using `createAdminClient()` to bypass RLS.

### Time-Gate Logic
The Check-In button uses a client-side time check comparing current time against the appointment's `start_time`. Enable window: `start_time - 30min` to `end_time`. Outside this window, the button is disabled with a tooltip showing when it becomes active.
