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
