# Patient Sign-Up Feature: Frontend Architecture

This document outlines the frontend engineering, components, validation logic, custom hooks, and testing guidelines for the Patient Sign-Up flow in strict accordance with the **Frontend System Design Guidelines (V3.0)**.

---

## 📂 Frontend File Structure & Colocation

All frontend code belongs strictly inside `src/modules/patients` to preserve clean modular boundaries:

```text
src/modules/patients/
├── components/auth/
│   └── signup-form.tsx             # 🎨 Dumb presentational form component
├── views/
│   └── signup-view.tsx             # 🖥️ View orchestrator page shell ('use client')
├── hooks/auth/sign-up/
│   ├── use-sign-up-form.hook.ts     # 🎣 RHF Form hook binding Zod schema
│   ├── use-sign-up-form.hook.spec.ts # 🧪 Form hook unit tests
│   ├── use-sign-up-view.hook.ts     # 🎣 View controller hook (server actions)
│   └── use-sign-up-view.hook.spec.ts # 🧪 View controller unit tests
└── dtos/auth/
    ├── sign-up.dto.ts              # 📝 Zod validation DTO
    └── sign-up.dto.spec.ts         # 🧪 DTO validation rule tests
```

---

## 🎨 Presentational Form Design (`signup-form.tsx`)

Following our strict presentational guidelines, `signup-form.tsx` is a **100% dumb component**. 
* **Zero inline state**: It does not contain any state variables or direct API calls.
* **Property Bound**: It receives the React Hook Form instance, error states, and submission triggers strictly as serializable properties.
* **Component-Safe Inputs**: Input wrappers (`src/components/ui/input.tsx`) utilize `React.forwardRef` to allow standard `register` bindings from RHF.

---

## 📝 Frontend Schema & Form Logic Hook (`use-sign-up-form.hook.ts`)

Zod defines our contract for standard inputs on both client and server:

```typescript
// src/modules/patients/dtos/auth/sign-up.dto.ts
export const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Must be in E.164 phone format'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

The React Hook Form wrapper (`use-sign-up-form.hook.ts`) instantiates the validation engine cleanly, populating required defaults such as `acceptTerms: false`:

```typescript
export function useSignUpForm() {
  return useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });
}
```

---

## 🎣 View Orchestration Hook (`use-sign-up-view.hook.ts`)

The orchestrator manages user interaction lifecycles:
1. **Action Triggering**: Delegates validated data to `registerPatientAction`.
2. **Action Response Handling**: Integrates the *Server-Action-to-RHF Error Bridge*. If the server rejects the registration (e.g. duplicate email), it maps those exceptions back to specific UI input field indicators.
3. **Success Lifecycle**: Alerts the patient with a premium toast notification and smoothly routes them to the OTP verification page.

---

## 🧪 Frontend Unit Testing Strategies

Every custom hook is verified under Vitest using co-located `.spec.ts` files.

1. **Form Defaults Verification (`use-sign-up-form.hook.spec.ts`)**:
   * Asserts that `useSignUpForm` accurately sets up the form structure, default values, and Zod resolver on load.
2. **View Controller Logic Verification (`use-sign-up-view.hook.spec.ts`)**:
   * Mocks Next.js routers, toast containers, and API handlers.
   * Asserts that invalid responses show appropriate toasts and field-level highlights.
   * Asserts that success outputs route properly to `/auth/verify-otp`.
