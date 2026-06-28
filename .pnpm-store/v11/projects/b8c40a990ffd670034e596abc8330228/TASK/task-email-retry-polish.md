# Outbox Email Retry Polish Recommendations

Currently, outbox events are only processed as side effects of specific user actions (e.g., when a user makes another booking, requests an OTP, or logs in). If an email fails, it will remain pending until the next user action triggers the dispatcher.

Here is a list of recommended options to polish the outbox retry mechanism, ranging from simple admin triggers to fully automated background workers.

---

## Option 1: Automated Background Worker (Recommended)
Automatically poll and retry pending outbox events without requiring any human action.

### Tasks:
- [ ] **Setup a Scheduled Route/Endpoint**:
  - Create a secure Next.js Route Handler (e.g., `/api/cron/process-outbox`) that requires an authorization token/key.
  - Inside the endpoint, instantiate the admin client and execute `globalOutboxDispatcher(supabaseAdmin)()`.
- [ ] **Configure Cron Service**:
  - **In Production**: Bind the route to a cron service (like Vercel Cron Jobs, GitHub Actions, or Inngest) to trigger it every 1 to 5 minutes.
  - **In Development**: Setup a basic `setInterval` loop in a development-only server bootstrap function or middleware.

---

## Option 2: Admin/Secretary Dashboard Manual Retry
Empower administrators or secretary staff to manually trigger retries or view failure states.

### Tasks:
- [ ] **Create Outbox Monitoring View**:
  - Add an "Outbox Status" or "Notification Logs" tab in the Admin/Secretary Dashboard.
  - Query and display events from the `outbox` table (focusing on `FAILED` or `PENDING` events with a `retry_count > 0`).
  - Show the `error_logs` details so staff can see *why* it failed (e.g., "Missing RESEND_API_KEY").
- [ ] **Add Manual Retry Trigger**:
  - Add a "Retry" button next to failed/pending outbox rows.
  - Connect this button to a Server Action that invokes `globalOutboxDispatcher` for that specific event ID or triggers a global dispatcher run.

---

## Option 3: Supabase Database Webhooks + Edge Functions
Leverage Supabase's native database triggers to make processing completely event-driven.

### Tasks:
- [ ] **Create a Supabase Edge Function**:
  - Write an Edge Function (e.g. `process-outbox`) that bootstraps the dispatcher and processes events.
- [ ] **Enable Database Webhook**:
  - Configure a Supabase Database Webhook on the `outbox` table:
    - Trigger `AFTER INSERT` on `outbox` to immediately call the Edge Function.
  - Install and enable `pg_cron` in the database to run a periodic query every minute that triggers the Edge Function for any remaining `PENDING` rows.
