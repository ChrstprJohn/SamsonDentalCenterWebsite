# 🦷 Samson Dental - Pivot Plan & Task List (Booking Flow & Chat Intake)

This document contains a comprehensive audit of the current implementation, outlines the pivot requirements, and defines a step-by-step task list to align our booking and chat systems with the new business strategy in [new-revisedplan.md](file:///.CORE_DOCUMENTATION/SERVERLESS_ARCHI/1.5.-BUSSINESS-PLAN/new-revisedplan.md) without breaking existing functionality. All items strictly follow the project's system design guidelines.

---

## 🔍 Part 1: Current Implementation Audit (What We Have)

### 1. Database Schema & Stored Procedures
* **Table definitions:** We have core tables: `users`, `dependents`, `services`, `doctor_services`, `doctor_schedules`, `clinic_config`, `appointments`, `appointment_messages`, `appointment_inquiries`, `appointment_status_history`, `appointment_treatments`, `invoices`, `audit_logs`, and the transaction `outbox`.
* **Triggers for Notifications:**
  * `trg_appointment_notifications` on `appointments` table: automatically inserts notifications of type `NEW_APPOINTMENT_REQUEST` (when status goes to `PENDING`), `NEW_RESCHEDULE_REQUEST`, and `PATIENT_CANCEL_ALERT` into the `notifications` table.
  * `trg_appointment_inquiries_inserted` on `appointment_inquiries`: inserts `NEW_INQUIRY` notification when a guest booking is submitted on the landing page.
  * `trg_outbox_failed` on `outbox`: inserts `FAILED_EMAIL_ALERT` when email dispatch fails.
* **Triggers for Chat Messages:**
  * `trg_appointment_approved_message` on `appointments`: automatically inserts a welcome message from `STAFF` ('System') into `appointment_messages` when an appointment status is updated to `APPROVED`.
  * `trg_new_patient_message` on `appointment_messages`: inserts a system auto-reply message on the patient's first chat message.
* **ACID Transactions:**
  * `public.submit_booking_transaction`: handles inline dependent creation, appointment insertion, outbox event scheduling, and status history log in a single transaction.
  * `public.create_manual_booking`: handles secretary booking creation (including inline guest contacts if patient is unregistered).
  * `public.convert_inquiry_to_appointment`: handles converting guest inquiries to active appointments.

### 2. Backend & Service Layer
* **Server Actions (`src/modules/appointments/actions`)**:
  * `booking/submit-booking.action.ts`: handles authenticated patient booking submissions.
  * `booking/submit-inquiry.action.ts`: handles unauthenticated guest landing page inquiries.
  * `booking/create-manual-booking.action.ts`: handles manual bookings created by staff.
  * `booking/convert-inquiry.action.ts`: handles secretary converting a guest inquiry.
  * `chat/send-message.action.ts`, `get-messages.action.ts`, `mark-read.action.ts`: coordinates message dispatch, retrieval, and read receipt tracking.
  * `status/request-reschedule.action.ts`, `cancel-appointment.action.ts`, `update-appointment-status.action.ts`: coordinates appointment lifecycle state mutations.
* **Outbox Event Subscribers (`src/modules/emails/subscribers`, `src/orchestrators`)**:
  * `onAppointmentBookedSubscriber.ts`: sends confirmation request email to patients.
  * `onAppointmentConvertedSubscriber.ts`: sends confirmation email when guest inquiry is converted.
  * `onManualBookingGuestSubscriber.ts` & `onManualBookingPatientSubscriber.ts`: send manual booking confirmation emails.
  * All wired via the event bus orchestrator in `src/orchestrators/event-subscribers.ts`.

### 3. Frontend & Presentation Layer
* **Patient Chat Page (`src/app/appointments/chat/[id]/page.tsx`)**:
  * Validates access using either user authentication session or `searchParams.token` (validating `chat_token`).
  * Renders `PatientChatView.tsx` with Supabase real-time database listener (`use-chat-messages.ts`).
* **Secretary Chat Page (`src/app/(portals)/secretary-v2/chat/page.tsx`)**:
  * Renders `SecretaryChatInboxView.tsx` which includes the inbox conversations queue, chat dialog stream, and a sidebar for rescheduling/cancelling.
* **Secretary Sidebar (`src/components/secretary-sidebar.tsx`)**:
  * Sidebar navigation for `secretary-v2` portal routes.

---

## ⚙️ Part 2: Gaps & Required Changes (What Needs to Be Modified/Added)

To pivot successfully to the new business strategy without breaking any existing modules, we must implement the following changes:

### 1. Database Modifications
* **Status Enum Alignment (Critical Bug Fix):**
  * *Audit Finding:* `appointments.status` enum in `schema.sql` (Line 13) supports `APPROVED` but **not** `CONFIRMED`. However, the functions `create_manual_booking` and `convert_inquiry_to_appointment` insert status `'CONFIRMED'`. Running them throws database exceptions.
  * *Modification:* Update database functions to insert `'APPROVED'` instead of `'CONFIRMED'`.
* **Token Query Indexing:**
  * *Audit Finding:* We lookup appointments by token on `/manage?token={token}`. There is no unique index on `appointments(chat_token)`.
  * *Modification:* Create a unique index on `appointments(chat_token)`.
* **New Chat Message Notification Trigger:**
  * *Audit Finding:* When patients send chat messages, staff are not notified via the `notifications` table.
  * *Modification:* Add a database trigger to insert a `'NEW_MESSAGE'` notification when a patient sends a chat message.

### 2. Backend Modifications
* **Register Omitted Subscribers:**
  * *Audit Finding:* Sibling notification subscribers (`onNewBookingSubscriber`, `onCancelBookingSubscriber`, etc.) are imported in `event-subscribers.ts` but never registered.
  * *Modification:* Register them to ensure system notifications work correctly.
* **Token-bypass Authentication for Reschedule & Cancel Actions (Unnecessary/Bypassed):**
  * *Audit Finding:* `requestRescheduleAction` and `cancelAppointmentAction` require session authentication, but since reschedule and cancellation requests will be sent as simple chat messages, the patient UI only needs to call `sendMessageAction`.
  * *Modification:* No modifications needed for these actions. `sendMessageAction` already supports `chatToken` validation.
* **Preferred Contact Channel for Manual Bookings:**
  * *Audit Finding:* Manual booking currently defaults to sending confirmation emails and does not support SMS choice.
  * *Modification:* Update `CreateManualBookingDto` to include `confirmationChannel: 'EMAIL' | 'SMS' | 'NONE'`. Update database function `create_manual_booking` to conditionally trigger outbox events.
* **SMS Dispatch Subscriber:**
  * *Modification:* Create `onManualBookingSmsSubscriber.ts` outbox subscriber. Draft a plain 160-char text (no links) and invoke an SMS utility. Register `'APPOINTMENT_MANUALLY_BOOKED_SMS'` in the orchestrator event registry.


### 3. Frontend Modifications
* **URL Entry Point `/manage`:**
  * *Modification:* Create page `src/app/(public)/manage/page.tsx` to handle `/manage?token={token}`, lookup the appointment ID by token, and redirect to `/appointments/chat/[appointmentId]?token={token}`.
* **Email Template Updates:**
  * *Modification:* Update `AppointmentConfirmedEmail` to accept `chatToken` and `baseUrl`. Render a premium "Manage Appointment" CTA button linking to `/manage?token={chatToken}`.
* **God Component Prevention & Refactoring:**
  * *Audit Finding:* `PatientChatView.tsx` (247 lines) exceeds the 150-line God Component limit. Adding the intake flow will bloat it further.
  * *Modification:* Refactor `PatientChatView.tsx` by extracting `ChatHeader`, `ChatContextBanner`, `ChatMessagesList`, and `ChatInputBar` into `sub-components/`.
* **Chat Intake UI & Workflow:**
  * *Modification:* Create `use-chat-intake.ts` hook and `ChatIntakeWorkflow.tsx` component.
  * If the patient is role `PATIENT` and status is `APPROVED`:
    - Show welcome greeting and options: `[Reschedule]`, `[Cancel]`, and `[Question]`.
    - If `Reschedule`: display calendar/time slots via `useBookingScheduler` and trigger `requestRescheduleAction(..., chatToken)`.
    - If `Cancel` or `Question`: prompt with textarea and send message to chat.
    - Write system auto-reply message `"Got it. The clinic will review this and reply here shortly."`.

---

## 📝 Step-by-Step Task### Phase 1: Database Migration Tasks
- [x] **Task 1.1: Fix Enum Bug & Add Index**
  * *File to Create:* `migrations/[timestamp]_pivot_status_and_index.sql`
  * *Actions:*
    * Replace `'CONFIRMED'` with `'APPROVED'` in `create_manual_booking` and `convert_inquiry_to_appointment`.
    * Update status history entries from `'CONFIRMED'` to `'APPROVED'`.
    * Add `CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_chat_token ON public.appointments(chat_token);`.
  * *Guideline Compliance:* `backend/1-ARCHITECTURE.md` (Data-Layer Isolation & Migrations).
- [x] **Task 1.2: Add Chat Message Notification Trigger**
  * *File to Edit:* Same migration file.
  * *Actions:*
    * Create trigger function `public.trigger_notify_new_chat_message()`.
    * Fires `AFTER INSERT` on `public.appointment_messages` when `NEW.sender_role = 'PATIENT'`.
    * Inserts notification into `public.notifications` with `recipient_role = 'SECRETARY'`, `type = 'NEW_MESSAGE'`, `priority = 'STANDARD'`, `title = 'New Chat Message'`, and `link_url = '/secretary-v2/chat?id=' || NEW.appointment_id`.
  * *Guideline Compliance:* `backend/3-CLEAN_CODE.md` (System notifications and background transactions).

### Phase 2: Backend & Service Layer Tasks
- [x] **Task 2.1: Register Notification Event Subscribers**
  * *File to Modify:* [event-subscribers.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/orchestrators/event-subscribers.ts)
  * *Actions:* Add missing registrations in `bootstrapEventSubscribers()` for `'TREATMENT_RENDERED'`, `'EMAIL_FAILED'`, `'SCHEDULE_CONFLICT'`, `'NEW_APPOINTMENT_REQUEST'`, and `'CANCEL_BOOKING'`.
  * *Guideline Compliance:* `backend/1-ARCHITECTURE.md` (Internal Event Subscribers).
- [x] **Task 2.2: Implement Appointment ID by Token Query**
  * *File to Edit:* [chat.queries.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/chat/chat.queries.ts)
  * *Actions:* Add `getAppointmentIdByChatTokenQuery(supabase: SupabaseClient)` to execute `SELECT id FROM appointments WHERE chat_token = $1` and return the appointment record (minding camelCase mapping).
  * *Guideline Compliance:* `backend/1.5-CODING-PATTERNS.md` (Functional CQRS Repository Blueprint & camelCase mapping).
- [x] **Task 2.3: Implement Preferred Notification Channel in Manual Bookings**
  * *Files to Edit:*
    * `src/modules/appointments/dtos/booking/create-manual-booking.dto.ts`: Add `confirmationChannel: z.enum(['EMAIL', 'SMS', 'NONE']).default('EMAIL')`.
    * Database function `create_manual_booking` (SQL): Add parameter `p_confirmation_channel TEXT`. Conditionalize outbox insertion logic based on channel choice.
    * Create `onManualBookingSmsSubscriber.ts` in `src/modules/emails/subscribers` to write plain text confirmation outbox events.
    * Register SMS subscriber in `bootstrapEventSubscribers()`.
  * *Guideline Compliance:* `backend/3-CLEAN_CODE.md` (Additive Coding Pattern, extending existing configurations safely).
- [x] **Task 2.4: Implement Patient Email Notification on Staff Reply (with 15-Min Cooldown)**
  * *Files to Edit/Create:*
    * In `sendMessageAction`, when `sender_role = 'STAFF'` and `sender_name != 'System'`:
      * Query the `outbox` table (or verify via recent chat messages) to check if a `STAFF_REPLIED_TO_CHAT` event was created for this appointment within the last 15 minutes.
      * If no event was created in the last 15 minutes, insert a new outbox event `STAFF_REPLIED_TO_CHAT`. Otherwise, bypass event creation to prevent email spam.
    * Create subscriber `onStaffReplySubscriber.ts` in `src/modules/emails/subscribers` to send an email: *"New message from Samson Dental Center regarding your appointment."* containing the secure `/manage?token={token}` link.
    * Register subscriber in `bootstrapEventSubscribers()`.
  * *Guideline Compliance:* `backend/1-ARCHITECTURE.md` (Internal Event Subscribers).
- [x] **Task 2.5: Implement Silent Status Change Email Subscribers**
  * *Files to Modify/Create:*
    * Update `onCancelBookingSubscriber.ts` (under `src/modules/emails/subscribers`): Fetch patient name and appointment date. Send `AppointmentCancelledEmail` template using Resend.
    * Create `onRescheduleBookingSubscriber.ts`: Triggered when an appointment is rescheduled. Fetch patient details, new date, time, and `chat_token`. Send `AppointmentRescheduledEmail` template using Resend.
    * Register subscribers in `bootstrapEventSubscribers()`.
  * *Guideline Compliance:* `backend/1-ARCHITECTURE.md` (Internal Event Subscribers).
 
### Phase 3: Frontend Refactoring & UI Component Tasks
- [x] **Task 3.1: Create Public Route `/manage`**
  * *File to Create:* `src/app/(public)/manage/page.tsx`
  * *Actions:*
    * Server component route. Reads search parameter `token`.
    * Queries DB via `getAppointmentIdByChatTokenQuery`.
    * If token matches, executes `redirect('/appointments/chat/[appointmentId]?token={token}')`.
    * Otherwise, displays a styled dark-theme "Access Denied" view.
  * *Guideline Compliance:* `frontend/1-ARCHITECTURE.md` (Server-Side Data Orchestration, Explicit Client Boundary marking).
- [x] **Task 3.2: Update Email Templates for Silent Operations**
  * *Files to Edit/Create:*
    * [appointment-confirmed-email.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/components/emails/appointment-confirmed-email.tsx): Add `chatToken` and `baseUrl` properties and render "Manage Appointment" CTA button.
    * Create `appointment-cancelled-email.tsx`: Template sent to patients on cancellation (*"As requested, your appointment for [Date] has been successfully cancelled..."*).
    * Create `appointment-rescheduled-email.tsx`: Template sent to patients on reschedule containing new date/time and the `/manage?token={token}` link.
    * Implement patient notification email template for staff replies.
  * *Guideline Compliance:* `frontend/4-CODING-PATTERNS.md` (Anti-Leak Adapters, camelCase mappings).
- [x] **Task 3.3: Implement Channel Selector on Secretary Booking Dashboard**
  * *File to Edit:* `src/app/(portals)/secretary-v2/book/page.tsx` (and companion booking form component/hook).
  * *Actions:*
    * Add a radio group or select dropdown labeled *"Confirmation Channel"* with options: `Email (Free)`, `SMS (Paid Credit)`, and `None (Walk-in)`.
    * Bind option selection to the updated manual booking DTO payload and pass it to `createManualBookingAction`.
  * *Guideline Compliance:* `frontend/2-REACT-COMPONENTS.md` (forwardRef inputs validation).
- [x] **Task 3.4: Refactor `PatientChatView` (150-line rule)**
  * *Files to Create:*
    * `src/modules/appointments/views/chat/sub-components/chat-header.tsx`
    * `src/modules/appointments/views/chat/sub-components/chat-context-banner.tsx`
    * `src/modules/appointments/views/chat/sub-components/chat-messages-list.tsx`
    * `src/modules/appointments/views/chat/sub-components/chat-input-bar.tsx`
  * *Actions:* Split the 247-line `PatientChatView.tsx` file into small presentational sub-components. Ensure all shared input primitives use named exports and forwardRef where needed.
  * *Guideline Compliance:* `frontend/1-ARCHITECTURE.md` (God Component Prevention Rule) & `frontend/2-REACT-COMPONENTS.md` (The Principle of Dumb Components).
- [x] **Task 3.4: Implement Companion Intake State Hook**
  * *File to Create:* `src/modules/appointments/hooks/chat/use-chat-intake.ts`
  * *Actions:*
    * Custom React Hook to manage state transitions for the intake flow: `activeWorkflow` (`'NONE' | 'SELECT_OPTION' | 'RESCHEDULE' | 'CANCEL' | 'QUESTION'`).
    * Exposes selection handlers, textareas for cancel reasons / questions, and bindings to `useBookingScheduler` to retrieve available slots.
    * Invokes server actions (`sendMessageAction` only, passing the `chatToken`).
  * *Guideline Compliance:* `frontend/3-REACT-HOOKS.md` (Mandatory Hook Binding for Domain Logic).
- [x] **Task 3.5: Build Intake UI Component**
  * *File to Create:* `src/modules/appointments/views/chat/sub-components/chat-intake-workflow.tsx`
  * *Actions:*
    * Presentational UI driven by hook state.
    * Displays options buttons: `[Reschedule]`, `[Cancel]`, `[Question]`.
    * Implements interactive date picker and slot selectors for rescheduling.
    * Implements text areas for cancellation reasons or question inputs.
    * Includes "Back" buttons to allow patients to change their workflow selection.
  * *Guideline Compliance:* `frontend/2-REACT-COMPONENTS.md` (Dumb Component props pattern).
- [x] **Task 3.6: Integrate UI and Lock Chat in `PatientChatView`**
  * *File to Edit:* `PatientChatView.tsx` (or refactored layout)
  * *Actions:*
    * When `currentUserRole === 'PATIENT'` and `activeWorkflow !== 'NONE'`, replace standard text chat input bar with the `<ChatIntakeWorkflow />` panel.
    * Ensure that selecting a slot in `Reschedule` sends the chat message: `"Patient requested a reschedule to [New Date] at [New Time]"`.
    * Ensure that submitting a reason in `Cancel` sends the chat message: `"Patient requested cancellation. Reason: [Reason]"`.
    * Triggers the automatic system response: `"Got it. The clinic will review this and reply here shortly."`.
    * **Chat Lock Integration:** If the appointment status is `'CANCELLED'`, disable the intake buttons, options, and chat input textbox completely. Render a top warning banner: *"This appointment has been cancelled. Please book a new appointment on our website."*
  * *Guideline Compliance:* `frontend/1-ARCHITECTURE.md` (Domain‑First Component Organization).
 
### Phase 4: Quality Assurance & Verification
- [x] **Task 4.1: Sibling Unit Test Suite Coverage**
  - Run Vitest unit tests for all modified and created hooks/actions:
    - `use-chat-intake.spec.ts`
    - `create-manual-booking.action.spec.ts`
    - `onManualBookingSmsSubscriber.spec.ts`
    - `onStaffReplySubscriber.spec.ts`
    - `onCancelBookingSubscriber.spec.ts`
    - `onRescheduleBookingSubscriber.spec.ts`
  - Ensure all schema configurations and token validation checks pass under 100% mocked database scenarios.
- [x] **Task 4.2: End-to-End Integration Walkthrough**
  - Verify full guest landing page inquiry submission, dashboard conversion, email outbox generation, `/manage` redirection, and secure token chat intake in the local dev browser sandbox.
  - Verify that offline dashboard rescheduling and cancellations from the secretary side do not disrupt active chat sessions. chat sessions.
