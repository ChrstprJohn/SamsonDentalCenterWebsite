# Patient Log-In Feature: Frontend Architecture

This document outlines the frontend engineering, components, validation logic, custom hooks, and testing guidelines for the Patient Log-In flow in strict accordance with the **Frontend System Design Guidelines (V3.0)**.

---

## 📂 Frontend File Structure & Colocation

All frontend code belongs strictly inside `src/modules/patients` to preserve clean modular boundaries:

```text
src/modules/patients/
├── components/auth/
│   └── login-form.tsx             # 🎨 Dumb presentational form component
├── views/
│   └── login-view.tsx             # 🖥️ View orchestrator page shell ('use client')
├── hooks/auth/login/
│   ├── use-login-form.hook.ts     # 🎣 RHF Form hook binding Zod schema
│   ├── use-login-form.hook.spec.ts # 🧪 Form hook unit tests (Vitest)
│   ├── use-login-view.hook.ts     # 🎣 View controller hook (server actions)
│   └── use-login-view.hook.spec.ts # 🧪 View controller unit tests (Vitest)
└── dtos/auth/
    ├── login.dto.ts               # 📝 Zod validation DTO
    └── login.dto.spec.ts          # 🧪 DTO validation rule tests
```

---

## 🎨 Presentational Form Design (`login-form.tsx`)

Following our strict presentational guidelines, `login-form.tsx` is a **100% dumb component**.
* **Zero inline state**: It does not contain any local state variables or direct API calls.
* **Property Bound**: It receives the React Hook Form instance, error states, and submission triggers strictly as serializable properties.
* **Component-Safe Inputs**: Input wrappers (`src/components/ui/input.tsx`) utilize `React.forwardRef` to allow standard `register` bindings from RHF.

---

## 📝 Frontend Schema & Form Logic Hook (`use-login-form.hook.ts`)

Zod defines our contract for standard inputs on both client and server:

```typescript
// src/modules/patients/dtos/auth/login.dto.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

The React Hook Form wrapper (`use-login-form.hook.ts`) instantiates the validation engine cleanly, populating required defaults such as `email: ''` and `password: ''`:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../../../dtos/auth/login.dto';

export function useLoginForm() {
  return useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
}
```

---

## 🎣 View Orchestration Hook (`use-login-view.hook.ts`)

The orchestrator manages user interaction lifecycles:
1. **Action Triggering**: Delegates validated data to the server-side action `loginAction`.
2. **Action Response Handling**: Integrates the *Server-Action-to-RHF Error Bridge* via `handleActionError`. If the server rejects credentials, it maps those exceptions back to specific UI input field indicators (e.g., highlighting the password field).
3. **Success Lifecycle**: Alerts the patient with a premium toast notification (`addToast`) and routes them smoothly to the `/user` dashboard portal.

---

## 🧪 Frontend Unit Testing Strategies

Every custom hook is verified under Vitest using co-located `.spec.ts` files:

1. **Form Defaults Verification (`use-login-form.hook.spec.ts`)**:
   * Asserts that `useLoginForm` accurately sets up the form structure, default values, and Zod resolver on load.
2. **View Controller Logic Verification (`use-login-view.hook.spec.ts`)**:
   * Mocks Next.js routers, toast containers, and server action handlers.
   * Asserts that invalid responses show appropriate toasts and field-level highlights.
   * Asserts that success outputs route properly to `/user`.
