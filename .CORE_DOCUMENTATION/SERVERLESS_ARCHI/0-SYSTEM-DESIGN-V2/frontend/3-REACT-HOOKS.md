# React Custom Hooks Guide: The Principle of Hook Binding

> **System Note:** Governed by `agent-skills/api-and-interface-design` and `agent-skills/code-review-and-quality`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document establishes the rule of **Hook Binding**: every component that maintains complex business state, triggers side-effects, or binds to mutation operations must extract that logic into a companion custom React Hook. This guideline prevents UI code from becoming entangled with business logic.

*Exception (The Trivial State Exemption)*: To prevent "Boilerplate Tax", simple, localized UI layout state (e.g., an `isOpen` boolean for a modal, simple accordion toggles) is exempt and may be handled inline with `useState` directly in the component.

---

## 1. Why Extract Logic into Custom Hooks?

Mixing state logic with UI layout is the primary source of frontend technical debt. By forcing all logic into custom hooks, we achieve:

* **Pure State Isolation**: The React component remains a purely presentational shell (dumb rendering), while the hook becomes the state manager (controller).
* **Simplified UI Refactoring**: If we completely redesign the UI (e.g., switching from a card layout to a modal or a slide-out drawer), we can reuse the exact same companion hook without editing a single line of business logic.
* **Isolated Testing**: Hooks can be thoroughly unit tested in isolation using Vitest and `renderHook` from the unified `@testing-library/react` package. This is far faster and more robust than spinning up full DOM rendering engines.

---

## 2. Standard Pattern: Hook Binding

For every stateful component `[ComponentName].tsx`, there must be a companion hook `hooks/use-[ComponentName].ts`.

* The hook is responsible for managing local state mutations, form bindings, event handlers, and data transformations.
* **Data Hydration Rule**: Hooks must **NOT** fetch or hydrate initial domain data on mount using `useEffect` loops. All initial data must be fetched at the Next.js Server Component (RSC) boundary and passed down as deterministic props.

---

## 3. Reference Implementation: Companion Hook for `BookingCard`

**Key Principle**: The hook manages form validation (via Zod + React Hook Form) and UI state (loading, error, success), but delegates the actual database write to a **Next.js Server Action**. The hook never imports a database client directly.

#### The Server Action (Secure Backend Mutation)
```typescript
// src/modules/appointments/actions/create-booking.action.ts
'use server';

import { createClient } from "@/shared/database/server";
import { revalidatePath } from "next/cache";

export async function createBookingAction(serviceId: string, date: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("appointments")
    .insert({
      service_id: serviceId,
      booking_date: date,
      status: "pending",
    });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/appointments");
  return { success: true, message: "Booking confirmed" };
}
```

#### The Client Hook (Zod + React Hook Form + Server Action)
```typescript
// src/modules/appointments/hooks/use-booking-form.ts
'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingFormSchema, BookingFormValues } from "./use-booking-form-schema";
import { createBookingAction } from "../actions/create-booking.action";

interface UseBookingFormProps {
  serviceId: string;
  defaultValues?: Partial<BookingFormValues>;
}

export function useBookingForm({ serviceId, defaultValues }: UseBookingFormProps) {
  const [isBooked, setIsBooked] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: "",
      notes: "",
      ...defaultValues,
    },
  });

  // Zod validates client-side FIRST, then delegates to the secure Server Action
  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);

    try {
      const result = await createBookingAction(serviceId, data.date);

      if (!result.success) {
        setServerError(result.message);
        return;
      }

      setIsBooked(true);
    } catch (err: any) {
      setServerError(err.message || "Failed to finalize booking");
    }
  });

  return {
    register,
    onSubmit,
    errors,
    isSubmitting,
    isBooked,
    serverError,
  };
}
```

### How the Parent Component Glues Them Together:

The parent view acts as the orchestrator, binding the Server-hydrated data props and the Client-side mutation hook together. **Critical**: Errors are rendered *alongside* the form, never *replacing* it. This prevents the "Disappearing Form" UX bug where a backend error removes the user's ability to correct input and retry.

```tsx
// src/modules/appointments/views/booking-view.tsx
'use client'; // Explicit client boundary marker

import { useBookingForm } from "../hooks/use-booking-form";
import { BookingCard } from "../components/booking-card";

interface BookingViewProps {
  serviceId: string;
  serviceName: string;
  formattedPrice: string;
}

export function BookingView({ serviceId, serviceName, formattedPrice }: BookingViewProps) {
  // Bind Client-side form validation and mutation state controllers
  const formState = useBookingForm({ serviceId });

  // ✅ CORRECT: Error is passed AS A PROP, rendered alongside the card.
  // ❌ WRONG:  if (error) return <ErrorBox /> — this hides the form entirely.
  return (
    <BookingCard
      serviceName={serviceName}
      formattedPrice={formattedPrice}
      register={formState.register}
      errors={formState.errors}
      serverError={formState.serverError}
      isSubmitting={formState.isSubmitting}
      isBooked={formState.isBooked}
      onSubmit={formState.onSubmit}
    />
  );
}
```

---

## 4. Hook Hygiene & Coding Rules

To keep custom hooks highly maintainable as complex codebases scale:

1. **One Hook Per Component**: Do not share a single massive hook across 10 unrelated UI views. Map hooks one-to-one to keep them highly cohesive.
2. **Never Return JSX**: A hook must **never** export HTML elements or styling classes. It must strictly export data primitives, arrays, objects, and trigger functions.
3. **The Trivial State Exemption (Boilerplate Reduction)**: The "Mandatory Hook Binding" rule is **relaxed** for trivial, localized layout state. Any component (domain-specific or generic primitive) is allowed to maintain low-frequency layout state (`useState`) directly inline if the logic is exclusively for simple visual toggling (e.g., tracking whether a select menu is open, or an accordion is expanded). Never create a separate hook file just for a single boolean layout toggle.
