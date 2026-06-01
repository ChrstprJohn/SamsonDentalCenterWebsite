# Patient Forgot Password Feature: Frontend Architecture

This document outlines the frontend engineering, components, validation logic, custom hooks, and testing guidelines for the Patient Forgot Password flow.

---

## 📂 Frontend File Structure & Colocation

All frontend code belongs strictly inside `src/modules/patients` and integrates closely with Next.js App Router for pagination between the three distinct steps (Request, Verify, Reset).

```text
src/modules/patients/
├── components/auth/
│   ├── forgot-password-form.tsx   # 🎨 Dumb request form
│   └── reset-password-form.tsx    # 🎨 Dumb new password form
├── views/
│   ├── forgot-password-view.tsx   # 🖥️ Request View orchestrator
│   └── reset-password-view.tsx    # 🖥️ Reset View orchestrator
├── hooks/auth/
│   ├── forgot-password/use-forgot-password-view.hook.ts # 🎣 RHF Form + View hook
│   └── reset-password/use-reset-password-view.hook.ts   # 🎣 RHF Form + View hook
└── dtos/auth/
    ├── forgot-password.dto.ts     # 📝 Zod schema (email only)
    └── reset-password.dto.ts      # 📝 Zod schema (password & confirmPassword)
```

---

## 📝 Frontend Schemas

The flow uses distinct Zod DTOs for the separate stages:

```typescript
// forgot-password.dto.ts
export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// reset-password.dto.ts
export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

---

## 🎣 View Orchestration Hooks

1. **`useForgotPasswordView`**: 
   - Uses `react-hook-form` and the `forgotPasswordSchema`.
   - Triggers `requestPasswordResetAction`.
   - On success, it navigates the user to `/auth/verify?email=...&type=recovery`.
   
2. **`useOTPVerifyView` (Shared)**: 
   - Dynamically reads the `type` search param. If `type === 'recovery'`, it redirects to `/auth/reset-password` upon successful OTP validation, bypassing the `/user` portal entry meant for standard logins/signups.

3. **`useResetPasswordView`**:
   - Manages the final `resetPasswordAction`.
   - Requires an active Supabase session (granted by `verifyOtpAction`).
   - On success, routes to `/auth/login` (or `/`).
