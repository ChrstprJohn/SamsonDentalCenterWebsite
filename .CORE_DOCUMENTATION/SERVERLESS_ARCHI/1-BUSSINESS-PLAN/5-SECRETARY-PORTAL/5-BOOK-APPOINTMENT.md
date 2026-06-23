# Secretary Portal: Book Appointment

**Route**: `/secretary/book`

This page is a dedicated booking wizard used by secretaries to schedule appointments manually for phone calls or walk-in patients.

It is implemented as a **Single, Full-Width Stepper Page** (not a split-pane layout) to focus attention and enforce a strict, logical step sequence.

---

## 1. Stepper Workflow

```
[ Step 1: Patient Identity ] ──➔ [ Step 2: Service & Schedule ] ──➔ [ Step 3: Confirmation ]
```

---

## 2. Step 1: Patient Identity (Search-First Verification)
The secretary must check if the patient already has an active account before selecting scheduling details.

- **Search Bar**: Input fields matching against Name, Email, or Phone.
- **Select Matching User**: Selecting a patient automatically populates and locks/disables their profile fields to maintain data integrity, proceeding to Step 2.
- **New Guest Option / Create Patient**: If no record matches, the secretary proceeds as a guest. Fields remain editable:
  - **First Name** (Required)
  - **Middle Name** (Optional)
  - **Last Name** (Required)
  - **Suffix** (Optional)
  - **Phone Number** (Required)
  - **Email Address** (Optional - skipped if the patient doesn't use email).
  - Clicking "Continue" proceeds to Step 2.

---

## 3. Step 2: Service & Schedule Selection
- **Service Selection**: Dropdown to select the service.
- **Doctor Preference**: Dropdown list of doctors or "Any Doctor" options.
- **Date & Time Picker**: Live calendar date & slot availability picker.

---

## 4. Step 3: Review & Submit
- Displays details of the resolved patient (linked profile vs. guest details) along with selected service, doctor, date, and time.
- **Submit**: Registers the appointment and marks it as **auto-approved** (`APPROVED`), bypassing the pending queue.
- If an email was provided, triggers an appointment confirmation email.
- Displays success confirmation and options to return to Dashboard or book another appointment.
