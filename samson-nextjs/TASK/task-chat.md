# Appointment Chat System Implementation Tasklist

This tasklist details all modifications to existing files and new file additions required to implement a secure, real-time web-based chat between patients (both registered and guests) and the clinic secretary, aligned with the architectural directives.

---

## 1. Database & Schema Layer

### [NEW] Database Migration File
* **File:** [20260713150000_add_appointment_chat.sql](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/migrations/20260713150000_add_appointment_chat.sql)
  * Alter `public.appointments` table:
    * Add `chat_token TEXT DEFAULT gen_random_uuid()::text` column.
  * Create `public.appointment_messages` table:
    * Columns: `id` (UUID, primary key), `appointment_id` (UUID, foreign key referencing `appointments.id`), `sender_role` (TEXT, check constraint `'PATIENT', 'STAFF'`), `sender_name` (TEXT), `message` (TEXT), `created_at` (TIMESTAMPTZ, default `NOW()`), `is_read` (BOOLEAN, default `FALSE`).
    * Setup cascade deletion: `ON DELETE CASCADE` for `appointment_id`.
  * Add indexes:
    * Index on `appointment_messages.appointment_id` for fast query retrieval.
  * Setup Row Level Security (RLS) policies:
    * Allow select/insert on `appointment_messages` if the user is authenticated and is the patient associated with the appointment OR is clinic staff (Secretary/Admin).
    * Allow select/insert on `appointment_messages` for unauthenticated users (Guests) if they provide a valid `chat_token` matching the appointment's token.
  * Add Realtime replication setup for `appointment_messages` table to support instant chat updates.

---

## 2. Backend DTO & Repository Layer (Modulith Structure)

### [NEW] DTO Files (`src/modules/appointments/dtos/chat/`)
* **File:** [send-message.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/chat/send-message.dto.ts)
  * Define `sendMessageSchema` (Zod validation for incoming message payload).
  * Fields: `appointmentId` (UUID), `message` (string, min 1), `senderRole` (enum `PATIENT` or `STAFF`), `senderName` (string).
  * Co-locate unit test file: `send-message.dto.spec.ts`.
* **File:** [message-response.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/chat/message-response.dto.ts)
  * Define `messageResponseSchema` converting DB payload to standard `camelCase`.
  * Co-locate unit test file: `message-response.dto.spec.ts`.
* **File:** [index.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/chat/index.ts)
  * Barrel exports for chat-related DTOs.

### [NEW] Repository Files (`src/modules/appointments/repositories/chat/`)
* **File:** [chat.commands.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/chat/chat.commands.ts)
  * Implement functional query/command closures:
    * `insertMessageCommand(supabase: SupabaseClient)(data: SendMessageDto)`: Inserts a message and parses the result through `messageResponseSchema`.
    * `markMessagesAsReadCommand(supabase: SupabaseClient)(appointmentId: string, roleToMark: 'PATIENT' | 'STAFF')`: Marks messages from the opposite sender role as read.
  * Co-locate unit test file: `chat.commands.spec.ts`.
* **File:** [chat.queries.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/chat/chat.queries.ts)
  * Implement functional read queries:
    * `getMessagesByAppointmentIdQuery(supabase: SupabaseClient)(appointmentId: string)`: Retrieves messages for an appointment sorted chronologically.
    * `getChatThreadsForSecretaryQuery(supabase: SupabaseClient)`: Retrieves all active/archive appointments with their latest message details and unread counts.
    * `validateChatTokenQuery(supabase: SupabaseClient)(appointmentId: string, token: string)`: Validates guest chat tokens.
  * Co-locate unit test file: `chat.queries.spec.ts`.

---

## 3. Backend Use Cases & Server Actions Layer

### [NEW] Use Case Files (`src/modules/appointments/use-cases/chat/`)
* **File:** [send-message.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/chat/send-message.use-case.ts)
  * Business rules for sending a message (e.g. status check: block if appointment is not `APPROVED` or `CHECKED_IN`).
  * Co-locate unit test file: `send-message.use-case.spec.ts`.
* **File:** [get-messages.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/chat/get-messages.use-case.ts)
  * Fetch conversation history; handles security checks.
  * Co-locate unit test file: `get-messages.use-case.spec.ts`.
* **File:** [mark-messages-as-read.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/chat/mark-messages-as-read.use-case.ts)
  * Business rules to clear unread counts when viewing a thread.
  * Co-locate unit test file: `mark-messages-as-read.use-case.spec.ts`.

### [NEW] Server Action Files (`src/modules/appointments/actions/chat/`)
* **File:** [send-message.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/chat/send-message.action.ts)
  * Validate inputs, fetch Supabase client, call Use Case, handle `revalidatePath`.
  * Co-locate unit test file: `send-message.action.spec.ts`.
* **File:** [get-messages.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/chat/get-messages.action.ts)
  * Server action for retrieving message lists.
  * Co-locate unit test file: `get-messages.action.spec.ts`.
* **File:** [mark-read.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/chat/mark-read.action.ts)
  * Server action to mark messages as read.
  * Co-locate unit test file: `mark-read.action.spec.ts`.

---

## 4. Frontend View, Custom Hooks & Components Layer

### [NEW] Frontend Hooks (`src/modules/appointments/hooks/chat/`)
* **File:** [use-chat-messages.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/hooks/chat/use-chat-messages.ts)
  * Client-side hook managing real-time subscriptions, state array of messages, and triggers to submit message server actions.

### [NEW] Frontend Views & Components (`src/modules/appointments/views/chat/`)
* **File:** [patient-chat-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/views/chat/patient-chat-view.tsx)
  * Presentational view with Chat bubble layout, read-only state checks (if appointment status is completed/cancelled), and message inputs.
* **File:** [secretary-chat-inbox-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/secretary-chat-inbox-view.tsx)
  * Two-column messenger split inbox containing tabs (Active vs Archive) and search input filtering by patient name.

---

## 5. Frontend Integration & Route Modifications

### [MODIFY] Existing Portal & Sidebar Components
* **File:** [secretary-sidebar.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/components/secretary-sidebar.tsx)
  * Add the "Chat Inbox" menu link under Sidebar navigation.
* **File:** [appointment-detail-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/views/appointment-detail-view.tsx)
  * Remove reschedule/cancel buttons in favor of "Chat with Secretary" route link.
  * Guide users to the chat thread for all scheduling modifications.

### [NEW] App Router Pages
* **File:** [page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/\(portals\)/secretary-v2/chat/page.tsx)
  * Secretary Chat Inbox Portal route.
* **File:** [page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/appointments/chat/\[id\]/page.tsx)
  * Secure route page accepting query param `?token=[secureToken]` for guests or registered users.
