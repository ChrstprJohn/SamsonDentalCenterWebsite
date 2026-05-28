# Booking — User Booking Wizard

## Overview

The booking system uses a single consolidated **User Booking Wizard**. All prospective bookers are directed through the mandatory user login/registration flow first before entering the wizard.

The wizard is tailored for authenticated patients, letting them book appointments for themselves or seamlessly manage and book slots for family members (dependents).

---

## React Architecture

| File | Role |
|---|---|
| `UserBookingWizard.jsx` | Main wizard shell and step orchestration |
| `useUserBooking.js` | Custom hook managing state, API calls, and validation logic |
| `UserServiceStep.jsx` | Step 1 — Service selection |
| `DateTimeStep.jsx` | Step 2 — Schedule / slot selection |
| `UserOtherInfoStep.jsx` | Step 3 — Patient details |
| `UserReviewStep.jsx` | Step 4 — Review and submit |

---

## Wizard Steps

Progress is displayed as a breadcrumb trail: **Service → Schedule → Details → Review**

### Step 1 — Service Selection (`UserServiceStep`)

- Displays all active clinic services (General and Specialized).
- User selects the service they want to book.
- Selected service determines available time slot durations and doctor assignment logic.

--- 

### Step 2 — Schedule Selection (`DateTimeStep`)

- **Doctor Selection:** Displays a dropdown / cards selection for Doctor preference.
  - **Default:** "Any Doctor" (System automatically aggregates the schedules of all active doctors).
  - **Specific:** User selects a preferred doctor (e.g., Dr. Smith).
- **Dynamic Calendar Availability:**
  - The calendar enables/disables days dynamically:
    - If "Any Doctor", days are enabled if *at least one* doctor works that day.
    - If a specific doctor is picked, only their working days are enabled.
- **Dynamic Timeslots:**
  - When a date is selected, the system calculates free ranges and mathematically slices them based exactly on the **Service Duration** (e.g., a 30-minute service creates slots at 8:00, 8:30, 9:00).
  - If "Any Doctor" is used and multiple doctors are free at the same time, the system will *implicitly* assign the least busy doctor to that timeslot behind the scenes.
- **Selection Data:** User picks a slot. The `startTime` is set, and the `endTime` is precisely `startTime + serviceDuration`. This metadata, along with the assigned doctor ID, carries over to the next step.
- Note: Slot holding is intentionally omitted to optimize booking speed. Validation happens purely upon final submission.

---

### Step 3 — Patient Details (`UserOtherInfoStep`)

The patient specifies who the appointment is for via a single, unified flow:

- Displays a **Patient Dropdown** to select who the appointment is for.
- **Default Option:** The authenticated account user (Book for Self).
- **"Add Family Member" Option:** If selected, opens a form to create a new dependent on-the-fly.
  - Required fields: First name, Middle name, Last name, Suffix, Birthday, Relationship, Sex, Optional note.
  - Adding the family member instantly links them to the user's account for future bookings.

---

### Step 4 — Review & Submit (`UserReviewStep`)

- Displays a full summary of the booking: service, date/time, patient details.
- User must accept **Terms of Service and Privacy Policy** before submitting.
- On submit, the wizard calls `POST /appointments/submit-wizard` to perform **Final Validation**.
  - **Final Validation:** The primary validation needed is checking for **double bookings**. The system checks if the time slot is still available. If someone else has already booked the slot, the booking is rejected, and the user is prompted to return to Step 2 and pick a new time.
  - *(Note: Other tentative validations like overlapping schedules or quotas may be added later, but double-booking prevention is the core requirement).*
  
---

## Atomic Submission

To strictly prevent double bookings, the `submit-wizard` endpoint performs all of the following **atomically**:
1. Checks for slot availability to ensure the time is still free (Main Validation).
2. Registers the appointment under the chosen patient profile (state becomes Pending).
3. Triggers async staff notifications.

If the slot is already taken by someone else or any step fails, the entire transaction is rolled back.

---

## Q&A — Common Edge Cases

**Q: What if a user leaves the wizard open for a long time?**  
A: No slot is held. Availability is revalidated at submission; if the slot was taken, the user is returned to Step 2 to pick a new time.

**Q: What if the user double-submits or refreshes during submit?**  
A: `POST /appointments/submit-wizard` is treated as idempotent per user + patient + service + slot. Duplicate submits return the existing Pending appointment.

**Q: What if service duration or doctor availability changes mid-wizard?**  
A: Final submission revalidates against the latest service definition and doctor schedule; if mismatched, submission fails and the user selects a new time.

**Q: What if booking is for a dependent?**  
A: The appointment is attached to the dependent patient profile, but notifications go to the primary account holder and are personalized.

---

## Booking Closed / Maintenance Mode

- If online booking is turned off from clinic config, the booking entry point shows a **closed page** with a message and no booking actions.
- Admins can toggle booking open/closed and set a custom maintenance message from the clinic config panel.
