# Samson Dental - Database Schema (Supabase / PostgreSQL)

This document defines the core entities for the PostgreSQL database hosted on **Supabase**. The schema relies on raw PostgreSQL tables, relationships, and Supabase Auth for user management.

---

## Enums

```sql
CREATE TYPE role AS ENUM ('PATIENT', 'SECRETARY', 'ADMIN');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'RESCHEDULE_REQUESTED', 'DISPLACED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'FINALIZED', 'PAID', 'VOID');
```

---

## Tables

### 1. `users`
Managed via Supabase Auth (linking to `auth.users`), but stores application-specific profile data.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key | Linked to Supabase `auth.users.id` |
| `email` | `text` | Unique, Not Null | |
| `first_name` | `text` | Not Null | |
| `last_name` | `text` | Not Null | |
| `middle_name` | `text` | Nullable | |
| `suffix` | `text` | Nullable | |
| `contact_number` | `text` | Not Null | |
| `avatar_url` | `text` | Nullable | Supabase Storage URL |
| `role` | `role` | Default: `PATIENT` | |
| `is_verified` | `boolean`| Default: `false` | |
| `cancel_count` | `int` | Default: 0 | Tracks reliability / credibility |
| `no_show_count`| `int` | Default: 0 | Tracks reliability / credibility |
| `created_at` | `timestamptz` | Default: `now()` | |
| `updated_at` | `timestamptz` | | |

### 2. `doctors`
Stores clinic doctors and their specializations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default: `uuid_generate_v4()` | |
| `first_name` | `text` | Not Null | |
| `last_name` | `text` | Not Null | |
| `specialization`| `text` | Nullable | |
| `is_active` | `boolean`| Default: `true` | |

### 3. `doctor_schedules`
Defines custom working hours for a doctor per day of the week.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default: `uuid_generate_v4()` | |
| `doctor_id` | `uuid` | Foreign Key (`doctors.id`) | |
| `day_of_week` | `int` | Not Null | 0 = Sunday, 1 = Monday, etc. |
| `start_time` | `text` | Not Null | e.g., "09:00" |
| `end_time` | `text` | Not Null | e.g., "17:00" |
| `break_start_time`| `text`| Nullable | |
| `break_end_time` | `text` | Nullable | |

*Constraint:* Unique index on `(doctor_id, day_of_week)`.

### 4. `services`
Defines the clinic's offered services and durations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default: `uuid_generate_v4()` | |
| `name` | `text` | Not Null | |
| `description` | `text` | Nullable | |
| `duration_minutes`| `int` | Not Null | Variable service lengths (e.g., 30, 60) |
| `price` | `numeric`| Nullable | Optional base price |
| `is_active` | `boolean`| Default: `true` | |

### 5. `appointments`
Tracks all individual bookings. (Bulk/Group booking has been intentionally removed; 1 row = 1 flow).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default: `uuid_generate_v4()` | |
| `patient_id` | `uuid` | Foreign Key (`users.id`) | The user who booked the appointment |
| `dependent_first_name` | `text` | Nullable | Filled if booking for a family member |
| `dependent_last_name` | `text` | Nullable | Filled if booking for a family member |
| `dependent_relationship` | `text` | Nullable | E.g., "Child", "Spouse" |
| `service_id` | `uuid` | Foreign Key (`services.id`) | |
| `doctor_id` | `uuid` | Foreign Key (`doctors.id`) | |
| `date` | `date` | Not Null | Target date (YYYY-MM-DD) |
| `start_time` | `timestamptz` | Not Null | Exact start time |
| `end_time` | `timestamptz` | Not Null | Exact end time |
| `status` | `appointment_status` | Default: `PENDING` | |
| `user_note` | `text` | Nullable | Specific needs entered by patient |
| `status_reason`| `text` | Nullable | Reason for approval, rejection, or cancellation |
| `reschedule_count` | `int` | Default: 0 | Tracked to limit user requests |
| `created_at` | `timestamptz` | Default: `now()` | |
| `updated_at` | `timestamptz` | | |

*Constraint (Double Booking Prevention):* Unique index on `(doctor_id, date, start_time)` to strictly prevent conflicts at the database transaction level during submission.

### 6. `invoices`
Formal digital record keeping for completed appointments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default: `uuid_generate_v4()` | |
| `appointment_id`| `uuid` | Foreign Key (`appointments.id`), Unique | 1:1 Relationship |
| `amount` | `numeric`| Not Null | |
| `status` | `invoice_status` | Default: `DRAFT` | |
| `created_at` | `timestamptz` | Default: `now()` | |
| `updated_at` | `timestamptz` | | |

### 7. `audit_logs`
Tracks actions performed by staff (Secretaries/Admins) for accountability.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default: `uuid_generate_v4()` | |
| `actor_id` | `uuid` | Foreign Key (`users.id`) | The staff member performing the action |
| `action` | `text` | Not Null | e.g., "APPROVED_APPOINTMENT", "MARKED_NO_SHOW" |
| `target_id` | `uuid` | Not Null | ID of the affected record (e.g., Appointment ID) |
| `reason` | `text` | Nullable | |
| `created_at` | `timestamptz` | Default: `now()` | |

### 8. `email_outbox`
Stores outbound emails to guarantee delivery using the Transactional Outbox pattern.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default: `uuid_generate_v4()` | |
| `recipient` | `text` | Not Null | Recipient's email address |
| `subject` | `text` | Not Null | Email subject line |
| `template_name`| `text` | Not Null | e.g., 'signup_otp' |
| `payload` | `jsonb`| Not Null | Template variables (JSON format) |
| `status` | `email_status`| Default: `PENDING` | Enum: `PENDING`, `SENT`, `FAILED` |
| `error_logs` | `text` | Nullable | Captures API failure reason |
| `retry_count` | `int`  | Default: 0 | Auto-increments up to 3 |
| `created_at` | `timestamptz`| Default: `now()` | |
| `updated_at` | `timestamptz`| Default: `now()` | |
