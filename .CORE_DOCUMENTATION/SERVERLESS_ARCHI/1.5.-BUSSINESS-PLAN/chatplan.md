# Appointment Chat System (Option 2: Secure Web-Based Chat Link)

This document details the specifications and flow for the web-based chat thread between patients (both registered and guests) and the clinic secretary.

## Architecture & Concept

Instead of creating a complex email parsing bridge, the chat system runs directly on the clinic website. Communication is structured around individual **appointments** rather than accounts.

1. **Implicit Threading:** Every approved/active appointment automatically has an implicit chat thread associated with its `appointment_id`. No explicit "create thread" step is needed.
2. **Access Control & Routing Entry Points:**
   - **Clinic Secretary:** Can view and manage chats for all appointments from the Staff Dashboard Sidebar/Inbox.
   - **Patient (Registered):**
     - **Patient Portal:** Inside their dashboard, every active appointment card/detail modal will display a **"Chat with Secretary"** button. This links directly to the chat interface.
     - **Email Link:** Clicking the secure chat link in their appointment confirmation/reminder emails will directly open the chat thread. If they are already logged in, it routes to their portal chat. If not logged in, it falls back to the secure token access so they can chat immediately without friction.
   - **Patient (Guest):** 
     - **Secure Link Only:** Guests can *only* access the chat via the secure URL sent in their confirmation and reminder emails (e.g. `/appointments/chat/[appointmentId]?token=[secureToken]`). 
     - **Automatic Access:** When clicked, the website validates the token against the database and redirects/renders the chat view directly for them. No account creation or login is required.


---

## Technical Specifications

### 1. Database Schema Extensions

#### New Table: `public.appointment_messages`
```sql
CREATE TABLE public.appointment_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('PATIENT', 'STAFF')),
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexing for fast retrieval
CREATE INDEX idx_appointment_messages_appointment_id ON public.appointment_messages(appointment_id);
```

#### Modified Table: `public.appointments`
Add a column to support guest authentication:
```sql
ALTER TABLE public.appointments
ADD COLUMN chat_token TEXT DEFAULT gen_random_uuid()::text;
```

---

## User Flow

### Initiation & Interaction
- **Secretary Initiates:** The secretary can open any approved appointment and click "Chat" to send the first message (e.g., instructions on requirements, reminders, or notifications of delays).
- **Patient Initiates:** The patient clicks the link in their approval email or goes to their Patient Portal to send their first message.
- Since it is tied directly to the appointment, it is frictionless and doesn't require a manual thread-creation flow.

### Notification Loop
- When a patient sends a message, a notification or badge appears on the secretary dashboard.
- Optionally, if a secretary sends a message and the patient is not active, the system could send an email alert (optional extension).

### Continuous Email Lifecycle
- The unique link (`/appointments/chat/[appointmentId]?token=[secureToken]`) is persistent.
- The link is embedded in the **Approval Confirmation Email** and the **Appointment Reminder Email**.
- When a patient clicks the link in a reminder email, they will see the exact same ongoing thread and conversation history as before.


### Chat Thread State Management & Policy Simplification

To avoid user confusion and simplify the system, **formal "Request Reschedule" and "Request Cancel" button flows and their associated status transitions (e.g., `RESCHEDULE_REQUESTED`) are abandoned**. 

* **Conversational Policy:** If a patient needs to reschedule or cancel an approved appointment, they simply use the chat thread to message the secretary directly (e.g., *"Hi, can we move this to next Tuesday at 3 PM?"*). The secretary then updates the appointment details or status directly in the staff dashboard.
* **UI Behavior:** Instead of showing separate reschedule/cancel buttons on their appointment card, the portal and emails will guide patients directly to the **Chat** button.

The chat thread availability is determined as follows:
1. **Not Yet Available (`PENDING`):** The chat is not accessible (the appointment is pending secretary review/approval, and no secure link has been generated or sent).
2. **Active & Writable (`APPROVED`, `CHECKED_IN`):** The chat is fully active. Both the patient and secretary can read and send messages to handle scheduling requests, questions, or updates.
3. **Read-Only / Closed (`COMPLETED`, `TREATMENT_RENDERED`, `CANCELLED`, `NO_SHOW`, `REJECTED`):** The chat is closed:
   - The patient and staff can still view the full chat history.
   - The message input field is disabled with a notice: *"This chat thread is now closed because the appointment is [Status]."*
   - This prevents post-appointment spam or messaging on stale appointments.



## UI Plan / Layout Design

To provide a modern, seamless communication experience similar to popular messaging apps (like Messenger), the chat interface is structured as a responsive two-column split layout.

### 1. Left Side: Conversation Directory (Inbox Sidebar)
* **Search / Filter Bar:** A quick search input to filter conversations by patient name or appointment ID.
* **Inbox Tabs:**
  * **Active:** Lists ongoing threads for active appointments (`APPROVED`, `RESCHEDULE_REQUESTED`, `CHECKED_IN`).
  * **Archive:** Lists past or closed threads (`COMPLETED`, `TREATMENT_RENDERED`, `CANCELLED`, `NO_SHOW`, `REJECTED`).
* **Conversation List Items:**
  * **Avatar & Patient Name:** Displays patient initials or profile photo, along with their name.
  * **Latest Message Snippet:** A short text preview of the most recent message.
  * **Read / Unread Indicator:** 
    * Unread threads are highlighted with **bold text** and a small colored badge (e.g., blue/green dot).
    * Read threads display normal font styling.
  * **Relative Timestamp:** Displays when the last message was sent (e.g., *"10m ago"*, *"2:30 PM"*, *"Yesterday"*, or *"July 10"*).
  * **Active / Closed Status Badge:** A small tag indicating the appointment status (e.g., `APPROVED`, `COMPLETED`).

### 2. Right Side: Messaging Panel
* **Thread Header (Patient Profile & Details):**
  * Displays the patient's name, contact info, and key appointment details (Date, Time, Treatment/Service Type).
  * A clear status pill indicator (e.g., active dot or locked padlock).
* **Message Bubble Area (Scrollable):**
  * **Left-aligned bubbles (Patient/Staff):** Light gray background for incoming messages.
  * **Right-aligned bubbles (Current user):** Colored background (e.g., clinic primary blue) for outgoing messages.
  * **Timestamps:** Subtly formatted timestamp below or next to bubbles, showing the exact date and time.
  * **Read Receipts:** A small indicator (e.g., "Read" or checkmark) when the message has been viewed.
* **Message Input Bar (Footer):**
  * **When Active:** Contains a text input field, attachment options, and a "Send" button. Supports sending with `Enter` (and `Shift+Enter` for new lines).
  * **When Closed/Read-Only:** The input bar is replaced with a clear notice banner: *"This chat thread is now closed because the appointment is [Status]."*


## Implementation Status (Completed: 2026-07-13)

The specifications in this plan have been fully implemented:
1. **Implicit Threading:** Configured `appointment_messages` referencing `appointments` with cascades.
2. **Access Control & Secure Token Validation:** Implemented `validateChatTokenQuery` for guests. Protected routes via server-side session checks and tokens.
3. **Database & Realtime:** Created schema tables/indexes in [20260713150000_add_appointment_chat.sql](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/migrations/20260713150000_add_appointment_chat.sql) and registered `appointment_messages` to Supabase Realtime replication.
4. **Messenger Split UI:** Built inbox with tabbed filters (Active/Archive) and message history bubble views.
5. **Continuous Email Lifecycle:** Designed `/appointments/chat/[id]?token=[token]` route page as persistent entry point.



