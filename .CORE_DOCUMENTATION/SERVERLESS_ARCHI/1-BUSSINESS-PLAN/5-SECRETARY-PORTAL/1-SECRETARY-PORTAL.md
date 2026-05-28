# Secretary Portal

## Overview

The secretary portal is the private workspace for clinic staff responsible for reviewing, approving, and managing patient appointments. All destructive or state-changing actions require a **confirmation popup** before execution.

---

## Portal Pages & Navigation

| Page | Description |
|---|---|
| **Dashboard** | Prioritizes pending requests and upcoming appointments |
| **Pending Appointments** | Queue of appointments awaiting review |
| **Approved Appointments** | Approved appointments scheduled for future dates |
| **Appointment History** | Past, completed, cancelled, and rejected appointments |
| **Booking Requests (Grouped)** | Grouped view of batch family/dependent booking requests |
| **Check-in / Check-out** | Track patient arrival and departure |
| **Invoice Management** | View invoices generated after appointment completion |
| **Audit Log** | Read-only log of all actions performed |
| **Email Log** | View all system-sent emails |
| **Profile** | View and edit personal information |

---

## Dashboard

- Highlights **pending requests** first (requiring attention).
- Shows **upcoming appointments** for the current and next day.
- Provides quick-action shortcuts for the most common tasks.

---

## Appointment Review

### Pending Appointments
- Lists all appointments in **Pending** status.
- Each row shows: patient name, service, requested date/time, booking note, and reliability indicators.
- Available actions:
  - **Approve** — opens popup with predefined reasons or custom input.
  - **Reject** — opens popup with predefined reasons or custom input.
  - **Displace** — marks slot as invalid with displacement reason.

### Grouped Booking Requests
- When a user books multiple appointments in one session (self + dependents), they are displayed as a **grouped set**.
- Secretary can act on each row independently within the group.
- A **"Finalize Group"** action sends all queued notifications after all rows have been decided.

### Upcoming Appointments
- Lists all **Approved** appointments.
- Available actions:
  - **Reschedule** — requires a reason; opens confirmation popup.
  - **Cancel** — requires a reason; opens confirmation popup.
  - **Mark Completed** — marks appointment as done; triggers invoice generation.

---

## Confirmation Popup Requirement

All of the following actions must be confirmed via a **confirmation popup** before execution:

| Action | Popup Includes |
|---|---|
| Approve | Select/enter approval reason |
| Reject | Select/enter rejection reason |
| Cancel | Enter cancellation reason |
| Reschedule | Enter reschedule reason + new time selection |
| Mark Completed | Confirm patient attended |

---

## Check-in / Check-out Tracking

- Each approved appointment has a **Check-in** and **Check-out** button.
- Check-in records the patient arrival time.
- Check-out records the departure time.
- These records feed into audit logs and no-show detection logic.

---

## Invoice Management

- Invoices are **auto-generated** when:
  - The appointment time passes (invoice created as draft).
  - Or when a secretary manually clicks "Mark Completed".
- Draft invoices have a **"Checkout"** button to add additional services before finalization.
- Secretaries can view, review, and finalize invoices.
- No online payment gateway — invoicing is for **formal digital record-keeping only**.

---

## Workflow Conflict Handling

- **Optimistic locking** is used: if two secretaries attempt to act on the same appointment simultaneously, the first succeeds and the second receives a conflict error.
- The secretary dashboard always fetches **fresh data** (no client-side caching) to prevent confusion.

---

## Audit Log

- Read-only log of all actions taken in the portal.
- Entries include:
  - Actor (secretary name or admin)
  - Timestamp
  - Action type (approve/reject/cancel/reschedule/complete)
  - Reason
  - Target appointment
- Only **final decisions** are logged — not intermediate or draft states.

---

## Email Log

- View all emails sent by the system (notifications, OTPs, confirmations).
- Read-only; no ability to resend or delete from this view.

---

## Profile

- View and edit personal information (name, contact details).
- Secretary accounts are created and managed by admins.

---

## Secretary Role Capabilities Summary

| Capability | Allowed |
|---|---|
| View pending appointments | ✅ |
| Approve appointments | ✅ (with reason + confirmation) |
| Reject appointments | ✅ (with reason + confirmation) |
| Cancel appointments | ✅ (with reason + confirmation) |
| Reschedule appointments | ✅ (with reason + confirmation) |
| Mark appointments as completed | ✅ (with confirmation) |
| Check-in / Check-out patients | ✅ |
| View invoices | ✅ |
| Finalize draft invoices | ✅ |
| View audit logs | ✅ |
| View email logs | ✅ |
| Edit own profile | ✅ |
| Create/manage other accounts | ❌ (admin only) |
