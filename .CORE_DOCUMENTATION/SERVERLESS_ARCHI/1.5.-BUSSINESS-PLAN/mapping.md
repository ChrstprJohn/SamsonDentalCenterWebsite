# Booking Flow Mapping & Validation Rules (Offline-First Calendar Workflow)

This document outlines the simplified validation, filtering, and schedule mapping rules. The **offline clinic calendar** is the source of truth; the website serves primarily as an entry point for requests and a hub for automated notifications.

---

## What to Keep vs. What to Abandon (Do Not Delete Tables)

### Doctor Management
* **Keep:**
  * The database list of doctors (e.g., in the `users` table with `role = 'DOCTOR'`).
  * The ability to assign a doctor to an appointment.
  * Storing doctor details for email/SMS automated notifications (e.g. "Your appointment is with Dr. [Name]").
  * The doctor selection dropdown in the secretary booking, conversion, and reschedule portals.
* **Abandon (Do Not Enforce or Validate):**
  * **Doctor schedules and shifts:** Disregard checking whether the booking falls inside a doctor's weekly shift or custom day overrides.
  * **Doctor-service relationships:** Stop filtering doctors in dropdowns based on whether they perform the selected service. Any doctor can be selected for any service.

### Service Management
* **Keep:**
  * Active/bookable services in the database.
  * Attaching services to bookings/inquiries.
  * Dynamic service durations (to calculate estimated appointment lengths).
* **Abandon:**
  * Doctor-service mapping constraints.

---

## PART 1: Public / Landing Page / Patient Side Flows (Guest Inquiry)

These rules apply to the public-facing website where guests request and reschedule appointments.

### 1. Public Inquiry Form
* **Status:** **FIXED**
* **Change Details:** Updated [use-contact-section.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/hooks/landing/use-contact-section.ts) to populate `availableDates` locally with all calendar dates of the month except Sundays, completely bypassing `getAvailableDaysAction()` which restricts dates by doctor schedules.
* **Result:** Patients can select any clinic day without date validation restrictions or shift limitations.
* **Test Verification:** Updated [use-contact-section.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/hooks/landing/use-contact-section.spec.ts) and verified tests pass.

### 2. User Chat Reschedule Flow
* **Status:** **FIXED**
* **Change Details:** Updated [chat-intake-workflow.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/views/chat/sub-components/chat-intake-workflow.tsx) to set date availability locally by excluding Sundays, bypassing the `scheduler.availableDates` check.
* **Result:** Patients can request a reschedule to any day except Sunday.


---

## PART 2: Secretary Portal / Internal Clinic Flows

These rules apply to the internal clinic portal where the secretary manages, converts, and schedules bookings.

### 1. Secretary Booking Form (Calendar View)
* **Status:** **FIXED**
* **Change Details:** Modified [use-secretary-book-appointment.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/secretary/use-secretary-book-appointment.ts) to remove all reactive scheduler calls (`loadAvailableDates`, `loadDoctorsForDate`, `loadAvailableSlots`) and stubbed scheduler lists to bypass constraints.
* **Result:** The booking console sidebar in `/secretary` and `/secretary-v2` now lets the secretary select any active doctor, date, and manually enter start/end times directly with native input fields.
* **Test Verification:** Verified unit tests in [use-secretary-book-appointment.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/secretary/use-secretary-book-appointment.spec.ts) pass successfully.


### 2. Inquiry Queue & Conversion Flow (Inquiries tab)
* **Status:** **FIXED**
* **Change Details:** Modified [use-secretary-inquiries-queue.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/secretary/use-secretary-inquiries-queue.ts) to query all active/hidden doctors using `getDoctorsAction({ includeHidden: true })` and map them to `availableDoctors` directly instead of calling `loadDoctorsForDate()` with filters.
* **Result:** In the `secretary-v2/pending` request edit panel, when a secretary edits the schedule, they can choose from **all** doctors in the system, bypassing doctor-service and date-specific limitations.
* **Test Verification:** Updated [use-secretary-inquiries-queue.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/secretary/use-secretary-inquiries-queue.spec.ts) to mock `getDoctorsAction` and verified tests pass successfully.


### 3. Pending Appointment Requests Editing (Appointment Requests tab)
* **Status:** **FIXED**
* **Change Details:** Modified [use-secretary-pending-requests.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/secretary/use-secretary-pending-requests.ts) to query all active/hidden doctors using `getDoctorsAction({ includeHidden: true })` instead of filtering them via `getAvailableDoctorsForDateAction()`.
* **Result:** In the request edit panel, when a secretary edits details, they can choose from **all** doctors in the system, bypassing doctor-service limits.
* **Test Verification:** Updated [use-secretary-pending-requests.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/secretary/use-secretary-pending-requests.spec.ts) to mock `getDoctorsAction` and verified tests pass successfully.

### 4. Rescheduling Flows (Two Different UIs)

#### A. Appointment Detail Pane Rescheduling (Used in Appointments List tab)
* **Status:** **FIXED**
* **Change Details:** Modified [use-secretary-appointments.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/secretary/use-secretary-appointments.ts) and [appointment-reschedule-form.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/sub-components/appointment-reschedule-form.tsx) to completely bypass scheduler availability dates, doctor, and slot limitations, replacing them with global selections.
* **Result:** Detail Pane rescheduling now uses standard `<input type="date">`, `<input type="time">` start/end fields, and a dropdown list of all active doctors.
* **Test Verification:** Verified unit tests in [use-secretary-appointments.spec.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/hooks/secretary/use-secretary-appointments.spec.ts) pass successfully.

#### B. Sidebar Appointment Details Rescheduling (Used in Booking Calendar view)
* **Status:** **FIXED** (Already correctly unrestricted).

### 5. Doctor Directory Screen
* **Status:** **FIXED**
* **Change Details:** Removed the "Services Mapped" selector block from [doctor-edit-form.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/doctors/components/doctor-edit-form.tsx) and updated [doctor-read-pane.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/doctors/components/doctor-read-pane.tsx) to label "Clinician Shifts" as "(informational only)".
* **Result:** Hides irrelevant service mappings and clarifies shifts are for reference only.


---

