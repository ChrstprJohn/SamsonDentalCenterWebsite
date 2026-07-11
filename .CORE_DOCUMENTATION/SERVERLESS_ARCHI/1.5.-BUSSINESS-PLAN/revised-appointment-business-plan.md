# Revised Appointment and Inquiry Business Plan
# Refined "Secretary-as-the-Brain" Architecture

This architecture simplifies the online patient experience while ensuring the Secretary has full control and visibility, using the offline software as the ultimate source of truth.

---

## 1. The Patient Request Flows (The Website Portal) - [FULLY IMPLEMENTED]

### A. Guest Booking (The "Fast Path")
*   **Step 1:** Guest enters contact details (Name, Phone, Email, DOB).
*   **Step 2:** Guest selects Service.
*   **Step 3:** System renders the Date calendar based on the combined working rosters of all doctors qualified to perform that specific service.
*   **Step 4:** Guest selects Date and Time Preference (Morning/Afternoon).
*   **Step 5:** Submission. System saves as `PENDING` with:
    *   `doctor_id` = `NULL`
    *   `doctor_assignment_source` = `'SYSTEM'` (Flag: "Any Available Doctor")

### B. Authenticated (Auth) Booking (The "Relationship Path")
*   **Step 1:** User logs in.
*   **Step 2:** User selects Service.
*   **Step 3:** User selects Doctor preference:
    *   **Option 1: "Any Available Doctor"**
    *   **Option 2: Specific Doctor**
*   **Step 4:** Date Calendar rendering:
    *   If **Specific Doctor** is chosen: Renders only dates where that specific doctor is rostered to work.
    *   If **"Any Available Doctor"** is chosen: Renders dates based on the combined rosters of all doctors qualified for the service.
*   **Step 5:** User selects Date and Time Preference (Morning/Afternoon).
*   **Step 6:** Submission. System saves as `PENDING` with:
    *   If specific doctor chosen: `doctor_id` = `[Doctor's UUID]`, `doctor_assignment_source` = `'USER'`.
    *   If "Any" chosen: `doctor_id` = `NULL`, `doctor_assignment_source` = `'SYSTEM'`.

---

## 2. The Secretary's "Bridge" Flow (The Confirmation)

When the Secretary opens a `PENDING` request on the dashboard, they see the pre-filled data. Here is the logic for handling confirmation:

### The "Approve/Confirm" Action (Modal / Form Panel)
1.  **Review Requested Data:** Secretary sees the requested Service, Date, Time Preference, and Doctor (if any).
2.  **Verify / Edit Details:**
    *   **Service & Date:** Secretary checks the offline software. If the date requested is unavailable/full, the Secretary selects a new date.
    *   **Doctor:** 
        *   If the request has a specific doctor (`'USER'`), it pre-fills the doctor field. The Secretary can keep or override it.
        *   If the request is for "Any" (`'SYSTEM'`), the doctor field starts blank. The Secretary **must** select a doctor from the filtered dropdown.
    *   **Time:** The Secretary manually enters/types the exact **Start to End Time** (e.g., `09:15 AM - 09:45 AM`) from the offline software.
3.  **Confirm:** Secretary clicks **[Confirm]**.
    *   **Result:** Status updates to `'CONFIRMED'`.
    *   **Result:** Automation triggers the confirmation notification (email/SMS) to the patient.

---

## 3. The Mirroring Flow (Walk-in / Phone Call)

Ensures walk-ins and phone calls receive the same automated notifications and reminder tracking.

*   **Step 1:** Secretary books the appointment directly in the Offline Software.
*   **Step 2:** Secretary opens the Website Dashboard and clicks the **"Quick-Add"** button.
*   **Step 3:** Secretary enters Patient Details and selects Service, Date, Doctor, and Exact Start/End Time.
*   **Step 4:** Secretary saves the form.
    *   **Result:** Status is set to `'CONFIRMED'` immediately (bypasses `PENDING`).
    *   **Result:** Automation triggers the confirmation email and queues the 48-hour/24-hour reminder countdown.

---

## 4. Summary of Logic for Development

| Workflow / User Type | Logic for "Doctor" Selection | Logic for "Date" Calendar |
| :--- | :--- | :--- |
| **Guest Booking** | Auto-set to `NULL` (Mapped as `'SYSTEM'`). | Combined availability of all doctors who perform the Service. |
| **Auth Booking (Any)** | User selects "Any" -> `NULL` (Mapped as `'SYSTEM'`). | Combined availability of all doctors who perform the Service. |
| **Auth Booking (Specific)** | User selects specific doctor -> `doctor_id` (Mapped as `'USER'`). | Only dates where that specific doctor is rostered to work. |
| **Secretary Edit / Confirm** | Can pick any doctor. The dropdown dynamically filters to show doctors rostered on the selected Date. | Roster-based calendar: highlights only dates where any doctor is rostered for the selected service (same as Guest/Auth-Any booking). Changing Date refreshes the rostered doctors list. |

---

## 5. Reschedule, Cancellation, & Checkout Actions

To maintain parity with other clinic administrative actions:

### A. User Reschedule Requests
1.  **Submit Reschedule Request:** The user selects a new proposed Date and Preferred Time of Day (Morning/Afternoon).
2.  **Review & Confirm:** The secretary checks the offline software, updates it, and approves the request on the website dashboard by updating the record with the confirmed Date, Doctor, Start to End Time, and changing status to `'CONFIRMED'`.

### B. User Cancellation Requests
1.  **Submit Cancel Request:** The user cancels their appointment. Status updates to `'CANCELLATION_PENDING'`.
2.  **Review & Confirm:** The secretary records the cancellation in the offline software and approves the cancellation on the website (updating status to `'CANCELLED'`).

### C. Checkout Action
*   **Thank You Notification:** Triggered immediately when the secretary performs the manual **Check-out** action in the portal, thanking the patient for their visit.

---

## 6. Final Operational Rules

*   **One Source of Truth:** The Offline Software is the only place for real-time slot management.
*   **Website as Record:** The website is a portal to collect intent and facilitate communication (Notifications/Reminders).
*   **Status Lock:** No automated patient messaging (emails/SMS/reminders) occurs while an appointment is `'PENDING'` or `'CANCELLATION_PENDING'`. Messages only send upon transitioning to `'CONFIRMED'` or `'CANCELLED'`.
*   **Flexibility:** The Secretary has complete authority to override and change anything (Date, Doctor, Time, Service) during the confirmation step, regardless of what the user originally requested.
