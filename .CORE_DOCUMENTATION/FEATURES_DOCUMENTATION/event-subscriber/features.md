# Event Subscriber (Database-Driven Event Bus)

## Overview
The Event Subscriber system provides a highly decoupled, robust mechanism for dispatching background tasks, notifications, and side-effects without blocking the main user interface. It utilizes a centralized `outbox` database table as its source of truth.

## Key Capabilities

### 1. Extensibility Without Touching Core Logic
If the clinic decides to add SMS notifications or Analytics tracking whenever a patient registers, developers *do not* need to modify the `patients` module. They simply create a new subscriber (e.g., `sms/subscribers/on-patient-registered.subscriber.ts`) and attach it to the dispatcher.

### 2. Guaranteed Delivery (Durability)
By using a persistent `outbox` table, events are never lost. If an external service (like Resend) goes down temporarily, the server action will gracefully fail the subscriber step, and the event remains in the database to be retried on the next processing tick.

### 3. Serverless Concurrency Safe
The system uses PostgreSQL's `FOR UPDATE SKIP LOCKED` inside an RPC to claim pending events. If two users sign up at the exact same millisecond, two parallel serverless functions will spin up. `SKIP LOCKED` ensures they grab distinct batches of events from the database, preventing race conditions or double-sending emails.

### 4. Zero Compile-Time Coupling
The architecture separates infrastructure from dynamic modules using an **Orchestration Registry Pattern**. The `shared/outbox` infrastructure contains absolutely no references or compile-time imports to specific domain folders (like `emails` or `sms`), ensuring clean architectural boundary limits and robust modular monolith design.

