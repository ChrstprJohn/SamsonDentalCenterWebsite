# Software Architecture & Engineering Blueprint

> **System Note:** Governed by `agent-skills/incremental-implementation` and `agent-skills/spec-driven-development`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document defines the official development standards, architectural patterns, and folder structure for the Samson Dental project. Its primary goal is to enforce a **Modular Monolith (Modulith)** architecture that isolates business domains, minimizes technical debt, and prevents the “Big Ball of Mud” anti‑pattern.

---

## 1️⃣ Core Architectural Principles

1. **Domain‑First Organization**  
   Files are grouped by business feature (e.g., *Users*, *Appointments*, *Billing*) rather than by technical layer. Each domain lives in its own self‑contained module, making addition, removal, or refactoring a localized operation.

2. **Strict One‑Way Dependencies & Isolation**  
   A module may depend on another, but never the reverse. When two modules need to interact, introduce an **Orchestrator** or an **Internal Event Emitter** to keep the dependency graph acyclic.

3. **Facade (“Front Door”) Pattern**  
   Every module exposes a single public entry point (`index.ts` or `module.facade.ts`). All external callers must go through this façade; internal details (like repositories, local utils, inner services) remain strictly private to the module.

4. **Data‑Layer Isolation (CQRS pattern where applicable)**  
   * **Controllers** – Handle HTTP traffic, request parsing, and response status codes only.  
   * **Use‑Cases / Services** – Contain pure business logic, free from framework‑specific objects (no `req`/`res`).  
   * **Repositories** – Direct interaction with the database.

---

## 2️⃣ Directory & Folder Blueprint

```text
src/
├── shared/                     # Global Shared Kernel
│   ├── auth/                   # Shared token verification & session middleware (Supabase Auth)
│   ├── database/               # Supabase client & raw SQL helpers
│   ├── errors/                 # Global error classes
│   ├── services/               # Infrastructure & external service integrations
│   │   └── email/              # Email delivery providers (e.g., ResendService)
│   ├── middleware/             # Validation, error handling
│   └── utils/                  # Global utilities (e.g., date-formatters)
│
├── modules/                    # Self-contained business domains
│   ├── patients/               # Focuses purely on consumer/patient workflows
│   │   ├── actions/            # Next.js Server Actions (e.g., registerPatientAction)
│   │   ├── dtos/               # Validation schemas (Zod)
│   │   ├── use-cases/          # Pure business logic (e.g., registerPatientUseCase)
│   │   ├── repositories/       # DB commands and queries
│   │   └── index.ts            # Public facade entry point
│   │
│   ├── emails/                 # Core domain logic for outbox templates & queue
│   │   ├── actions/            # processOutboxAction
│   │   ├── dtos/               # queueEmailDto
│   │   ├── use-cases/          # processOutboxUseCase
│   │   ├── repositories/       # emailOutboxCommands
│   │   └── index.ts            # Public facade entry point
│   │
│   ├── staff/                  # Focuses purely on clinic employees & roles
│   │   ├── routes.ts
│   │   ├── controllers/        # dentist.controller.ts, admin.controller.ts
│   │   ├── dtos/
│   │   ├── use-cases/          # update-staff-status.use-case.ts
│   │   └── repositories/
│   │
│   └── appointments/           # Interacts with patients/staff via IDs
│       ├── routes.ts
│       ├── controllers/
│       ├── use-cases/
│       ├── repositories/
│       └── index.ts
│
├── orchestrators/               # Cross‑module workflow coordinators
│   └── checkout.orchestrator.ts # Coordinates appointments + billing safely
│
├── app.ts                        # Server bootstrap (Registers all module routes.ts)
└── main.ts                       # Application entry point
```

---

## 3️⃣ Handling Growth: Best Practices When Files Get Too Long

In a Modulith architecture, files can become bloated as business logic grows. Follow these strict refactoring triggers to maintain readability and modularity:

### A. Routing Strategies (`routes.ts`)
* **Rule**: Do not hardcode all routes globally in `app.ts`.
* **Execution**: Every domain module handles its own router inside a `routes.ts` file (or `routes/` folder).
* **Wiring**: `app.ts` imports the domain router and mounts it to a prefix (e.g., `app.use('/api/v1/patients', patientRoutes)` and `app.use('/api/v1/staff', staffRoutes)`).

### B. When Controllers Get Too Large 
* **Trigger**: A single `controller.ts` file exceeds 150-200 lines or handles multiple distinct contexts (admin overrides vs patient requests).
* **Solution**: Split controllers by **Actor** or **Resource Sub-type**. 
  * Example: Instead of a massive `appointments.controller.ts`, split into `patient-booking.controller.ts`, `doctor-schedule.controller.ts`, and `admin-appointments.controller.ts`.

### C. When Services Grow Exponentially (Fat Services)
* **Trigger**: A `patients.service.ts` or `staff.service.ts` file becomes a "god class" containing 20+ unrelated methods.
* **Solution**: Transition from monolithic services to the **Command/Use-Case Pattern**.
  * Each business action gets its own file: `approve-appointment.use-case.ts`, `reschedule-appointment.use-case.ts`.
  * **Why?** It ensures single responsibility, restricts imports to only what that specific action needs, and makes unit testing much easier.

### D. When Repositories Overload (Complex Data Access)
* **Trigger**: A repository file mixes massive aggregations, full-text searches, and standard CRUD.
* **Solution**: Apply **CQRS (Command Query Responsibility Segregation)** at the file level:
  * `appointments.commands.ts` -> Handles mutations (`create`, `update`, `delete`).
  * `appointments.queries.ts` -> Handles reads (`findByDate`, `exportMonthlyReport`).

### E. Managing Utilities (Local vs. Global)
* **Trigger**: Unsure where to place a helper function.
* **Global Utils** (`shared/utils/`): Functions that have zero relation to business logic and are used everywhere (e.g., `format-date.util.ts`, `uid-generator.ts`).
* **Local Utils** (`modules/{name}/utils/`): Helper logic specific to one domain that shouldn't be exposed anywhere else (e.g., `calculate-appointment-fee.util.ts`).

---

## 4️⃣ Enterprise Patterns for Scale

To make this architecture completely bulletproof for a large-scale, enterprise-grade system, follow these advanced patterns:

### A. Internal Event Subscribers (`events/` or `subscribers/`)
Modules can emit events freely, but they should **never** await the result of an event emitted to another module.
* **Execution**: Create a `subscribers/` folder inside the module (e.g., `src/modules/billing/subscribers/on-appointment-completed.subscriber.ts`). This ensures async cross-module side effects (like generating an invoice after an appointment) are handled without creating direct dependencies.

### B. Dependency Injection (DI) & IoC
Repositories and Use-cases should receive their dependencies via parameters (or a DI container), rather than hardcoding imports.
* **Why?**: This prevents tight coupling and allows you to easily inject a mock database or a mock email service during testing.

### C. Domain-Specific Exceptions
Your pure business logic (`use-cases/`) shouldn't know anything about HTTP status codes.
* **Rule**: Modules must throw specific **Domain Errors** (e.g., `AppointmentSlotTakenError`). The Global Error Middleware in `shared/` is then responsible for mapping those specific domain errors to HTTP 409 Conflict. This keeps the core logic 100% decoupled from the Express/HTTP framework.

### D. Testing Strategy & Placement
* **Unit Tests**: Co-locate unit tests next to the files they test (e.g., `patient.controller.spec.ts` right next to `patient.controller.ts`). This makes it obvious when a file lacks coverage.
* **Integration/E2E Tests**: Place these in a global `test/` folder at the root, testing the system from the outside in (e.g., testing the actual HTTP endpoints).

### E. Standardized DTOs (Data Transfer Objects)
* **Input DTOs**: Use Zod schemas to validate incoming HTTP requests *before* they hit the controller.
* **Output DTOs (Mappers)**: **Never** return raw database rows to the client. Always pass the raw data through a mapper/serializer to strip out sensitive fields (like passwords or internal IDs) before sending the JSON response.

---

## 5️⃣ How to Use This Blueprint

1. **Copy the folder structure** into a new repository.  
2. **Create the shared kernel** (`src/shared`) before adding any domain modules. Ensure global utils and middleware are solid.
3. **Build features inside Domain Modules** (`src/modules/*`).
4. **Register Module Routes** inside your `app.ts`.  
5. **Export ONLY Facades** via `index.ts`. No module is allowed to reach directly into another module's `repositories/` or `utils/` files.
6. **Implement orchestrators** for cross‑domain workflows.  

Following these steps will keep the Samson Dental codebase **modular, clean, secure, and easy to extend** as new features are added.

---

*Document version: 1.2 – last updated 2026‑05‑21*