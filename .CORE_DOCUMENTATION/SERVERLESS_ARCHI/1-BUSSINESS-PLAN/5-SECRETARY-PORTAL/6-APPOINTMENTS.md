# Secretary Portal: Appointments Directory

**Route**: `/secretary/appointments`

This page is a comprehensive search directory listing all appointments recorded in the clinic system (past, present, and scheduled).

---

## 1. Directory Table Filters
- **Status Filter**: Multi-select dropdown filtering by:
  - `PENDING`
  - `APPROVED`
  - `REJECTED`
  - `CHECKED_IN`
  - `TREATMENT_RENDERED`
  - `COMPLETED`
  - `CANCELLED`
  - `DISPLACED`
  - `NO_SHOW`
- **Date Range Picker**: Filter appointments by target date ranges.
- **Search Bar**: Text search matching patient name (including dependent profiles), email, phone, or assigned doctor name.

---

## 2. Table Structure & Columns
- **Patient**: Patient's full name. If booked for a dependent, displays: `Patient Name (Dependent: Primary Holder Name)`. If Guest booking: `Patient Name (Guest)`.
- **Service**: Service name.
- **Doctor**: Dentist assigned to slot.
- **Date & Time**: Date and slot details.
- **Source**: Indicates `SELF_BOOKED` (User Portal) or `STAFF_CREATED` (Secretary Wizard).
- **Status**: Styled status badge.

---

## 3. Detail Pane (Slide-Over / Modal)
Clicking any appointment row opens a details sidebar/slide-over displaying:
- **Full History Log**: Track status updates from the `appointment_status_history` table (shows actor role, previous/new status, timestamp, and justification reason).
- **Invoicing Details**: Links to finalized invoice receipts if the appointment is `COMPLETED`.
- **Reschedule / Cancel Controls**: Active appointments (`APPROVED` or `CHECKED_IN`) can be cancelled or rescheduled directly from this view, requiring a justification note.
