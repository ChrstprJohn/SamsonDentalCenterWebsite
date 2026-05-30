# Doctor Portal

## Overview

The doctor portal is the private workspace designed specifically for clinic doctors. It strips away financial features (billing, prices, payment gateways) and administrative overhead (processing pending requests, resolving scheduling rules), focusing purely on **clinical reality and upcoming schedule visibility**.

---

## Portal Pages & Navigation

| Page | Description |
|---|---|
| **Dashboard** | Focuses on today's appointments and the patient currently waiting. |
| **My Schedule (Upcoming)** | A filtered view of Approved appointments assigned exclusively to the logged-in doctor. |
| **Clinical Session** | The active workspace to review notes and select actual services provided. |
| **Patient History** | A read-only view of a patient's past appointments and treatments. |
| **Profile** | View and edit personal information (name, specialties, etc.). |

---

## Dashboard

- Highlights the **Next Patient** (specifically looking for appointments with `Checked-In` status).
- Shows a quick timeline of the day's remaining appointments.
- Stripped of pending requests, approval buttons, or general clinic metrics.

---

## My Schedule (Upcoming Appointments)

- A calendar or list view that strictly filters appointments where `doctor_id === session.user.id`.
- Doctors cannot see other doctors' schedules to maintain privacy and reduce UI clutter (unless an Admin overrides this logic later).
- Doctors cannot cancel or reschedule appointments directly from this view (if a change is needed, they inform the secretary to process it with proper notes and audit trails).

---

## Workspace: The Clinical Session

When a patient is `Checked-In`, the doctor can open the **Clinical Session** view for that appointment. 

### 1. Pre-Treatment Information
- Displays the user's requested services from the booking wizard.
- Displays the user's booking notes (e.g., "Tooth aches on the right side").

### 2. Treatment Submission 
- The doctor selects the **Actual Services Performed**.
  - Example: A patient requested a General Consultation. The doctor selects: Consultation + X-Ray + Amalgam Filling.
- The doctor can write **Clinical Notes** (both global clinical notes, and optional **service-specific comments** for each individual service performed).
- The doctor clicks **Submit Treatment**.
- **System Action:** 
  1. The appointment status is changed to `Treatment Rendered`.
  2. A **Draft Invoice** is automatically created on the backend carrying the *services* the doctor selected.
  3. The Secretary Front Desk is automatically notified that the patient is ready for Check-Out.

---

## Why Doctors Do Not Handle Invoicing

This portal is intentionally restricted from displaying prices, totals, or payment methods. 
1. **Accuracy:** Doctors are tasked with documenting the literal clinical procedure, not the financial charges. 
2. **Speed & Efficiency:** Selecting checkboxes for "X-Ray" is faster than typing out prices and applying HMO health plan discounts.
3. **Role Separation:** The receptionist handles the financial responsibility during the final Check-Out phase.

---

## Profile

- View and update personal details.
- Allows updating qualifications/specialties, which syncs to the public booking wizard (if displayed).
- (Optional later feature) Manage their personalized working schedule / availability overrides.