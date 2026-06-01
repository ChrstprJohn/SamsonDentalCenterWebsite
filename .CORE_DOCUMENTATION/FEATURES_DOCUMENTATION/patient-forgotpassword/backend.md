# Patient Forgot Password Feature: Backend Architecture

This document describes the backend systems, data layers, server actions, database interaction schemas, and event subscribers that govern the Patient Forgot Password flow.

---

## 📂 Backend File Structure & Colocation

```text
src/
├── modules/patients/
│   ├── actions/auth/
│   │   ├── request-password-reset.action.ts   # ⚡ Triggers recovery command & dispatcher
│   │   ├── reset-password.action.ts           # ⚡ Updates the user's password using Session
│   │   └── verify-otp.action.ts               # ⚡ Validates OTPs (Shared with Signup)
│   ├── repositories/auth/
│   │   └── password-recovery.commands.ts      # 💾 Generates Links & Queues Event
├── modules/emails/
│   ├── dtos/events/
│   │   └── password-reset-requested.event.dto.ts
│   └── subscribers/
│       └── on-password-reset-requested.subscriber.ts
└── orchestrators/
    └── event-subscribers.ts                   # 🔗 Bootstraps Subscribers
```

---

## ⚡ Secure Next.js Server Actions

### `request-password-reset.action.ts`
- **Validation**: Enforces strict Zod verification on the email.
- **Repository Execution**: Calls `password-recovery.commands.ts`.
- **Non-blocking Dispatch**: Utilizes Next.js `after()` to trigger the global `outboxDispatcher`. This ensures the UI returns instantly to the user without waiting for the Resend API to finish its HTTP request.

### `verify-otp.action.ts`
- **Dynamic Types**: Updated to accept a `type: 'signup' | 'recovery'` parameter.
- **Security Check**: Enforces explicit state validation for recoveries. It checks the database to ensure the user exists *before* validating the token, and confirms the generated session strictly matches the requested email address.

### `reset-password.action.ts`
- **Session Dependency**: Uses the `createClient().auth.getUser()` to verify the presence of a valid session established by `verify-otp.action.ts`.
- **Update**: Securely calls `supabase.auth.updateUser({ password })`.

---

## 🔄 The Outbox Repository Commands

The `password-recovery.commands.ts` strictly abstracts our business logic:
1. Queries the `users` table to fetch the patient's `firstName` (needed for the email template).
2. Fails silently if the user is missing (prevents email enumeration attacks).
3. Executes `supabaseAdmin.auth.admin.generateLink({ type: 'recovery' })` safely via the Server-Side Admin client.
4. Emits the `PASSWORD_RESET_REQUESTED` domain event carrying the payload: `{ email, firstName, otpCode }`.
