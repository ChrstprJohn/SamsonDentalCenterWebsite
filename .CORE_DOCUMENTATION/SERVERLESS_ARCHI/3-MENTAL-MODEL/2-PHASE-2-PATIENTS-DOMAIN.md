# Phase 2: Patients Domain (The Data Flow)

This phase establishes our **Modular Monolith** architecture. This is how data flows from the UI down to the database and back up.

## The Request Chain (Top to Bottom)

When a patient submits a Registration Form, it travels through these strict layers:

### 1. The UI (Client/Server Components)
* **Goal:** Collect user input blindly. No business logic.
* **Flow:** Calls the Server Action with raw form data.

### 2. The Server Action (`actions/`)
* **Goal:** The Bouncer & Manager (The API boundary).
* **Flow:** 
  1. **Validates** shape using Zod (DTOs).
  2. **Authenticates** the user via `shared/auth`.
  3. **Injects Dependencies:** Instantiates Supabase and passes it to the Repository, then passes the Repository to the Use-Case.
  4. Wraps execution in `try/catch` and returns a clean `{ success, data, error }` object.

### 3. The Use-Case (`use-cases/`)
* **Goal:** Pure Business Logic (The Brains).
* **Flow:** Doesn't know about HTTP or Supabase. It strictly applies clinic rules before commanding the Repository to save the data.

### 4. The Repository (`repositories/`)
* **Goal:** Database Execution (The Warehouse Worker).
* **Flow:** Blindly executes Postgres/Supabase insert/select statements and returns raw rows (or throws `DomainError`s on failure). 

## Development Order (Bottom to Top)
When actually coding a feature, we build in reverse of the request chain:
1. **DTOs:** Define the Zod schemas so we know the data shape.
2. **Repositories:** Write the Supabase queries. (Split Commands/Queries to avoid God classes).
3. **Use-Cases:** Write the business logic and inject the Repository.
4. **Server Action:** Write the Next.js boundary and wire everything up.
5. **Facade (`index.ts`):** Export the DTOs/Types for cross-module usage (never export Actions here).