# Event-Driven Architecture (Transactional Outbox)

## The Core Concept
The Samson Dental system has evolved from a simple Modular Monolith with orchestration to a **Database-Driven Event Bus** architecture, ensuring absolute reliability and zero-loss background tasks.

Instead of a Next.js Server Action explicitly invoking the Emails module (Orchestration), it instead **emits a generic Domain Event** into the `outbox` table using `src/shared/outbox/outbox.commands.ts`.

## The Execution Flow

1. **Emit**: A repository or action (e.g., `patient-profile.commands.ts`) executes a primary transaction (like creating a user). Before finishing, it emits an event like `PATIENT_REGISTERED` to the `outbox` table.
2. **Trigger Dispatcher**: The Next.js API uses `after()` to non-blockingly wake up the `GlobalOutboxDispatcher`.
3. **Claim & Lock**: The dispatcher queries the `outbox` table using a custom Postgres RPC `claim_pending_events()`, which leverages `FOR UPDATE SKIP LOCKED`. This guarantees that if multiple users register at the same time, multiple dispatcher instances won't process the same events.
4. **Route**: The dispatcher iterates through the events and calls the respective "Subscribers".
5. **Handle**: Subscribers (`src/modules/{domain}/subscribers/{event}.subscriber.ts`) execute their side effects (e.g., sending Resend emails, logging analytics).
6. **Acknowledge**: If successful, the dispatcher marks the event as `PROCESSED`. If failed, it is marked `FAILED` (or left `PENDING` for a finite number of retries).

## Supabase OTP Constraint
Ideally, outbox events are created purely by PostgreSQL triggers upon row insertion. However, for features like Patient Registration, the **plaintext OTP code** is generated transiently by the Supabase Next.js SDK. A database trigger cannot read this generated token. Therefore, we deliberately emit the outbox event from the server-side code (Command pattern) rather than a Postgres trigger, preserving the OTP for the email subscriber.

## Zero-Coupling Registry and Orchestration Bootstrap
To ensure strict domain isolation within our Modular Monolith (where `shared/` must never import from dynamic domain `modules/`), the architecture employs a decoupled **Registry** pattern:
1. **The Registry (`src/shared/outbox/outbox.registry.ts`)**: Manages the event-to-handler mappings completely independent of any domain module.
2. **The Orchestration Bootstrap (`src/orchestrators/event-subscribers.ts`)**: Implemented at the orchestrator layer to tie specific domain handlers (like `onPatientRegisteredSubscriber.handle`) to the generic outbox registry.
3. **Prevention of Serverless Cold-Start Gaps**: Because Next.js serverless functions are ephemeral, dynamic imports or in-memory registrations can easily be cleared. By calling `bootstrapEventSubscribers()` at the initialization of the `GlobalOutboxDispatcher`, we guarantee that all subscribers are properly wired into the registry before any batch processing takes place.

