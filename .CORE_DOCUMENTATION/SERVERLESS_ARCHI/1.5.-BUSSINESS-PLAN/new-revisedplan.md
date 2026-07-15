# Booking Flow Strategy & Notification Rulebook

## 📋 Notification Channel Rulebook

This notification strategy pushes digital/web features (like the async web portal/chat) to the free email channel, controls SMS API credit usage, and gives the secretary complete flexibility when managing patients in-person or on the phone.

### 1. Online Guest Bookings
* **Primary Channel:** Email only (100% free).
* **The Workflow:** The system handles everything automatically. The patient gets an email confirmation containing the secure link to the Web Chat/Management page (`/manage?token={token}`).
* **The Backup:** The form still collects their phone number. If the patient goes silent on email, the secretary can pick up the clinic's physical phone and text/call them manually.

### 2. Manual Bookings (Phone Calls & Walk-ins)
* **Primary Channel:** Secretary's Choice.
* **The Workflow:** Because the secretary is already talking to the patient, they can ask: *"Would you like a confirmation sent to your email or text?"*
* **The Dashboard Options:**
  * **Email (Free):** Sends the automated email with the Web Chat link.
  * **SMS (Paid Credit):** Sends a plain 160-character text confirmation via API with **no link**, telling them to call the clinic if they need changes.
    * *Offline Handling:* The secretary still inputs manual bookings on the dashboard to trigger the initial automated SMS. However, since the text contains no web link, the patient cannot use the Web Management Portal (Flow 3) for changes. All reschedules or cancellations are done offline (patient call/SMS) and updated manually by the secretary.
  * **None:** Sends nothing (perfect for walk-in patients currently sitting in the clinic).

---

## 🌐 Flow 1: Online Guest Booking (The "Waitlist")
Guests booking via the website are treated as inquiries. This prevents double-booking against the offline calendar.

* **Submission:** Guest fills out the booking form on the landing page.
* **Immediate Success Message (Web UI):** Upon submission, the UI displays:
  > **Request Submitted Successfully!**  
  > *We have received your preferred schedule. Because we need to check our clinic calendar, your appointment is not yet confirmed. Our secretary will text or call you shortly at **[Their Phone Number]** to finalize your time.*
* **Database State:** An `appointment_inquiries` record is created with status `NEW`.
* **Auto-Reply Trigger (via Outbox):**
  * **Primary Channel (Email Only):** The system automatically sends an auto-reply email confirming receipt of the request. (No automated SMS is sent to keep API costs at zero).
  * **Backup:** The guest's phone number is saved. If they do not respond to emails, the secretary manually texts/calls them using the clinic's physical phone.
* **Staff Notification:** A `NEW_INQUIRY` notification is triggered in the secretary's dashboard.
* **Offline Check:** The secretary checks the physical calendar for the requested time.
  * *If unavailable:* Secretary calls/texts the guest's provided number to negotiate a new time.
  * *If available:* Secretary proceeds to step 7.
* **Conversion:** Secretary clicks "Convert" in the dashboard.
  * Database inserts a new row in `appointments` with status `APPROVED`.
  * System generates a secure `management_token` (UUID) attached to the appointment.
* **Confirmation:** The Outbox dispatcher sends an `appointment_confirmed` Email. This email contains a "Manage Appointment" button linked to `samson-dental.com/manage?token={token}`.

---

## 📞 Flow 2: Manual Booking (Phone Calls & Walk-ins)
This is the primary flow for the staff. The secretary inputs appointments that were agreed upon verbally.

* **Offline Agreement:** Patient calls or walks in; secretary finds a slot on the physical calendar.
* **System Entry:** Secretary opens `/secretary/book` and enters the details.
* **Preferred Contact Method Choice (Secretary's Choice):**
  * **Email (Free):** Sends the automated confirmation email with the Web Management token link.
  * **SMS (Paid API Credit):** Sends a 160-character plain text confirmation (e.g., *"Samson Dental: Appt confirmed Oct 12, 10AM. To reschedule or ask questions, call 0917-123-4567."*). **No link is included** to keep SMS simple and prevent patients from using web tools over SMS.
  * **None:** Sends no confirmation (perfect for walk-in patients already in the clinic).
* **Database State:** An `appointments` record is created directly with status `APPROVED`. A secure `management_token` is generated.


---

## ⚙️ Flow 3: Async "Manage Appointment" (Web Chat Thread)
This replaces complex ticket management for the staff. It acts as an asynchronous messaging inbox and is accessible only to patients who received an email and clicked their secure token link.

* **Access:** Patient clicks the "Manage Appointment" button in their email and lands on a secure chat interface authenticated by their URL token.
* **Automated Intake (Predefined Flow):**
  * The system immediately greets the user in the chat: *"Hello! How can we help you with your appointment on Oct 12?"*
  * The user is presented with three predefined buttons: `[Reschedule]`, `[Cancel]`, and `[Question]`.
  * **If Reschedule:** The chat prompts them to pick a new date/time from an inline picker. When selected, the app posts an automated message into the chat: *"Patient requested a reschedule to [New Date] at [New Time]"*. The active appointment status remains `APPROVED`.
  * **If Cancel:** The chat prompts them to type their cancellation reason. When submitted, the app posts a message into the chat: *"Patient requested cancellation. Reason: [Reason]"*. The active appointment status remains `APPROVED`.
  * **If Question:** The chat prompts them to type their question, posting it directly.
  * **System Auto-Reply:** After any of these actions, the system posts: *"Got it. The clinic will review this and reply here shortly."*
* **Staff Notification & Handoff:**
  * A `NEW_MESSAGE` notification triggers in the secretary's dashboard.
* **Human Negotiation & Resolution (Offline-First Priority):**
  * The secretary opens the chat thread, checks the physical offline calendar, and replies directly to the patient (e.g., *"We don't have 2 PM, but we have 4 PM. Does that work?"*).
  * **Notification Cooldown:** To prevent spamming the patient's inbox, email notifications for staff chat replies are throttled to a **15-minute cooldown** (only one notification email is sent every 15 minutes, even if the secretary sends multiple consecutive messages).
  * The patient gets the email notification of the reply, clicks the link, and responds in the chat thread.
  * **Offline-First Synchronization:** Once both parties agree on a time slot, the secretary updates the physical offline paper calendar with pen first, then clicks "Edit Appointment" (or "Reschedule" / "Cancel") on the dashboard to update the database.

## 🔒 Silent Status Updates & Automated Notifications
To reduce staff work, the secretary can directly mutate appointment statuses on the dashboard without typing any message. The system automatically handles notification dispatch and UI locking:

* **Silent Cancellation:**
  * **Trigger:** Secretary clicks the "Cancel Appointment" button. DB status changes to `CANCELLED`.
  * **Automated Email:** Outbox event triggers an email automatically:
    * *Subject:* Appointment Cancelled - Samson Dental
    * *Body:* *"As requested, your appointment for [Date] has been successfully cancelled. We hope you feel better!"*
  * **Chat Locking UI:** Once status is `CANCELLED`, the patient chat portal disables the input textbox and option buttons, displaying a top banner: *"This appointment has been cancelled. Please book a new appointment on our website."*

* **Silent Rescheduling:**
  * **Trigger:** Secretary clicks the "Reschedule Slot" button and saves new date/time. DB date/time updates (status remains `APPROVED`).
  * **Automated Email:** Outbox event triggers a reschedule confirmation email:
    * *Subject:* Appointment Rescheduled - Samson Dental
    * *Body:* *"Your appointment has been successfully rescheduled to [New Date] at [New Time]. Manage your appointment here: [Manage Link]"*
  * **Chat Update UI:** The patient chat context header automatically updates to show the new date and time details, and returns the patient to the main intake choice screen.



