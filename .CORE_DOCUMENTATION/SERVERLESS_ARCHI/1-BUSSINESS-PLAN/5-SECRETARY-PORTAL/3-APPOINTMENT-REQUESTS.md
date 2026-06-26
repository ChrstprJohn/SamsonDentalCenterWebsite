# Secretary Portal: Appointment Requests

**Route**: `/secretary/pending`

This page is a dedicated queue for reviewing booking requests submitted online by authenticated patients.

## 1. Split-Pane Layout
The page uses a split-pane layout to make review quick and easy for secretaries:
- **Left Column (Table)**: A list of all pending requests. Clicking a row selects it and loads its details on the right pane.
- **Right Column (Details Pane)**: Displays the full detail of the selected request, including notes, patient details, and a state-first review form.

```
┌────────────────────────────────────────────────────────┐
│ Header: "Appointment Requests"                         │
├───────────────────────────┬────────────────────────────┤
│ Left Column: Table        │ Right Column: Detail Pane  │
│ ┌───────────────────────┐ │ ┌────────────────────────┐ │
│ │ Row: Jane Doe         │ │ │ ⚠️ Booking Conflict!   │ │
│ ├───────────────────────┤ │ │ ────────────────────── │ │
│ │ Row: John Smith       │ │ │ Patient: Jane Doe      │ │
│ └───────────────────────┘ │ │ Service: Cleaning      │ │
│                           │ │ Date: 2026-06-25       │ │
│                           │ │ Note: Has tooth pain   │ │
│                           │ │ ────────────────────── │ │
│                           │ │ Reliability: ✓ 5 done  │ │
│                           │ │ Past History (5 latest)│ │
│                           │ │ Timeline: Doctor slots │ │
│                           │ │ ────────────────────── │ │
│                           │ │ Action Status:         │ │
│                           │ │ [Approve] [Reject]     │ │
│                           │ │ [Displace]             │ │
│                           │ │ Reason: [Select ▾]     │ │
│                           │ │ [Finish Review]        │ │
│                           └┴────────────────────────┘ │
└───────────────────────────┴────────────────────────────┘
```

---

## 2. Left Column (Requests Table)
Lists individual pending appointments.

### Columns
- **Patient**: Patient name (shows dependent name if booked for a dependent).
- **Service**: Requested service.
- **Requested Date & Time**: Target date and time slot, formatted as `Jun 30, 2026 | 9:00 AM - 9:30 AM`.

---

## 3. Right Column (Details Pane)
Shows full detail for the selected request and a staged review form to finalize decisions without instant popup modals.

### 3.1 Booking Conflict Banner (Conditional)
If the patient already has **another active appointment** (PENDING or APPROVED) on the same date that overlaps the requested time slot, a prominent warning banner is displayed at the top of the detail pane:

> ⚠️ **Booking Conflict Detected** — This patient already has an active appointment for `[Service]` scheduled at the same time: `[Start] - [End]`.

This is a UI-level warning only; the secretary decides whether to approve, reject, or displace. Root-cause prevention at the booking submission layer is a future enhancement.

### 3.2 Account Owner & Patient Profile
- **Avatar / Initials**: Profile photo or generated initials badge.
- **Account Owner**: Full name, email, and phone number of the account holder.
- **Dependent Card** *(if applicable)*: If the appointment is for a registered dependent, a sub-card shows the dependent's name and relationship to the account owner.

### 3.3 Appointment Details
- **Requested Service**: Treatment name.
- **Requested Dentist**: Dentist prefix + full name (e.g., `Dr. Maria Santos`).
- **Desired Date & Time**: Formatted as `Jun 30, 2026 | 9:00 AM - 9:30 AM`.
- **Patient Date of Birth**: Shows the DOB of the actual patient (dependent DOB if a dependent, otherwise account owner DOB).

### 3.4 Patient Note
Free-text remark entered by the patient during the online booking wizard (displayed in a quoted callout box).

### 3.5 Reliability Counters
A summary strip showing the patient's history of completed, cancelled, no-show, and rescheduled appointments:
- **Completed** — number of appointments successfully finished.
- **Cancellations** — number of self-cancellations.
- **No-Shows** — number of recorded no-show occurrences.
- **Reschedules** — number of times they have rescheduled.

### 3.6 Patient Past History (Latest 5)
A scrollable list of up to 5 most recent appointments for the patient (or dependent), each showing:
- Date | Time Range
- Service name
- Status badge (color-coded: green = COMPLETED, red = CANCELLED/REJECTED, amber = others)

This is also the data source used for the overlap conflict detection above.

### 3.7 Doctor Daily Schedule Timeline
A vertical chronological timeline of all clinic slots for the requested dentist on the selected date (8:00 AM – 4:30 PM). Each slot shows:
- **Occupied slots**: Patient label and a colored status badge (APPROVED, PENDING, etc.).
- **Current request slot**: Highlighted in primary brand color with a `👉 CURRENT REQUEST` label.
- **Free slots**: Shown in dashed border with a `🟢 Free / Available` label.

### 3.8 Inline Modification Option (Editable View)
To support patient verification calls, the secretary can toggle the details section into an edit form before committing a decision. The edit flow is **service-first and cascading**:

- **Toggle**: An "Edit Details" button appears at the top of the appointment detail block. Clicking it shifts fields into an editable state.
- **Step 1 — Service Selection**: Active clinic services are rendered as **clickable pills or cards**. The currently selected/requested service is pre-selected.
- **Step 2 — Doctor Selection**: Based on the selected service, a filtered list of eligible dentists is rendered. Defaults to **"Any Doctor"** if no specific preference is needed. Selecting a specific doctor triggers a schedule fetch.
- **Step 3 — Date Picker**: A calendar showing **available dates dynamically based on the selected doctor's schedule**. Blocked/unavailable dates are greyed out.
- **Step 4 — Time Slot Picker**: Available time slots are rendered based on the selected doctor + date combination.
- **Step 5 — Secretary Note**: Editable textarea for the secretary to add an internal or patient-facing note.
- **Commit on Approve**: If details are modified, clicking "Approve" commits the updated service, doctor, date, and timeslot to the database via the existing `update_appointment_status_transaction` RPC.

---

## 4. Staged Review Form (State-First Pattern)
At the bottom of the details pane, the secretary configures and commits the decision:

- **Review Action Selection** (Button Group):
  - **Approve**: Marks appointment as approved.
  - **Reject**: Rejects the booking request.
  - **Displace**: Marks booking as displaced due to calendar or scheduling conflicts.

- **Reason / Remarks Dropdown** (Required for all states):
  - If **Approve** is selected: A `<Select>` dropdown of common approval reasons:
    - "Roster schedule cleared"
    - "Treatment room available"
    - "Staff slots balanced"
    - "Family batched reservation finalized"
    - "Other / Custom Remark..." → reveals a write-in `<Textarea>`
  - If **Reject** is selected: A `<Select>` dropdown of common rejection reasons:
    - "Doctor unavailable on requested slot"
    - "Clinic closed on requested date"
    - "Selected service requires pre-consultation"
    - "Double-booking conflict on slot"
    - "Other / Custom Reason..." → reveals a write-in `<Textarea>`
  - If **Displace** is selected: A `<Select>` dropdown of displacement reasons:
    - "Doctor emergency leave"
    - "Clinic power outage / maintenance"
    - "Overbooked schedule adjustments"
    - "Priority emergency treatment took precedence"
    - "Other / Custom Reason..." → reveals a write-in `<Textarea>`

- **"Finish Review" Action Button**:
  - Disabled until both a decision state and a non-empty reason/remark are selected.
  - Commits the staged action (Approve/Reject/Displace) with the inputted remarks to the server.
  - Updates the appointment status and writes a ledger entry to `appointment_status_history` via admin client (bypasses RLS for trusted server-side writes).
  - Clears the selection and refreshes the left-column table.

---

## 5. Implementation Notes

### Status Ledger (Audit Trail)
Every status transition writes an immutable row to `appointment_status_history` (`appointment_id`, `actor_role`, `previous_status`, `new_status`, `reason`, `created_at`). The insert is executed using `createAdminClient()` (service role key) to bypass Row-Level Security restrictions that would otherwise block the write.

### Overlap Detection
Overlap is computed client-side in a `useMemo` hook by comparing the selected pending appointment's `startTime`/`endTime` against all entries in `patientDetails.history`. Only active statuses (PENDING, APPROVED, CHECKED_IN, etc.) are considered; CANCELLED, REJECTED, and DISPLACED records are excluded.

### Date & Time Formatting
All dates and times are rendered using shared utilities:
- `formatShortDate(date)` → e.g., `Jun 30, 2026`
- `formatClinicTime(isoString)` → e.g., `9:00 AM`
