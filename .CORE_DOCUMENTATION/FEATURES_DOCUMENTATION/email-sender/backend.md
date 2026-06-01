# Email Sender (OTP) - Backend Architecture

## Architectural Pattern: Transactional Outbox

This module strictly adheres to the **Transactional Outbox Pattern** to ensure absolute data integrity between the user creation and the OTP email dispatch.

### Why this pattern?
If an API route attempts to create a user and then send an email synchronously:
1. The user might be created, but the email API crashes. The user exists but receives no OTP.
2. The user might wait 5 seconds for the email API to respond, resulting in a poor UX.

### The Solution
Instead of sending the email immediately, we write a record to the `email_outbox` table in the same exact transaction/step as the user creation. 
* If the user creation fails, the email is never queued.
* If the email queueing fails, the user creation is aborted.

## Database Schema (`email_outbox`)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary Key |
| `recipient` | TEXT | The patient's email address |
| `subject` | TEXT | Email subject line |
| `template_name` | TEXT | Identifier for the React Email template (e.g. `signup_otp`) |
| `payload` | JSONB | Data needed for the template (e.g. `{ "firstName": "John", "otpCode": "57194889" }`) |
| `status` | ENUM | `PENDING`, `SENT`, `FAILED` |
| `error_logs` | TEXT | Stores the error trace if Resend fails |
| `retry_count` | INT | Tracks delivery attempts |

## Execution Flow

1. **Patient Registration Use-Case**:
   - Creates the Supabase Auth User.
   - Generates the OTP.
   - Inserts a row into `email_outbox`.

2. **Next.js `after()` API**:
   - Once the HTTP response is sent back to the frontend, `after()` runs a background worker.
   - The worker fetches all `PENDING` outbox records.
   - For each record, it invokes `ResendService`.
   - On success, it marks the status as `SENT`. On failure, it increments `retry_count` and marks as `FAILED`.

## Service Isolation (Environment Agnostic)
The core business logic never imports the `Resend` SDK directly. The logic only interfaces with an `EmailOutboxCommands` repository. The actual `ResendService` lives in `src/shared/services/email/resend.service.ts` and is the only file aware of the `RESEND_API_KEY`.
