# Patient Log-In Feature: Backend Architecture

This document describes the backend systems, data layers, server actions, database interaction schemas, and testing strategies that govern the Patient Log-In flow.

---

## 📂 Backend File Structure & Colocation

The backend logic resides under the `src/modules/patients` directory, keeping business layer rules completely decoupled from UI rendering:

```text
src/modules/patients/
├── actions/auth/
│   ├── login.action.ts           # ⚡ Next.js Server Action controller
│   └── login.action.spec.ts      # 🧪 Controller unit tests (Vitest)
└── dtos/auth/
    ├── login.dto.ts              # 📝 Zod validation schemas
    └── login.dto.spec.ts         # 🧪 Zod validation schema unit tests
```

---

## ⚡ Secure Next.js Server Action (`login.action.ts`)

Our login implementation uses **Next.js Server Actions** (`'use server'`) to securely run server-side logic in a trusted environment, preventing API key exposure and direct database connection leaks.

### Server Action Flow
1. **Schema Validation**: The action parses inputs using `loginSchema.parse(formData)`. If validation fails, Zod errors are caught and flattened into a standardized UI-digestible shape.
2. **Password Presence Check**: The controller explicitly checks for the password parameter. If missing, it returns a precise field-level validation error without wasting round-trips to the database.
3. **Database Initialization**: It instantiates the secure database layer using `createClient()` from `@/shared/database/server`.
4. **Supabase Authentication**:
   * It calls the native Supabase auth client:
     ```typescript
     const { data, error } = await supabase.auth.signInWithPassword({
       email: validData.email,
       password: validData.password,
     });
     ```
   * The Supabase server verifies the hash, handles cookies, and returns session tokens.
5. **Standardized Response**: The action returns an `ActionResponse<any>` object to cleanly communicate success/failure across the server-client bridge.

```typescript
// Example snippet from login.action.ts
export async function loginAction(formData: LoginInput): Promise<ActionResponse<any>> {
  try {
    const validData = loginSchema.parse(formData);
    const supabase = await createClient();

    if (!validData.password) {
      return {
        success: false,
        error: 'Password is required',
        fieldErrors: { password: ['Password is required'] }
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validData.email,
      password: validData.password,
    });

    if (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: { password: ['Invalid email or password'] } 
      };
    }
    return { success: true, data };
  } catch (error) {
    ...
  }
}
```

---

## 🧪 Backend Unit Testing Strategies

Our backend processes are fully covered using Vitest specs, verifying schema rules and mock service executions:

1. **DTO Validation Testing (`login.dto.spec.ts`)**:
   * Validates correct inputs (e.g., checking that realistic email patterns parse successfully).
   * Verifies that incorrect email shapes, missing passwords, or unaccepted terms properly trigger Zod validation failures.
2. **Server Action Mocking (`login.action.spec.ts`)**:
   * Stubs the server-side Supabase client and its underlying `auth.signInWithPassword` routine.
   * Asserts that successful inputs yield a `success: true` flag and propagate user credentials.
   * Asserts that incorrect inputs or database-side authorization errors gracefully output a `success: false` flag accompanied by target `fieldErrors` mappings.
