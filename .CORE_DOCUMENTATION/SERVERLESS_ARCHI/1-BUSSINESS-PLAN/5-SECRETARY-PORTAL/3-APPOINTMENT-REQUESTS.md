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
│ │ Row: Jane Doe         │ │ │ Patient: Jane Doe      │ │
│ ├───────────────────────┤ │ │ Service: Cleaning      │ │
│ │ Row: John Smith       │ │ │ Date: 2026-06-25       │ │
│ └───────────────────────┘ │ │ Note: Has tooth pain   │ │
│                           │ │ ────────────────────── │ │
│                           │ │ Action Status:         │ │
│                           │ │ ( ) Approve ( ) Reject │ │
│                           │ │ ( ) Displace           │ │
│                           │ │                        │ │
│                           │ │ Reason / Remarks:      │ │
│                           │ │ [                      ] │ │
│                           │ │                        │ │
│                           │ │ [Finish Review]        │ │
│                           │ └────────────────────────┘ │
└───────────────────────────┴────────────────────────────┘
```

---

## 2. Left Column (Requests Table)
Lists individual pending appointments.

### Columns
- **Patient**: Patient name.
- **Service**: Requested service.
- **Requested Date & Time**: Target date and time slot.
- **Status Indicator**: `PENDING` badge.

---

## 3. Right Column (Details Pane)
Shows full detail for the selected request and a staged review form to finalize decisions without instant popup modals.

### Fields
- **Patient Details**: Full Name, Age/DOB, Phone, Email, and relationship details (if booked for a dependent).
- **Service & Doctor**: Requested treatment name and assigned dentist.
- **Scheduled Time**: Requested date, start/end times.
- **Doctor Daily Schedule Timeline**: A full visual timeline of all daily clinic slots (e.g., 8:00 AM to 5:00 PM) for the requested dentist on the selected date. It displays which slots are occupied (with patient name), which slots are free/blank, and clearly highlights the specific slot of the current pending request.
- **Patient Note**: User remarks inputted during the wizard booking.
- **Reliability Counters**: 
  - Number of previous cancellations.
  - Number of previous no-shows.
  - Number of previous reschedules.

---

## 4. Staged Review Form (State-First Pattern)
At the bottom of the details pane, the secretary configures and commits the decision:

- **Review Action Selection** (Radio Button Group / Tab Selector):
  - **Approve**: Flag to mark appointment as approved.
  - **Reject**: Flag to reject the booking request.
  - **Displace**: Flag to mark booking as displaced due to calendar/scheduling conflicts.
- **Reason / Remarks Input**:
  - If **Approve** is selected: A dropdown list of predefined approval reasons (e.g., "Slot is available", "Patient details verified") or a custom text input field.
  - If **Reject** is selected: A mandatory text input field to explain the rejection justification.
  - If **Displace** is selected: A mandatory text input explaining why the slot has been invalidated (e.g., dentist calling out sick).
- **"Finish Review" Action Button**:
  - Commits the staged action (Approve/Reject/Displace) with the inputted remarks to the server in a single transaction.
  - Triggers a confirmation check before execution.
  - Clears selection and refreshes the left-column table.
