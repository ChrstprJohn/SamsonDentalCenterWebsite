# Secretary Portal: In-App Notifications

This document outlines the functional specification, database schema, real-time trigger mappings, and user interface details for adding in-app notifications to the Secretary Portal.

---

## 1. Objectives & Behavioral Rules

- **Goal**: Accelerate front-desk reaction times, minimize schedule leakage (unresolved conflicts or missed checkout), and improve diagnostic visibility (failed email alerts).
- **Delivery Channel**: Real-time push (using PostgreSQL `LISTEN/NOTIFY` or Supabase Realtime) combined with a persistent visual notification panel (Bell Icon) in the Sidebar/Header.
- **Routing Integration**: Every notification must be a clickable item that acts as a deep link. Clicking the notification routes the secretary to the specific page and automatically selects or highlights the target entity.

---

## 2. Notification Taxonomy (Priority & Triggers)

The following matrix defines the must-have notifications that need to be added to the Secretary Portal:

### 2.1 High Priority (Immediate Operations Blockers)

| Notification Type | Trigger Event | Title & Message Templates | Target Deep-Link URL |
| :--- | :--- | :--- | :--- |
| `NEW_APPOINTMENT_REQUEST` | Patient submits a booking request on the Patient Portal. | **New Booking Request**<br>`"Patient {PatientName} requested {ServiceName} for {Date} at {Time}."` | `/secretary/pending?id={appointmentId}` |
| `NEW_RESCHEDULE_REQUEST` | Patient requests to reschedule an approved appointment. | **Reschedule Request**<br>`"Patient {PatientName} has requested a reschedule for their {ServiceName} appointment."` | `/secretary/reschedule-requests?id={appointmentId}` |
| `PATIENT_CANCEL_ALERT` | Patient cancels an approved appointment online. | **Appointment Cancelled**<br>`"Patient {PatientName} cancelled their {ServiceName} appointment scheduled for {Date}."` | `/secretary/appointments?status=CANCELLED&id={appointmentId}` |
| `TREATMENT_RENDERED` | Dentist completes treatment in Doctor Portal, generating a draft invoice. | **Ready for Checkout**<br>`"{DoctorName} finished treatment for {PatientName}. Invoice draft is ready."` | `/secretary/check-in?openCheckout={invoiceId}` |
| `DOCTOR_VACATION_CONFLICT` | Doctor registers a vacation/block exclusion that overlaps with approved bookings. | **Doctor Schedule Conflict**<br>`"{DoctorName} scheduled leave on {Date}. {ConflictCount} appointment(s) require displacement."` | `/secretary/appointments?status=APPROVED&date={Date}&doctorId={doctorId}` |
| `FAILED_EMAIL_ALERT` | System email delivery (confirmation, reschedule notice, receipt) fails. | **Email Delivery Failed**<br>`"Failed sending email receipt to {RecipientEmail}."` | `/secretary/emails?status=Failed&id={emailLogId}` |

### 2.2 Standard Priority (Actionable Triage)

| Notification Type | Trigger Event | Title & Message Templates | Target Deep-Link URL |
| :--- | :--- | :--- | :--- |
| `NEW_INQUIRY` | Guest submits a website contact form or service inquiry. | **New Inquiry Queue**<br>`"New inquiry from {GuestName} regarding {ServiceName}."` | `/secretary/inquiries?id={inquiryId}` |
| `PENDING_INVITE_EXPIRING` | Doctor invitation is within 12 hours of expiring (48hr limit) without signup. | **Invitation Expiring Soon**<br>`"Registration link for {DoctorName} expires in 12 hours."` | `/secretary/doctors?id={doctorId}` |

---

## 3. Database Schema Design

To support persistent, multi-actor, and real-time state tracking, we introduce the `notifications` table.

```sql
CREATE TYPE notification_priority AS ENUM ('HIGH', 'STANDARD');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient filter (Null means broadcasted to all users of a specific role, e.g., SECRETARY)
  recipient_role VARCHAR(50) NOT NULL DEFAULT 'SECRETARY',
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Optional specific target
  
  -- Notification Details
  type VARCHAR(100) NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'STANDARD',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(512) NOT NULL,
  
  -- Related Entity ID (for easier status joins)
  entity_id VARCHAR(100),
  
  -- Status Indicators
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast dashboard read access
CREATE INDEX idx_notifications_recipient_unread 
ON notifications(recipient_role, is_read, is_archived) 
WHERE is_read = FALSE AND is_archived = FALSE;
```

---

## 4. Code & Trigger Integration Plan

To implement these notifications without polluting view files, triggers should be placed at the service/transaction layer:

### 4.1 Creating the Database Hook Trigger (Optional Postgres Function)
For actions initiated directly by patients (online bookings or inquiries) or doctors (clinical session completion), database triggers can automatically generate notification rows:

```sql
-- Trigger for Doctor completing treatment (CHECKED_IN -> TREATMENT_RENDERED)
CREATE OR REPLACE FUNCTION trigger_notify_treatment_rendered()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'TREATMENT_RENDERED' AND OLD.status = 'CHECKED_IN' THEN
    INSERT INTO notifications (type, priority, title, message, link_url, entity_id)
    VALUES (
      'TREATMENT_RENDERED',
      'HIGH',
      'Ready for Checkout',
      CONCAT('Doctor finished treatment for ', NEW.patient_name, '. Invoice draft is ready.'),
      CONCAT('/secretary/check-in?openCheckout=', NEW.id), -- In practice, maps to invoice id
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4.2 Application / Action Code Hooking
For actions running in Next.js Server Actions:
1. **Resend Email Action**: If `resendEmailAction` returns a failure, insert a `FAILED_EMAIL_ALERT` record in the `notifications` table during the error-catch block.
2. **Doctor Block Out Schedule Action**: When saving a time exclusion in `/secretary/schedules`, run a check query inside the transaction to see if any `APPROVED` appointments overlap. For each conflict found:
   - Insert a `DOCTOR_VACATION_CONFLICT` row into `notifications`.
   - Update appointment status to `DISPLACED` or flag it for secretary review.

---

## 5. UI/UX Specifications

### 5.1 Sidebar / Header Navigation Bell Icon
- **Indicator**: A badges-count indicator overlay displaying the total number of unread notifications (`is_read = FALSE`).
- **Popover Menu**: Clicking the bell opens a dropdown list showing the latest 10 notifications with:
  - An icon indicating the category (e.g., calendar for bookings, credit card for invoices, warning for failures).
  - Relative time representation (e.g., "5 mins ago", "2 hours ago").
  - "Mark as Read" checkbox or swipe/hover action.
  - "Mark all as read" button at the header.

### 5.2 Toast Messages (Real-Time HUD Toast)
- Use a hook in `layout.tsx` subscribing to the `notifications` table via Supabase Realtime channels.
- When a new record with `priority = 'HIGH'` is received, fire a toast message (e.g., using `sonner` or `react-hot-toast`):
  - **High Priority Toast**: Stays on screen for 8 seconds or until manually closed.
  - **Link Action**: The toast text is clickable, navigating directly to `link_url`.
