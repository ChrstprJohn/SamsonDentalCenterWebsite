# Email Sender (OTP) - Backend Architecture

## Architectural Pattern: Generic Event Bus (Transactional Outbox)

This module strictly adheres to the **Transactional Outbox Pattern** combined with a **Domain Event Bus** to ensure absolute data integrity between the user creation and the OTP email dispatch.

### Why this pattern?
If an API route attempts to create a user and then send an email synchronously:
1. The user might be created, but the email API crashes. The user exists but receives no OTP.
2. The user might wait 5 seconds for the email API to respond, resulting in a poor UX.

### The Solution
Instead of sending the email immediately, we emit a generic Domain Event to the `outbox` table in the same exact transaction/step as the user creation. 
* If the user creation fails, the event is never queued.
* If the event queueing fails, the user creation is aborted.

## Database Schema (`outbox`)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary Key |
| `event_type` | TEXT | Identifier for the Event (e.g., `PATIENT_REGISTERED`, `PASSWORD_RESET_REQUESTED`) |
| `payload` | JSONB | Data needed for the subscribers (e.g. `{ "email": "john@example.com", "firstName": "John", "otpCode": "57194889" }`) |
| `status` | ENUM | `PENDING`, `PROCESSED`, `FAILED` |
| `error` | TEXT | Stores the error trace if the subscriber fails |
| `retry_count` | INT | Tracks delivery attempts |

## Execution Flow

1. **Patient Registration Use-Case**:
   - Creates the Supabase Auth User.
   - Generates the OTP.
   - Inserts a row into `outbox` with `event_type = 'PATIENT_REGISTERED'`.

2. **Next.js `after()` API**:
   - Once the HTTP response is sent back to the frontend, `after()` runs the Global Outbox Dispatcher.
   - The worker fetches all `PENDING` outbox records.
   - For each record, it routes the payload to the registered Subscribers (e.g., `onPatientRegisteredSubscriber`).
   - The subscriber validates the payload and invokes `ResendService`.
   - On success, it marks the status as `PROCESSED`. On failure, it increments `retry_count` and marks as `FAILED`.

## Service Isolation (Environment Agnostic)
The core business logic never imports the `Resend` SDK directly. The logic only interfaces with the Outbox Event dispatching system. The actual `ResendService` lives in `src/shared/services/email/resend.service.ts` and is strictly consumed by the Subscribers.
