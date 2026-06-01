# Patient Sign-Up Feature: Backend Architecture

This document describes the backend systems, data layers, use cases, database schema details, and testing strategies that govern the Patient Sign-Up flow.

---

## 📂 Backend File Structure & Colocation

The backend logic resides under the `src/modules/patients` directory, keeping business layer rules completely decoupled from UI rendering:

```text
src/modules/patients/
├── actions/profile/
│   ├── register-patient.action.ts      # ⚡ Next.js Server Action controller
│   └── register-patient.action.spec.ts  # 🧪 Controller unit tests
├── dtos/profile/
│   ├── register-patient.dto.ts         # 📝 Backend validation schemas
│   └── register-patient.dto.spec.ts    # 🧪 Backend Zod rule tests
├── use-cases/profile/
│   ├── register-patient.use-case.ts    # ⚙️ Core business logic pipeline
│   └── register-patient.use-case.spec.ts # 🧪 Business logic unit tests
├── repositories/profile/
│   ├── patient-profile.commands.ts     # 💾 Database commands (Supabase writes)
│   └── patient-profile.commands.spec.ts # 🧪 Repository command unit tests
└── index.ts                             # 🚪 Public Module barrel facade
```

---

## 💾 Database Schema & Trigger Engine

The sign-up flow depends on two secure systems inside Supabase/PostgreSQL:

### 1. The `users` Profile Table
When a patient signs up, their record is stored in the database `users` table:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    suffix TEXT,
    phone_number TEXT,
    date_of_birth DATE, 
    role user_role DEFAULT 'PATIENT'::user_role NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 2. Automatic Profile Trigger Sync
Rather than manually coordinating two round-trips to the DB, our architecture leverages a raw PostgreSQL database trigger:
1. When `supabase.auth.signUp()` is executed with metadata, a new row is created in `auth.users`.
2. A PostgreSQL trigger function parses the metadata and atomically inserts a matching row into our public `users` profile table, ensuring data consistency and ACID validation.

---

## ⚙️ Core Use Case & Repository Command

We enforce strict **Functional DI (Dependency Injection)**:

### 1. Command Repository (`patient-profile.commands.ts`)
Encapsulates direct connection calls using Supabase SDK methods. It signs up users in auth and returns their active database profile:

```typescript
export const createPatientCommand = (supabase: SupabaseClient) => {
  return async (data: RegisterPatientDto): Promise<PatientProfileDto> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
          role: 'PATIENT'
        }
      }
    });
    // Triggers SQL creation; return validated DTO
    ...
  };
};
```

### 2. Use Case Pipeline (`register-patient.use-case.ts`)
Implements pure business rules completely detached from Express, Next.js, or API request details:

```typescript
export const registerPatientUseCase = (
  createPatient: (data: RegisterPatientDto) => Promise<PatientProfileDto>
) => {
  return async (data: RegisterPatientDto): Promise<PatientProfileDto> => {
    // Core business validation rules happen here prior to execution
    return createPatient(data);
  };
};
```

---

## 🧪 Backend Unit Testing Strategies

Our backend is tested using modular mock closures to guarantee reliability:

1. **Use Case Isolation (`register-patient.use-case.spec.ts`)**:
   * Stubs the repository query closures.
   * Verifies that the use case handles inputs, validates them, and propagates outputs or throws correct `DomainError` shapes under failure scenarios.
2. **Repository Isolation (`patient-profile.commands.spec.ts`)**:
   * Mocks the global Supabase client.
   * Asserts that database arguments are formatted correctly and translates Supabase server failures to standard domain errors.
