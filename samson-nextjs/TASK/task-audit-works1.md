# Codebase & Architecture Audit: Auth & Event Modules

This audit reviews the recently implemented features (Patient Login, OTP Verification, Forgot Password, and Event Subscribers) against the strict Modular Monolith architecture rules defined in `1-ARCHITECTURE.md` and `1.5-CODING-PATTERNS.md`.

## 🚨 Critical Architectural Violations Found

The primary recurring violation is the **omission of the Use-Case and Repository layers**. Server Actions are currently acting as "God Functions," handling request parsing, database querying, Supabase Auth interaction, and business logic all in one place.

This directly violates:
- **1-ARCHITECTURE.md (Section 1.4)**: Data-Layer Isolation (Strict Use-Case Pattern).
- **1.5-CODING-PATTERNS.md (Section D)**: Server Actions must *only* parse input, set up Dependency Injection, and call a Use Case.

---

### 1. Patient Login (`login.action.ts`)
- **Violation**: The Server Action calls `supabase.auth.signInWithPassword()` directly. It skips the Functional Use Case and Repository layers completely.
- **Why it’s bad**: Tying the UI controller directly to the DB/Auth provider makes it impossible to unit-test the login business logic without mocking the HTTP request, and makes it harder to add future rules (e.g., checking if the user account is locked) without bloating the action.
- **Required Fix**:
  - **Create**: `src/modules/patients/repositories/auth/login.commands.ts` (to wrap Supabase Auth).
  - **Create**: `src/modules/patients/use-cases/auth/login.use-case.ts`.
  - **Refactor**: `login.action.ts` to strictly inject dependencies and execute the Use Case.

### 2. Verify OTP / Resend OTP (`verify-otp.action.ts`)
- **Violation**: This is currently a massive "God Function". It mixes direct DB queries (`supabaseAdmin.from('users').select`), direct Auth calls (`supabase.auth.verifyOtp`), and pure business logic (validating email matches, checking session generation) all inside the Server Action. It also manually triggers the `after()` outbox dispatcher for resends.
- **Why it’s bad**: Complete violation of Separation of Concerns. It acts as a controller, a repository, and a use-case simultaneously.
- **Required Fix**:
  - **Create**: `src/modules/patients/repositories/auth/auth.queries.ts` (for the user existence check).
  - **Create**: `src/modules/patients/repositories/auth/auth.commands.ts` (for the OTP verification call).
  - **Create**: `src/modules/patients/use-cases/auth/verify-otp.use-case.ts` and `resend-otp.use-case.ts`.
  - **Refactor**: The Server Action should only wire the DTO, the DB client, and the Use Cases together.

### 3. Forgot Password Request (`request-password-reset.action.ts`)
- **Violation**: While this action *does* use a repository command (`requestPasswordResetCommand`), it skips the Use Case layer completely. It also orchestrates the non-blocking `after()` dispatch trigger directly in the controller.
- **Why it’s bad**: Business orchestration (like deciding to fire an event after a command) belongs in the Use Case, not the HTTP controller.
- **Required Fix**:
  - **Create**: `src/modules/patients/use-cases/auth/request-password-reset.use-case.ts`. Move the orchestration logic and the `after()` trigger setup there.

### 4. Reset Password Execution (`reset-password.action.ts`)
- **Violation**: Directly interacts with `supabase.auth.getUser()` and `supabase.auth.updateUser()` inside the Action.
- **Why it’s bad**: Missing Data-Layer Isolation.
- **Required Fix**:
  - **Create**: `src/modules/patients/repositories/auth/reset-password.commands.ts`.
  - **Create**: `src/modules/patients/use-cases/auth/reset-password.use-case.ts`.

### 5. Event Subscriber & Email Sender Documentation Mismatch
- **Violation**: The documentation in `email-sender/backend.md` describes a monolithic `email_outbox` table. However, the system was actually implemented using a generic domain Event Bus (`outbox` table) where generic events like `PASSWORD_RESET_REQUESTED` are emitted and picked up by specialized subscribers.
- **Why it’s bad**: Documentation is out of sync with the highly scalable Event Bus architecture we actually built.
- **Required Fix**: Rewrite the `email-sender` documentation to accurately reflect the Domain Event & Subscriber pattern we are using, instead of a rigid `email_outbox` table. 

### 6. Folder Naming Convention
- **Violation**: We have a populated `patient-forgotpassword` folder and an empty `patient-forgot-password` folder in the documentation directory.
- **Why it’s bad**: `1-ARCHITECTURE.md` strictly enforces kebab-case. 
- **Required Fix**: Delete the empty directory and rename `patient-forgotpassword` to `patient-forgot-password`.

---

## 🛠️ Action Plan for Remediation

Before writing any new features, we must halt and refactor these files to strictly align with `1.5-CODING-PATTERNS.md`. 

- [x] **Phase 1: Generate Repositories**
  - [x] Create `login.commands.ts` (wraps `signInWithPassword`)
  - [x] Create `auth.queries.ts` (wraps user existence check)
  - [x] Create `auth.commands.ts` (wraps OTP verification and resend)
  - [x] Create `reset-password.commands.ts` (wraps session check and `updateUser`)

- [x] **Phase 2: Generate Functional Use Cases**
  - [x] Create `login.use-case.ts`
  - [x] Create `verify-otp.use-case.ts` (orchestrates existence check + OTP verification + session validation)
  - [x] Create `resend-otp.use-case.ts` (orchestrates standard resend vs recovery resend)
  - [x] Create `request-password-reset.use-case.ts` (orchestrates command + outbox trigger)
  - [x] Create `reset-password.use-case.ts` (orchestrates session check + update)

- [x] **Phase 3: Refactor Server Actions**
  - [x] Refactor `login.action.ts` (stripped to Parse -> DI Setup -> Execute)
  - [x] Refactor `verify-otp.action.ts`
  - [x] Refactor `request-password-reset.action.ts`
  - [x] Refactor `reset-password.action.ts`

- [x] **Phase 4: Update Unit Tests**
  - [x] Fix `login.action.spec.ts`
  - [x] Fix `verify-otp.action.spec.ts`
  - [x] Fix `request-password-reset.action.spec.ts`
  - [x] Fix `reset-password.action.spec.ts`
  - [x] Write use-case and repository tests

- [x] **Phase 5: Documentation & Folder Fixes**
  - [x] Delete empty `patient-forgot-password` directory
  - [x] Rename `patient-forgotpassword` to `patient-forgot-password`
  - [x] Sync `email-sender/backend.md`

*This checklist will be executed to enforce absolute architectural compliance.*
