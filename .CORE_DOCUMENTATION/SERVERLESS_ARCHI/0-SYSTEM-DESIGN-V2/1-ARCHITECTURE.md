# Software Architecture & Engineering Blueprint

> **System Note:** Governed by `agent-skills/incremental-implementation` and `agent-skills/spec-driven-development`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document defines the official development standards, architectural patterns, and folder structure for the Samson Dental project using **Next.js (App Router)**. Its primary goal is to enforce a **Modular Monolith (Modulith)** architecture that isolates business domains, minimizes technical debt, and prevents the “Big Ball of Mud” anti‑pattern, while embracing the full-stack nature of Next.js.

---

## 1️⃣ Core Architectural Principles

1. **Domain‑First Organization**  
   Files are grouped by business feature (e.g., *Users*, *Appointments*, *Billing*) rather than by technical layer. Each domain lives in its own self‑contained module, making addition, removal, or refactoring a localized operation.

2. **Strict One‑Way Dependencies & Isolation**  
   A module may depend on another, but never the reverse. When two modules need to interact, introduce an **Orchestrator** or an **Internal Event Emitter** to keep the dependency graph acyclic.

3. **Facade (“Front Door”) Pattern (Modified for Next.js)**  
   Every module exposes a single public entry point (`index.ts`) for programmatic/RSC queries. However, due to Next.js compiler behaviors with the `'use server'` directive, **Server Actions (`actions/*`) must NOT be re-exported via `index.ts`**. Import Server Actions directly from their respective files in `src/modules/{domain}/actions/` in your UI components to avoid build-time dependency cycle issues and metadata leakage.

4. **Data‑Layer Isolation (CQRS pattern where applicable)**  
   * **Server Actions / Route Handlers** – Act as the Controllers. Handle HTTP traffic, parsing `FormData` or JSON, and Next.js specific responses (`revalidatePath`, `redirect`).  
   * **Use‑Cases / Services** – Contain pure business logic, free from Next.js-specific objects (no `NextRequest` or Next.js caching logic).  
   * **Repositories** – Direct interaction with the database (Supabase).

---

## 2️⃣ Directory & Folder Blueprint

```text
src/
├── app/                        # Next.js App Router (UI Layer)
│   ├── (public)/               # Landing page routes
│   ├── (portals)/              # Role-based portals
│   │   ├── user/
│   │   ├── admin/
│   │   └── secretary/
│   └── api/                    # Optional REST endpoints (Route Handlers)
│
├── shared/                     # Global Shared Kernel
│   ├── auth/                   # Shared token verification (Supabase SSR Auth)
│   ├── database/               # Supabase client (`@supabase/supabase-js`)
│   ├── errors/                 # Global error classes
│   ├── components/             # Global UI components
│   └── utils/                  # Global utilities (e.g., date-formatters)
│
├── modules/                    # Self-contained business domains (The Core)
│   ├── patients/               # Focuses purely on consumer/patient workflows
│   │   ├── actions/            # Next.js Server Actions (Controllers, split by actor/resource)
│   │   │   └── patient.actions.ts
│   │   ├── dtos/
│   │   ├── use-cases/          # register-patient.use-case.ts
│   │   ├── repositories/       # patient.commands.ts, patient.queries.ts
│   │   └── index.ts            # Public Facade
│   │
│   ├── staff/                  # Focuses purely on clinic employees & roles
│   │   ├── actions/            # 👈 Folder to prevent god classes!
│   │   │   ├── admin-staff.actions.ts     # Actions only the Admin can do (e.g., terminate staff)
│   │   │   ├── doctor-schedule.actions.ts # Actions specific to Doctors (e.g., update clinic hours)
│   │   │   └── profile.actions.ts         # Actions any logged-in staff can do (e.g., update phone)
│   │   ├── use-cases/
│   │   │   ├── create-staff.use-case.ts
│   │   │   ├── update-doctor-hours.use-case.ts
│   │   │   └── terminate-employment.use-case.ts
│   │   ├── repositories/
│   │   │   ├── staff.commands.ts
│   │   │   └── staff.queries.ts
│   │   └── index.ts            # Public Facade (Ignores actions folder entirely)
│   │
│   └── appointments/           # Interacts with patients/staff via IDs
│       ├── actions/
│       │   ├── patient-booking.actions.ts
│       │   └── admin-appointments.actions.ts
│       ├── use-cases/
│       ├── repositories/
│       └── index.ts
│
└── orchestrators/               # Cross‑module workflow coordinators
    └── checkout.orchestrator.ts # Coordinates appointments + billing safely
```

---

## 3️⃣ Handling Growth: Best Practices When Files Get Too Long

In a Modulith architecture, files can become bloated as business logic grows. Follow these strict refactoring triggers to maintain readability and modularity:

### A. Routing Strategies (`app/` Directory)
* **Rule**: Do not hardcode massive switch statements in a single page or layout.
* **Execution**: Leverage Next.js nested routing and Route Groups (`(portals)`) to naturally segment the UI by actor and domain.

### B. When Server Actions Get Too Large 
* **Trigger**: A single action file inside the `actions/` folder exceeds 150-200 lines or handles multiple distinct contexts (admin overrides vs patient requests).
* **Solution**: Split Server Actions further by **Actor** or **Resource Sub-type**. 
  * Example: Instead of a massive `appointments.actions.ts`, ensure they are split into `patient-booking.actions.ts`, `doctor-schedule.actions.ts`, and `admin-appointments.actions.ts` inside the `actions/` folder.

### C. When Services Grow Exponentially (Fat Services)
* **Trigger**: A `patients.service.ts` or `staff.service.ts` file becomes a "god class" containing 20+ unrelated methods.
* **Solution**: Transition from monolithic services to the **Command/Use-Case Pattern**.
  * Each business action gets its own file: `approve-appointment.use-case.ts`, `reschedule-appointment.use-case.ts`.
  * **Why?** It ensures single responsibility, restricts imports to only what that specific action needs, and makes unit testing much easier.

### D. Pre-emptive Repository Segregation (No God Classes)
* **Rule**: Never create a catch-all generic repository like `patient.commands.ts`. Break them down immediately upon creation by sub-resource or actor to prevent technical debt.
* **Execution**: Apply **CQRS (Command/Query Responsibility Segregation)** combined with specific context splitting right out of the gate:
  **1. Splitting by Resource Sub-type**
  * `patient-profile.commands.ts` (Updates to name, email, etc.)
  * `patient-insurance.commands.ts` (Handles insurance billing details)
  * `patient-medical-history.commands.ts` (Handles sensitive health records)

  **2. Splitting by Actor (The "Samson Dental" way)**
  If rules for Admins vs. Patients dictate entirely different data checks:
  * `admin-patient.commands.ts`
  * `self-service-patient.commands.ts`

* **Why this prevents technical debt**:
  * **Dependencies remain light:** You only inject the specific repository needed for a Use-Case.
  * **Testability stays high:** You only need to mock 3-5 methods instead of 50.
  * **Conflict reduction:** Multiple developers can work on different command files without creating massive git merge conflicts.

### E. Managing Utilities (Local vs. Global)
* **Trigger**: Unsure where to place a helper function.
* **Global Utils** (`shared/utils/`): Functions that have zero relation to business logic and are used everywhere (e.g., `format-date.util.ts`, `uid-generator.ts`).
* **Local Utils** (`modules/{name}/utils/`): Helper logic specific to one domain that shouldn't be exposed anywhere else (e.g., `calculate-appointment-fee.util.ts`).

---

## 4️⃣ Enterprise Patterns for Scale

To make this architecture completely bulletproof for a large-scale, enterprise-grade system, follow these advanced patterns:

### A. Internal Event Subscribers (`events/` or `subscribers/`)
Modules can emit events freely, but in a serverless environment (Vercel/Edge), **unawaited promises will be instantly frozen or killed** when the HTTP response is returned.
* **Execution**: You must use the Next.js `after()` API (or `unstable_after`) to explicitly tell the serverless runtime to keep the execution context alive for background operations. Create a `subscribers/` folder, and wrap the side-effect (like generating an invoice) inside `after(() => subscriberFn())`.

### B. Dependency Injection (DI) without Heavy IoC
Heavy Inversion of Control (IoC) containers (like InversifyJS) break Next.js fast-refresh and bloat serverless cold starts. Keep DI strictly **functional and localized**.
* **Execution**: Pass database clients or service interfaces directly as parameters to your Use-Case functions, or use simple factory closures. Avoid heavy decorators or reflect-metadata magic.

### C. Domain-Specific Exceptions & Error Boundaries
Your pure business logic (`use-cases/`) shouldn't know anything about HTTP status codes.
* **Rule**: Modules must throw specific **Domain Errors** (e.g., `AppointmentSlotTakenError`).
* **Next.js Integration**: Your Server Actions should catch these domain errors and return a structured `{ error: string }` object to the client, OR you can throw them and let Next.js catch them in an `error.tsx` boundary file for the specific route. This keeps the core logic decoupled from the UI framework.

### D. Testing Strategy & Placement
* **Unit Tests**: Co-locate unit tests next to the files they test (e.g., `patient.actions.spec.ts` right next to `patient.actions.ts`). This makes it obvious when a file lacks coverage.
* **E2E Tests**: Use Playwright or Cypress in a global `test/` folder at the root to test the full-stack Next.js application from the outside in.

### E. Standardized DTOs (Data Transfer Objects)
* **Input DTOs**: Use Zod schemas to validate incoming `FormData` or JSON *before* they hit the pure business logic in a Server Action.
* **Output DTOs (Mappers)**: **Never** return raw database rows to the client (especially in Server Actions/Components). Always pass the raw data through a mapper/serializer to strip out sensitive fields before passing it to the UI.

---

## 5️⃣ How to Use This Blueprint

1. **Initialize the Next.js App Router** structure.
2. **Create the shared kernel** (`src/shared`) before adding any domain modules. Ensure global utils and Supabase clients are solid.
3. **Build features inside Domain Modules** (`src/modules/*`).
4. **Wire the UI (`app/`) to the Modules** by importing Facades into your React Server Components (for data fetching) or calling Server Actions (for mutations).
5. **Export ONLY Facades** via `index.ts` (with the exception of `actions/` files which must be imported directly). No module is allowed to reach directly into another module's `repositories/` or `utils/` files.
6. **Implement orchestrators** for cross‑domain workflows.  

Following these steps will keep the Samson Dental codebase **modular, clean, secure, and easy to extend** as new features are added.

---

*Document version: 2.0 (Next.js Edition) – last updated 2026‑05‑25*