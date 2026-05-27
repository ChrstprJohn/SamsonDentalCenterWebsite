# Next.js & TypeScript Engineering Conventions

> **System Note:** Governed by `agent-skills/frontend-ui-engineering` and `agent-skills/api-and-interface-design`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document establishes the official development standards and production‑ready coding patterns for the Samson Dental project built with Next.js (App Router) and TypeScript.

---

## 1️⃣ TypeScript Configuration & Typings

1. **Strict Mode is Non-Negotiable**
   * `strict: true` in `tsconfig.json`.
   * No `any` types allowed. Use `unknown` if the type is truly dynamic, and validate it before using it.

2. **Validation & DTOs**
   * All incoming data (Server Actions, Route Handlers) must be validated using Zod.
   * Expose safe output DTOs to the client.

---

## 2️⃣ Next.js Server Actions & Route Handlers

1. **Thin Actions**
   * Server Actions must be thin. They are only responsible for extracting data, validating it, calling a domain service, and handling Next.js specifics like `revalidatePath`.
   * Example:
     ```typescript
     'use server';
     export async function bookAppointmentAction(formData: FormData) {
       const data = validateSchema(bookingSchema, formData);
       const result = await appointmentsModule.book(data);
       revalidatePath('/user/dashboard');
       return result;
     }
     ```

2. **Server Components vs Client Components**
   * Default to Server Components (`RSC`) for maximum performance and SEO.
   * Only use `'use client'` when state (`useState`), effects (`useEffect`), or browser APIs are needed.

---

## 3️⃣ Authentication & Security

1. **Supabase SSR**
   * Use `@supabase/ssr` to handle cookies and authentication on the server.
   * Protect routes natively in `middleware.ts` to prevent unauthorized access to the portals before rendering even begins.

2. **Action Security**
   * Never trust the client. Verify the user's session and permissions *inside* every Server Action before executing the business logic.

---

*Document version: 2.0 (Next.js Edition) – last updated 2026‑05‑25*