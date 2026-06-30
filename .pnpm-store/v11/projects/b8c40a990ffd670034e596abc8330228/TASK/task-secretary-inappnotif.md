# Implementation Tasks: Secretary In-App Notifications (Outbox Integrated)

## Phase 1: Database Schema & Triggers
- [x] **Database Migration File**: `samson-nextjs/migrations/[timestamp]_create_notifications.sql`
  - Define `notification_priority` enum: `'HIGH'`, `'STANDARD'`.
  - Create `notifications` table:
    - `id` UUID PRIMARY KEY.
    - `recipient_role` VARCHAR(50) DEFAULT 'SECRETARY'.
    - `recipient_id` UUID referencing `auth.users(id)`.
    - `type` VARCHAR(100) NOT NULL.
    - `priority` `notification_priority` NOT NULL DEFAULT 'STANDARD'.
    - `title` VARCHAR(255) NOT NULL.
    - `message` TEXT NOT NULL.
    - `link_url` VARCHAR(512) NOT NULL.
    - `entity_id` VARCHAR(100).
    - `is_read` BOOLEAN DEFAULT FALSE.
    - `is_archived` BOOLEAN DEFAULT FALSE.
    - `created_at` TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()).
  - Create index `idx_notifications_recipient_unread` on `notifications(recipient_role, is_read, is_archived) WHERE is_read = FALSE AND is_archived = FALSE`.
  - Enable Row Level Security (RLS) on `notifications`.
  - Add RLS Policies:
    - Allow users with role `'SECRETARY'` to `SELECT` and `UPDATE` (e.g. marking as read).
    - Allow service role (`admin`) full access.
  - Enable Supabase Realtime for `notifications` table:
    - Add `notifications` to the `supabase_realtime` publication.

## Phase 2: Event-Driven Architecture (Outbox Integration)
- [x] **PostgreSQL Trigger Integration (Consolidated)**:
  - Consolidate all notification triggers directly at the PostgreSQL layer to ensure transaction-safe execution and avoid next.js serverless race conditions.
  - Removed duplicate Node.js outbox event subscribers to prevent double notifications.

## Phase 3: Notifications Domain Module
- [x] **Create DTOs**:
  - `src/modules/notifications/dtos/management/create-notification.dto.ts`
    - Schema validation for creating notifications with camelCase properties, mapped to snake_case DB columns.
  - `src/modules/notifications/dtos/management/update-notification.dto.ts`
    - Schema validation for updating notification read/archived status.
  - `src/modules/notifications/dtos/management/notification-response.dto.ts`
    - Response schema mapping database properties to camelCase using Zod `.transform()`.
  - `src/modules/notifications/dtos/index.ts`
    - Export all DTOs.
- [x] **Create Repositories**:
  - `src/modules/notifications/repositories/management/notifications.commands.ts`
    - Functional closures for write actions: insert notification, mark notification read/archived.
  - `src/modules/notifications/repositories/management/notifications.queries.ts`
    - Functional closures for read actions: fetch latest 10 unread notifications for role/recipient, count unread.
- [x] **Create Use Cases**:
  - `src/modules/notifications/use-cases/management/create-notification.use-case.ts`
  - `src/modules/notifications/use-cases/management/mark-read.use-case.ts`
  - `src/modules/notifications/use-cases/management/mark-all-read.use-case.ts`
- [x] **Create Server Actions**:
  - `src/modules/notifications/actions/management/mark-read.action.ts`
  - `src/modules/notifications/actions/management/mark-all-read.action.ts`
- [x] **Create Module Facade**:
  - `src/modules/notifications/exports.ts`
    - Export queries, use-cases, and components.

## Phase 4: Frontend Presentational & Logic Components
- [x] **Create React Hooks**:
  - `src/modules/notifications/hooks/use-notifications-realtime.ts`
    - Setup Supabase Realtime listener channel on the `notifications` table.
    - When new record with priority `'HIGH'` is inserted, fire a Toast message (8s duration, clickable deep link navigation).
  - `src/modules/notifications/hooks/use-notifications-bell.ts`
    - Companion hook for the Bell popover component: state for open/close dropdown, list of latest 10 notifications, unread count, triggering marking as read actions.
- [x] **Create Presentational Components**:
  - `src/modules/notifications/components/bell-icon.tsx`
    - SVG Bell with an unread badge indicator count.
  - `src/modules/notifications/components/notification-popover.tsx`
    - Popover menu dropdown showing the list of latest 10 notifications, absolute timing, "Mark all as read" button.
  - `src/modules/notifications/components/notification-item.tsx`
    - Clickable list item rendering notification category icon, message, relative time, and "Mark as Read" action.

## Phase 5: Integration & Verification
- [x] **Update Secretary Layout**: [layout.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/\(portals\)/secretary/layout.tsx)
  - Fetch initial notifications and count on server side, serialize props.
  - Inject Realtime Toast hook wrapper.
  - Embed the Bell Icon component in the Secretary header/sidebar.
- [x] **Add Notifications Sidebar Navigation Link**: Included under System & Logs in sidebar.
- [x] **Add Notifications Route Page**: Created `/secretary/notifications` page for unread notifications view.
- [x] **Testing**:
  - Write Vitest tests for repositories, use cases, subscribers, and custom hooks.
  - Validate database triggers/subscribers manually or via mock actions.

---

## 6. List of Testable Notifications & Message Templates

Here are the supported notification triggers, their message templates, and how you can trigger each one to test:

### 1. New Booking Request (`NEW_APPOINTMENT_REQUEST`)
* **Trigger Event**: Patient books an appointment online (status = `'PENDING'`).
* **Title**: `New Booking Request`
* **Message**: `Patient {PatientName} requested {ServiceName} for {Date}.`
* **Link**: `/secretary/pending?id={appointmentId}`
* **How to trigger**:
  ```sql
  INSERT INTO public.appointments (patient_id, service_id, doctor_id, date, start_time, end_time, status)
  VALUES (
    (SELECT id FROM users WHERE role = 'PATIENT' LIMIT 1),
    (SELECT id FROM services LIMIT 1),
    (SELECT id FROM users WHERE role = 'DOCTOR' LIMIT 1),
    CURRENT_DATE + 2,
    NOW() + interval '2 days',
    NOW() + interval '2 days 30 minutes',
    'PENDING'
  );
  ```

### 2. Reschedule Request (`NEW_RESCHEDULE_REQUEST`)
* **Trigger Event**: Patient requests to reschedule an approved slot (status = `'RESCHEDULE_REQUESTED'`).
* **Title**: `Reschedule Request`
* **Message**: `Patient {PatientName} has requested a reschedule for their {ServiceName} appointment.`
* **Link**: `/secretary/reschedule-requests?id={appointmentId}`
* **How to trigger**:
  ```sql
  UPDATE public.appointments
  SET status = 'RESCHEDULE_REQUESTED'
  WHERE id = (SELECT id FROM public.appointments WHERE status = 'APPROVED' LIMIT 1);
  ```

### 3. Appointment Cancelled (`PATIENT_CANCEL_ALERT`)
* **Trigger Event**: Patient cancels an approved appointment (status shifts `'APPROVED'` -> `'CANCELLED'`).
* **Title**: `Appointment Cancelled`
* **Message**: `Patient {PatientName} cancelled their {ServiceName} appointment scheduled for {Date}.`
* **Link**: `/secretary/appointments?status=CANCELLED&id={appointmentId}`
* **How to trigger**:
  ```sql
  UPDATE public.appointments
  SET status = 'CANCELLED'
  WHERE id = (SELECT id FROM public.appointments WHERE status = 'APPROVED' LIMIT 1);
  ```

### 4. Ready for Checkout (`TREATMENT_RENDERED`)
* **Trigger Event**: Dentist completes a treatment (status shifts `'CHECKED_IN'` -> `'TREATMENT_RENDERED'`).
* **Title**: `Ready for Checkout`
* **Message**: `Dr. {DoctorName} finished treatment for {PatientName}. Invoice draft is ready.`
* **Link**: `/secretary/check-in?openCheckout={appointmentId}`
* **How to trigger**:
  ```sql
  UPDATE public.appointments
  SET status = 'TREATMENT_RENDERED'
  WHERE id = (SELECT id FROM public.appointments WHERE status = 'CHECKED_IN' LIMIT 1);
  ```

### 5. Doctor Schedule Conflict (`DOCTOR_VACATION_CONFLICT`)
* **Trigger Event**: Doctor schedules a leave block that overlaps with an approved booking.
* **Title**: `Doctor Schedule Conflict`
* **Message**: `Dr. {DoctorName} scheduled leave on {Date}. {ConflictCount} appointment(s) require displacement.`
* **Link**: `/secretary/appointments?status=APPROVED&date={Date}&doctorId={doctorId}`
* **How to trigger**:
  - Make sure Doctor has an approved appointment on a specific date (e.g. `2026-07-05`).
  - Insert an exclusion/time block for that doctor overlapping the appointment slot:
    ```sql
    INSERT INTO public.time_blocks (doctor_id, date, start_time, end_time, reason, created_by)
    VALUES (
      (SELECT doctor_id FROM public.appointments WHERE status = 'APPROVED' LIMIT 1),
      (SELECT date FROM public.appointments WHERE status = 'APPROVED' LIMIT 1),
      '08:00:00',
      '17:00:00',
      'Doctor vacation leave',
      (SELECT id FROM users WHERE role = 'SECRETARY' LIMIT 1)
    );
    ```

### 6. Email Delivery Failed (`FAILED_EMAIL_ALERT`)
* **Trigger Event**: Outbox background task transitions to `'FAILED'`.
* **Title**: `Email Delivery Failed`
* **Message**: `Failed sending email to {RecipientEmail}.`
* **Link**: `/secretary/emails?status=Failed&id={emailLogId}`
* **How to trigger**:
  - Run email log resend action on a mock failed queue, or simulate a direct outbox failure:
    ```sql
    UPDATE outbox
    SET status = 'FAILED', error_logs = 'Resend API down'
    WHERE id = (SELECT id FROM outbox LIMIT 1);
    ```

### 7. New Inquiry (`NEW_INQUIRY`)
* **Trigger Event**: Guest submits a website contact form or service inquiry.
* **Title**: `New Inquiry Queue`
* **Message**: `New inquiry from {GuestName} regarding {ServiceName}.`
* **Link**: `/secretary/inquiries?id={inquiryId}`
* **How to trigger**:
  ```sql
  INSERT INTO public.appointment_inquiries (first_name, last_name, phone_number, email, preferred_service_id, preferred_date, status)
  VALUES (
    'Alice',
    'Smith',
    '+639171234567',
    'alice@example.com',
    (SELECT id FROM services LIMIT 1),
    CURRENT_DATE + 5,
    'NEW'
  );
  ```
