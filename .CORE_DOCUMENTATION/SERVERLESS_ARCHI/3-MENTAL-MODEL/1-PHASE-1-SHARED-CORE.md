# Phase 1: Shared Core (Global Kernel)

Before any business logic is written, we need a strong foundation. The Shared Core is the base layer that all domains (Patients, Staff, Appointments) will depend on. 

## 1. Global Errors (`shared/errors/`)
* **What it is:** Custom error classes like `DomainError`, `NotFoundError`, and `ValidationError`.
* **Why it matters:** Instead of throwing generic JavaScript `Error` objects that crash Next.js, our repositories and use-cases throw these controlled domain errors. Our Server Actions can then gracefully catch them and send back clean `{ success: false, error: "..." }` responses.

## 2. Authentication Utilities (`shared/auth/`)
* **What it is:** Functions like `getAuthenticatedUser()` and `authorizeRole()`.
* **Why it matters:** It centralizes Supabase session checks. Instead of writing Supabase auth code in every Server Action, the Action just calls `getAuthenticatedUser()`. If the auth provider changes in the future, we only update this one file.

## 3. Database Clients (`shared/database/`)
* **What it is:** The Supabase clients for both React Client and Next.js Server Components/Actions.
* **Why it matters:** Next.js has strict rules about code running exclusively on the server vs client. Keeping these isolated prevents build crashes.

## 4. Common Utilities (`shared/utils/`)
* **What it is:** Pure helper functions (`slugify`, `capitalize`, `date formatters`).
* **Why it matters:** Highly reusable code that has zero business logic inside it.

---
**Summary:** Phase 1 sets up the "Tools" in our toolbox. Every aspect of Phase 1 is isolated, highly tested, and completely ignorant of the actual business rules of the Dental Clinic.