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

4. **Data‑Layer Isolation (Strict Use-Case Pattern)**  
   * **Server Actions / Route Handlers** – Act as the Controllers. Handle HTTP traffic, parsing `FormData` or JSON, and Next.js specific responses (`revalidatePath`, `redirect`).  
   * **Use‑Cases / Services** – Contain pure business logic, free from Next.js-specific objects. Every operation (both write commands and read queries) must go through a Use-Case boundary. This ensures consistency (UI/controllers interact uniformly with the domain) and future-proofing (e.g., adding authorization, caching, or logging later without refactoring the UI/controllers).  
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
│   ├── services/               # Example: a fully expanded domain module
│   │   ├── actions/
│   │   │   └── management/                        # Subfolder by aggregate/actor
│   │   │       ├── create-service.action.ts        # ONE action per file
│   │   │       ├── create-service.action.spec.ts   # Co-located test (MANDATORY)
│   │   │       ├── get-services.action.ts
│   │   │       ├── get-services.action.spec.ts
│   │   │       └── ...                            # One file per operation
│   │   ├── dtos/
│   │   │   ├── index.ts                            # Barrel re-export only
│   │   │   └── management/                        # Subfolder by aggregate
│   │   │       ├── create-service.dto.ts           # ONE DTO per operation
│   │   │       ├── create-service.dto.spec.ts      # Co-located test (MANDATORY)
│   │   │       ├── update-service.dto.ts
│   │   │       ├── update-service.dto.spec.ts
│   │   │       ├── service-response.dto.ts         # Dedicated response/output shape
│   │   │       └── service-response.dto.spec.ts
│   │   ├── use-cases/
│   │   │   └── management/
│   │   │       ├── create-service.use-case.ts      # ONE use-case per operation
│   │   │       ├── create-service.use-case.spec.ts
│   │   │       └── ...
│   │   ├── repositories/
│   │   │   └── management/
│   │   │       ├── service.commands.ts             # Write operations
│   │   │       ├── service.commands.spec.ts
│   │   │       ├── service.queries.ts              # Read operations
│   │   │       └── service.queries.spec.ts
│   │   └── index.ts                               # Public Facade
│   │
│   └── appointments/           # Interacts with patients/staff via IDs
│       ├── actions/
│       │   ├── booking/
│       │   │   ├── submit-booking.action.ts
│       │   │   └── submit-booking.action.spec.ts
│       │   └── admin/
│       │       ├── update-status.action.ts
│       │       └── update-status.action.spec.ts
│       ├── dtos/
│       │   ├── index.ts
│       │   └── booking/
│       │       ├── submit-booking.dto.ts
│       │       └── submit-booking.dto.spec.ts
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

### D. Pre-emptive Directory & File Segregation (No Junk Drawers)

> ⚠️ **MANDATORY FROM DAY ONE — NOT A FUTURE REFACTOR TRIGGER.**  
> Do NOT create combined/monolithic files and plan to split them later. Structure correctly from the first file.

* **Rule**: Every layer (`actions/`, `use-cases/`, `dtos/`, `repositories/`) must be organized into **aggregate subfolders** from the very first file created. Never place files directly in the layer root.

* **One File = One Operation.** Every operation gets its own dedicated file — never group multiple operations into a single file. Each source file must be accompanied by a co-located `.spec.ts` test file.

  **❌ WRONG — never do this:**
  ```
  dtos/
  └── service.dto.ts          ← contains CreateDto + UpdateDto + ResponseDto — FORBIDDEN
  ```

  **✅ CORRECT — always do this:**
  ```
  dtos/
  ├── index.ts                ← barrel re-export only, no logic
  └── management/             ← aggregate subfolder
      ├── create-service.dto.ts      ← one DTO, one concern
      ├── create-service.dto.spec.ts ← co-located test
      ├── update-service.dto.ts
      ├── update-service.dto.spec.ts
      ├── service-response.dto.ts    ← dedicated output shape
      └── service-response.dto.spec.ts
  ```

* **Apply this structure uniformly** across all layers. If you have `dtos/management/`, you must match it with `use-cases/management/`, `actions/management/`, and `repositories/management/`.

* **Splitting by Resource Sub-type** (for larger domains with multiple aggregates):
  * `repositories/booking/appointment-booking.commands.ts`
  * `repositories/availability/appointment-availability.queries.ts`
  * Match: `dtos/booking/`, `use-cases/booking/`, `actions/booking/`

* **Splitting by Actor** (when admin vs patient have different rules):
  * `actions/admin/update-status.action.ts`
  * `actions/patient/submit-booking.action.ts`

* **Why this prevents technical debt**:
  * **No refactoring debt:** The structure is correct from the start — no costly reorgs later.
  * **Zero junk drawers:** Files are always logically clustered, never dumped in a flat root layer.
  * **Light dependencies:** Each file imports only the specific type/schema it needs.
  * **High testability:** Each file has a single responsibility, making mocking and assertions trivial.
  * **Conflict-free:** Developers work in isolated files with no merge conflicts on shared god-files.

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

> ⚠️ **ONE FILE PER OPERATION — NEVER COMBINE DTOs.**

* **Mandatory File Naming Convention**: Every DTO must live in its own file, named after the operation it belongs to:
  * `create-service.dto.ts` → `createServiceSchema` + `CreateServiceDto`
  * `update-service.dto.ts` → `updateServiceSchema` + `UpdateServiceDto`
  * `service-response.dto.ts` → `serviceResponseSchema` + `ServiceResponseDto`

* **Co-located Tests (Mandatory)**: Every `.dto.ts` file must have a sibling `.dto.spec.ts` file that tests all schema validation cases (valid input, missing required fields, invalid formats, edge cases).

* **DTOs Barrel (`dtos/index.ts`)**: Create an `index.ts` inside `dtos/` that re-exports all individual DTO files. This is the **only** file the module `index.ts` should reference for DTOs:
  ```ts
  // dtos/index.ts — re-export only, no schema definitions here
  export * from './management/create-service.dto';
  export * from './management/update-service.dto';
  export * from './management/service-response.dto';
  ```

* **Input DTOs**: Use Zod schemas to validate incoming `FormData` or JSON *before* they hit the pure business logic in a Server Action. The schema and the inferred type must both be exported from the same file.

* **Output DTOs (Response Shape)**: **Never** return raw database rows to the client. Define a dedicated `*-response.dto.ts` file with a Zod schema that defines exactly what the module exposes. Strip all sensitive or internal fields at this boundary.

* **Derivation is allowed**: An `update-*.dto.ts` may import from its matching `create-*.dto.ts` to extend or `.partial()` it — but it must still live in its own file:
  ```ts
  // update-service.dto.ts
  import { createServiceSchema } from './create-service.dto';
  export const updateServiceSchema = createServiceSchema.partial().extend({ id: z.string().uuid() });
  export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;
  ```

### F. Coding, Casing, and Naming Conventions

To maintain strict consistency and eliminate casing mixtures, we enforce the following conventions:

#### 1. File Naming Conventions
All filenames within a module must use **kebab-case** with double extensions indicating their architectural layer:
- **DTOs**: `[operation].dto.ts` & `[operation].dto.spec.ts`
- **Use Cases**: `[operation].use-case.ts` & `[operation].use-case.spec.ts`
- **Actions**: `[operation].action.ts` & `[operation].action.spec.ts`
- **Repositories**: `[resource].commands.ts`, `[resource].queries.ts` & their `.spec.ts` siblings.

#### 2. Casing Standards for Variables and Properties
- **Application Code & DTOs**: **Strictly `camelCase`**. Banish all `snake_case` properties from the application layer.
  - *Yes*: `durationMinutes`, `serviceType`, `isActive`, `appointmentId`.
  - *No*: `duration_minutes`, `service_type`, `is_active`, `appointment_id`.
- **Database & Supabase Payload Boundaries**: The database naturally uses `snake_case`. Mappers must bridge the gap.
  - Each response DTO must expose a mapper function (`mapXRecord`) that translates DB `snake_case` payloads to the strictly typed `camelCase` DTO interface.
  - Banish direct use of raw DB types in use-cases and controllers.

#### 3. Zod Schema & Types Naming
- **Zod Schema Variable**: `camelCase` ending in `Schema` (e.g. `patientProfileSchema`, `serviceResponseSchema`, `createServiceSchema`).
- **Inferred DTO Type**: **PascalCase** ending in `Dto` (e.g. `PatientProfileDto`, `ServiceResponseDto`, `CreateServiceDto`).

#### 4. Architectural Component Conventions

##### Use Cases
- **Filenames**: `[operation].use-case.ts` (e.g. `register-patient.use-case.ts`)
- **Export Pattern**: Export a single `camelCase` function matching the filename (e.g. `export const registerPatientUseCase = ...`).

##### Server Actions
- **Filenames**: `[operation].action.ts` (e.g. `submit-booking.action.ts`)
- **Export Pattern**: Export a single `camelCase` function ending in `Action` (e.g. `export const submitBookingAction = ...`). Server Actions must contain the `'use server';` directive at the top of the file.

##### Repositories (CQRS separation)
- **Filenames**: `[resource].queries.ts` (for reads) or `[resource].commands.ts` (for writes/mutations).
- **Export Pattern**: Export individual `camelCase` query/command functions (e.g. `export const getClinicAppointments = ...`, `export const createInvoice = ...`).
- **Data Boundary**: Every repository function returning data must invoke the matching DTO mapper at the repository boundary, ensuring that all upstream components (Use Cases, Actions, UI) receive standard `camelCase` objects.

---

## 5️⃣ Golden Coding Patterns & DRY Blueprints

To enforce strict separation of concerns and maximize DRY (Don't Repeat Yourself), developers must follow these standard coding templates.

### A. DRY Database Mappers (Shared Helpers)
Always import from `@/shared/utils` instead of writing custom parser primitives in every file.

```ts
// src/shared/utils/mapping.util.ts
export const stringValue = (value: unknown, fallback = ""): string => 
  typeof value === "string" ? value : fallback;

export const nullableStringValue = (value: unknown): string | null => 
  typeof value === "string" && value.length > 0 ? value : null;

export const numberValue = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};
```

---

### B. Standard DTO & Mapper Blueprint

```ts
// src/modules/services/dtos/management/service-response.dto.ts
import { z } from "zod";
import { stringValue, numberValue, booleanValue } from "@/shared/utils";

export const serviceResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  durationMinutes: z.number().int().positive(),
  isActive: z.boolean(),
});

export type ServiceResponseDto = z.infer<typeof serviceResponseSchema>;

type MaybeRecord = Record<string, unknown>;

export const mapServiceRecord = (record: MaybeRecord): ServiceResponseDto => ({
  id: stringValue(record.id),
  name: stringValue(record.name),
  durationMinutes: numberValue(record.duration_minutes ?? record.durationMinutes),
  isActive: booleanValue(record.is_active ?? record.isActive, true),
});

export const mapServiceRecords = (records: MaybeRecord[]): ServiceResponseDto[] =>
  records.map((record) => mapServiceRecord(record));
```

---

### C. Standard CQRS Repository Blueprint
Repository maps camelCase arguments to snake_case table columns for DB operations, and maps results to standard DTO schemas immediately.

```ts
// src/modules/services/repositories/management/service.commands.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { CreateServiceDto } from "../../dtos/management/create-service.dto";
import { ServiceResponseDto, mapServiceRecord } from "../../dtos/management/service-response.dto";

export class ServiceCommandsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createService(data: CreateServiceDto): Promise<ServiceResponseDto> {
    const dbPayload = {
      name: data.name,
      duration_minutes: data.durationMinutes,
      is_active: data.isActive,
    };

    const { data: result, error } = await this.supabase
      .from("services")
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw new Error(`Failed to create service: ${error.message}`);
    return mapServiceRecord(result);
  }
}
```

---

### D. Standard Use Case Blueprint

```ts
// src/modules/services/use-cases/management/create-service.use-case.ts
import { ServiceCommandsRepository } from "../../repositories/management/service.commands";
import { CreateServiceDto } from "../../dtos/management/create-service.dto";
import { ServiceResponseDto } from "../../dtos/management/service-response.dto";

export class CreateServiceUseCase {
  constructor(private readonly serviceCommands: ServiceCommandsRepository) {}

  async execute(data: CreateServiceDto): Promise<ServiceResponseDto> {
    // Pure business validation rules go here
    return await this.serviceCommands.createService(data);
  }
}
```

---

### E. Standard Server Action Blueprint

```ts
// src/modules/services/actions/management/create-service.action.ts
"use server";

import { CreateServiceDto, createServiceSchema } from "../../dtos/management/create-service.dto";
import { CreateServiceUseCase } from "../../use-cases/management/create-service.use-case";
import { ServiceCommandsRepository } from "../../repositories/management/service.commands";
import { createClient } from "@/shared/database/server";

export async function createServiceAction(data: CreateServiceDto) {
  try {
    // 1. Zod input validation
    const parsed = createServiceSchema.parse(data);

    // 2. DI Setup
    const supabase = await createClient();
    const repository = new ServiceCommandsRepository(supabase);
    const useCase = new CreateServiceUseCase(repository);

    // 3. Execution
    const result = await useCase.execute(parsed);
    return { data: result };
  } catch (error: any) {
    return { error: error.message || "Failed to create service" };
  }
}
```

---

## 6️⃣ How to Use This Blueprint

1. **Initialize the Next.js App Router** structure.
2. **Create the shared kernel** (`src/shared`) before adding any domain modules. Ensure global utils and Supabase clients are solid.
3. **Build features inside Domain Modules** (`src/modules/*`).
4. **Wire the UI (`app/`) to the Modules** by importing Facades into your React Server Components (for data fetching) or calling Server Actions (for mutations).
5. **Export ONLY Facades** via `index.ts` (with the exception of `actions/` files which must be imported directly). No module is allowed to reach directly into another module's `repositories/` or `utils/` files.
6. **Implement orchestrators** for cross‑domain workflows.  

Following these steps will keep the Samson Dental codebase **modular, clean, secure, and easy to extend** as new features are added.

---

*Document version: 2.2 (Next.js Edition) – last updated 2026‑05‑30*  
*v2.2 changes: Documented strict coding templates and blueprints. Formalized DRY database mapping helper guidelines and mapped boundary examples across all architectural layers.*