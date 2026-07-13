# [COMPLETED] Appointment Chat System Implementation Tasklist

This tasklist details all completed modifications and new file additions required to implement the secure, real-time web-based chat between patients and the clinic secretary.

---

## 1. Database & Schema Layer

### [x] [NEW] Database Migration File
* **File:** [20260713150000_add_appointment_chat.sql](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/migrations/20260713150000_add_appointment_chat.sql)
  * Altered `public.appointments` table to add `chat_token`.
  * Created `public.appointment_messages` table.
  * Added query retrieval index.
  * Configured RLS policies.
  * Configured Realtime replication.

---

## 2. Backend DTO & Repository Layer (Modulith Structure)

### [x] [NEW] DTO Files (`src/modules/appointments/dtos/chat/`)
* **File:** [send-message.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/chat/send-message.dto.ts)
  * Safe validation schema and unit tests (`send-message.dto.spec.ts`).
* **File:** [message-response.dto.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/dtos/chat/message-response.dto.ts)
  * Safe transform schema and unit tests (`message-response.dto.spec.ts`).

### [x] [NEW] Repository Files (`src/modules/appointments/repositories/chat/`)
* **File:** [chat.commands.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/chat/chat.commands.ts)
  * Database insert/mark read commands and unit tests (`chat.commands.spec.ts`).
* **File:** [chat.queries.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/repositories/chat/chat.queries.ts)
  * Read messages list, secretary thread inboxes, validate tokens and unit tests (`chat.queries.spec.ts`).

---

## 3. Backend Use Cases & Server Actions Layer

### [x] [NEW] Use Case Files (`src/modules/appointments/use-cases/chat/`)
* **File:** [send-message.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/chat/send-message.use-case.ts)
  * Enforces writable status checks and unit tests (`send-message.use-case.spec.ts`).
* **File:** [get-messages.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/chat/get-messages.use-case.ts)
  * Validates session identity/ownership and unit tests (`get-messages.use-case.spec.ts`).
* **File:** [mark-messages-as-read.use-case.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/use-cases/chat/mark-messages-as-read.use-case.ts)
  * Automatically handles unread status clearances and unit tests (`mark-messages-as-read.use-case.spec.ts`).

### [x] [NEW] Server Action Files (`src/modules/appointments/actions/chat/`)
* **File:** [send-message.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/chat/send-message.action.ts) & spec.
* **File:** [get-messages.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/chat/get-messages.action.ts) & spec.
* **File:** [mark-read.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/chat/mark-read.action.ts) & spec.
* **File:** [get-chat-threads.action.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/actions/chat/get-chat-threads.action.ts) & spec.

---

## 4. Frontend View, Custom Hooks & Components Layer

### [x] [NEW] Frontend Hooks (`src/modules/appointments/hooks/chat/`)
* **File:** [use-chat-messages.ts](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/hooks/chat/use-chat-messages.ts)
  * Listens to realtime database broadcasts and unit tests (`use-chat-messages.spec.ts`).

### [x] [NEW] Frontend Views & Components (`src/modules/appointments/views/chat/`)
* **File:** [patient-chat-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/views/chat/patient-chat-view.tsx)
  * Presentational component with bubble design layout.
* **File:** [secretary-chat-inbox-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/staff/views/secretary/secretary-chat-inbox-view.tsx)
  * Tabbed Messenger-style inbox splitting panels.

---

## 5. Frontend Integration & Route Modifications

### [x] [MODIFY] Existing Portal & Sidebar Components
* **File:** [secretary-sidebar.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/components/secretary-sidebar.tsx)
  * Added navigation sidebar item.
* **File:** [appointment-detail-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/appointments/views/appointment-detail-view.tsx)
  * Replaced reschedule/cancel buttons with the new direct Chat link.

### [x] [NEW] App Router Pages
* **File:** [page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/\(portals\)/secretary-v2/chat/page.tsx)
  * Secretary Chat Inbox route.
* **File:** [page.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/appointments/chat/\[id\]/page.tsx)
  * Secure route supporting guests via parameters or session accounts.
