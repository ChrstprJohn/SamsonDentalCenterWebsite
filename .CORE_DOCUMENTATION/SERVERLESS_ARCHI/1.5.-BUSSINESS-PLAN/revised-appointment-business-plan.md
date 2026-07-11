# Revised Appointment and Inquiry Business Plan

## Core Philosophy
We are shifting the online scheduling architecture from a **dynamic real-time slot inventory system** to a **simplified request and manual synchronization flow**. The clinic uses an offline system to manage doctor schedules and slot availability (the "One Source of Truth"). The website functions as an inquiry/booking-request portal and a notification agent.

---

## 1. The Online Request Flow (The "Request-to-Confirm" Loop) - [COMPLETED / IMPLEMENTED]
This flow turns a "wish" into a "confirmed appointment." Both **Authenticated** and **Unauthenticated (Guest)** entry points are modified and fully supported:

### Step 1: User Request (Authenticated & Unauthenticated)
- **Authenticated Flow**: Registered users book via their portal. Their profile details (Name, Contact, etc.) are automatically mapped, and they select **Service, Date, Doctor, and Time Preference (Morning/Afternoon)**.
- **Unauthenticated (Guest) Flow**: Visitors can book without logging in. They fill out their patient/contact details (Name, Email, Phone, Date of Birth) along with **Service, Date, Doctor, and Time Preference (Morning/Afternoon)**.
- User submits the form.

### Step 2: Database Entry
- Your website saves this as a record with status: `'PENDING'`.

### Step 3: Secretary Review
- Secretary opens the Secretary Dashboard and sees the new `'PENDING'` request.

### Step 4: The Offline Check (The "Brain")
- Secretary opens their Offline Software.
- Secretary looks at the clinic’s actual, real-time availability for that date.

### Step 5: The Sync & Approve (The "Bridge")
- Secretary books the appointment in the Offline Software (e.g., 9:15 AM).
- Secretary goes to your Website Dashboard, clicks the **[Approve]** button on that request.
- Secretary enters the **exact time** (e.g., 9:15 AM) and **duration** from the offline software.
- Secretary hits **Confirm**.

### Step 6: Automation Trigger
- Website updates status to `'CONFIRMED'`.
- **Notification Engine**: Sends "Appointment Confirmed" message to patient.
- **Reminder Engine**: Sets up the 48-hour/24-hour reminder countdown for that specific date and time.

---

## 2. The Walk-in / Phone Call Flow (The "Mirror" Loop)
This flow ensures walk-ins and phone bookings get the same automated care as online bookers.

### Step 1: Booking
- Patient calls or walks in.
- Secretary books the appointment only in the Offline Software.

### Step 2: The Mirroring
- Secretary immediately opens your Secretary Dashboard.
- Secretary clicks the **"Quick-Add"** button.
- Secretary enters the **Patient Name, Service, Date, Doctor, and Time** (copying what they just typed in the offline software).

### Step 3: Automation Trigger
- Secretary hits **Save/Confirm**.
- Website sets status to `'CONFIRMED'`.
- **Notification Engine**: Immediately triggers the "Appointment Confirmed" message.
- **Reminder Engine**: Sets up the 48-hour/24-hour reminder countdown.

---

## 3. Summary of Roles & Logic

| Feature | Online Request | Walk-in / Phone Call |
| :--- | :--- | :--- |
| **Where it starts** | Your Website | Offline Software |
| **Who is the "Boss"?** | Offline Software | Offline Software |
| **Secretary's Action** | Approve + Enter Time | Quick-Add + Enter Time |
| **Goal** | Get to `'CONFIRMED'` status | Get to `'CONFIRMED'` status |
| **Result** | Automation Starts | Automation Starts |

---

## 4. Important Operational Rules

- **The "CONFIRMED" Status is Holy**: No notifications should ever be sent while an appointment is `'PENDING'`. Only when the secretary has finished the "Mirror/Sync" process and the record is `'CONFIRMED'` should your system start interacting with the patient.
- **No Time-Slot Competition**: Since you are removing the specific time-slot picker from the online user form (keeping it just Date + Morning/Afternoon preference), you will never have a database collision or a "Slot taken" error.
- **One Source of Truth for Time**: The time is always defined by the Offline Software first. Your website is just the "notification record" of that truth.
- **No Website Timeslot Rendering for Secretary**: The Secretary Dashboard will not calculate, fetch, or display available timeslots. The secretary has complete control to type or select any custom start time and duration based on their visual verification of the offline software calendar. The website will trust the secretary's inputs without performing slot availability checks.

---

## 5. Reschedule, Cancellation, & Checkout Actions

To maintain parity with the rest of the clinic's administrative needs:

### A. User Reschedule Requests
1. **Submit Reschedule Request**: The user selects a new proposed Date and Preferred Time of Day (Morning/Afternoon).
2. **Review & Confirm**: The secretary checks availability in the offline system, updates the offline software, and then approves the request on the website by updating the record with the confirmed Doctor, Time, and changing status to `'CONFIRMED'`.

### B. User Cancellation Requests
1. **Submit Cancel Request**: When a user cancels, the status updates to `'CANCELLATION_PENDING'`.
2. **Review & Confirm**: The secretary records the cancellation in the offline software and approves the cancellation on the website (updating status to `'CANCELLED'`).

### C. Checkout Action
- **Thank You Notification**: Triggered immediately when the secretary performs the manual **Check-out** action in the portal, thanking the patient for their visit.
