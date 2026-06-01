# Event Subscriber - Backend Implementation

## Core Components

### 1. The Generic `outbox` Database Table
The `outbox` table is a generic persistent queue for domain events.
- **event_type**: A string identifier (e.g., `PATIENT_REGISTERED`).
- **payload**: JSONB containing arbitrary data required by subscribers.
- **status**: An enum (`PENDING`, `PROCESSING`, `PROCESSED`, `FAILED`).
- **retry_count**: Incremented when a subscriber throws an error.

### 2. Concurrency-Safe RPC
A custom Postgres function `claim_pending_events(batch_size)` uses `FOR UPDATE SKIP LOCKED`. This allows the serverless worker to lock rows for itself and instantly mark them `PROCESSING`, ensuring no two workers process the same event.

### 3. The Decoupled Event Registry (`src/shared/outbox/outbox.registry.ts`)
Instead of hardcoding domain-specific handler imports within the `shared/` directory, a dynamic event registry mapping is used:
- **`registerSubscriber(eventType, handler)`**: Safely registers a function to receive events.
- **`getSubscribers(eventType)`**: Retrieves all functions registered for an event.
- This pattern completely removes compile-time coupling between the generic outbox infra and individual domain business logic.

### 4. The Dispatcher (`src/shared/outbox/outbox.dispatcher.ts`)
The `GlobalOutboxDispatcher` is the engine for the event bus. When awakened (usually via Next.js `after()`), it:
1. Claims a batch of `PENDING` events.
2. Looks up registered subscribers for each event's `event_type` from the Event Registry.
3. Invokes each registered handler in sequence.

### 5. Orchestrator Bootstrap (`src/orchestrators/event-subscribers.ts`)
Acts as the central configuration layer, mapping domain-specific subscribers to the event bus registry. It calls:
```typescript
registerSubscriber('PATIENT_REGISTERED', onPatientRegisteredSubscriber.handle);
```
During Next.js serverless app bootstrapping, calling `bootstrapEventSubscribers()` ensures all event-subscribers are fully registered and ready before any events are processed.

### 6. Domain Subscribers (`src/modules/*/subscribers/*.ts`)
Subscribers are isolated domain functions reacting to events (e.g., `onPatientRegisteredSubscriber` in the Emails module extracts the payload and sends the Resend API verification email).
**Safety Rule**: Subscribers MUST throw an error if their side-effect fails. This signals the Dispatcher to roll back the event status and schedule a retry.
