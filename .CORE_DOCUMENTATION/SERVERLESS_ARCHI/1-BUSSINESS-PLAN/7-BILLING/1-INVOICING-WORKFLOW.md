# Billing & Invoicing Workflow

## Overview

To ensure accuracy, prevent errors, and maintain a clean audit trail, the invoicing process follows a **Collaborative Workflow**. This strictly separates **clinical responsibility** (the doctor) from **financial responsibility** (the secretary/receptionist).

Doctors dictate the clinical truth (what was done). Secretaries dictate the financial truth (what was paid).

---

## The Collaborative Workflow

### 1. Check-In (Secretary Action)
- Patient arrives at the clinic.
- Secretary locates the **Approved** appointment and clicks **Check-In**.
- Appointment status updates to **Checked-In**.
- Patient is directed to wait for the doctor.

### 2. Clinical Session & Treatment Submission (Doctor Action)
- The doctor examines and treats the patient.
- Once the procedure is finished, the doctor accesses their portal.
- On the appointment view, the doctor selects the **Actual Services Performed**.
  - Example: A patient was booked for a "Consultation", but the doctor ended up performing "Consultation", "X-Ray", and "Cavity Filling".
- The doctor clicks **Submit Treatment**.
- Appointment status updates to **Treatment Rendered**.
- **System Action:** A **Draft Invoice** is automatically generated containing the services selected by the doctor.

### 3. Check-Out & Finalization (Secretary Action)
- Back at the front desk, the patient is ready to pay and leave.
- The Secretary sees the appointment now set to **Treatment Rendered** and the **Check-Out** button is unlocked.
- The Secretary clicks **Check-Out**.
- A summary modal opens showing the **Draft Invoice** (the list of services strictly reported by the doctor).
- The Secretary is responsible for the financial details:
  - Inputting the **Price** for each service.
  - Adding any applicable **Discounts**.
  - Selecting the **Payment Method** (Cash, Credit Card, HMO, etc.).
- The Secretary clicks **Finalize Invoice**.
- Appointment status updates to **Completed**.
- The invoice is saved as a read-only official financial record.

---

## Why This Workflow?

1. **Clinical Accuracy:** Only the doctor knows exactly what happened in the dental chair. Receptionists shouldn't guess or assume based on the initial booking.
2. **Financial Precision:** Doctors are kept away from math, discounts, and payment portals. Secretaries handle the money without altering the medical reality.
3. **Audit Trail:** The system clearly tracks:
   - What the doctor prescribed (Clinical Record).
   - How much was charged and paid (Financial Record).

---

## Edge Cases

- **No-Show:** If a patient never arrives, the secretary can directly mark the Approved appointment as a **No-Show**. No draft invoice is created.
- **Adjustments needed after submission:** If the doctor made a mistake in their submission, the secretary may either flag it (if a flag system is needed) or verbally confirm and the doctor can update the draft before the secretary finalizes it. Once finalized, the invoice is immutable.