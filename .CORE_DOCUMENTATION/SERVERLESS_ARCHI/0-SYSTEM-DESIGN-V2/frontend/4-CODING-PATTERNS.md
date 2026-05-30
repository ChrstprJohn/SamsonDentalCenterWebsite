# Frontend Coding & State Management Patterns

> **System Note:** Governed by `agent-skills/frontend-ui-engineering` and `agent-skills/api-and-interface-design`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document defines the strict frontend coding conventions, state management topologies, and form architectures for the Samson Dental project. Adherence to these styles prevents messy inconsistencies, state synchronization bugs, and layout regression.

---

## 1️⃣ Casing & Naming Standards

To maintain clean directories and prevent visual confusion, we enforce strict naming rules across our React/TypeScript assets:

| Asset Type | Filename Convention | Export Casing | Example |
| :--- | :--- | :--- | :--- |
| **Presentational Components** | `kebab-case.tsx` | Named PascalCase | `appointment-card.tsx` $\rightarrow$ `export function AppointmentCard()` |
| **Custom Hooks** | `use-kebab-case.ts` | Named camelCase | `use-appointment-card.ts` $\rightarrow$ `export function useAppointmentCard()` |
| **Contexts / Providers** | `kebab-case.tsx` | Named PascalCase | `theme-context.tsx` $\rightarrow$ `export function ThemeProvider()` |
| **Helper Utils** | `kebab-case.ts` | Named camelCase | `date-formatter.ts` $\rightarrow$ `export const formatDate = () =>` |
| **TypeScript Interfaces** | Co-located or `types.ts` | PascalCase | `interface AppointmentCardProps` |

*Note: Avoid default exports. Always use named exports to ensure auto-imports work perfectly and maintain refactoring capability.*

---

## 2️⃣ State Management Topology

We group frontend state into three highly defined layers to keep rendering cycles predictable and avoid component re-render loops:

### A. Local Component State (Component-Level Scope)
* **Rule**: Complex interactive state (form fields, multi-step wizards, mutation loading/error states) must be governed by the component's companion hook. Trivial, presentation-only state (e.g., `isOpen` for an accordion, active tab index) may be managed inline via `useState` to prevent boilerplate fatigue.
* **Implementation**: Use standard React `useState` for simple toggles. Use `useReducer` inside a companion hook when managing multiple interdependent fields or complex state machines.
* **Scope**: UI interactions, open/closed modal states, active tabs, form text inputs.

### B. Shared Context (Tree-Level Scope)
* **Rule**: Strictly reserved for read-heavy, low-frequency global settings. Do not place high-frequency input states into React Context, as it triggers a full re-render on all children.
* **Examples**: Active User Authentication Session, Dark/Light UI Theme, global localization preferences.

### C. Server Cache Layer (Network Scope)
* **Rule**: Avoid keeping duplicate database caches inside manual global states (like Redux or Zustand). Use Server Components (`RSC`) to fetch fresh records directly at the layout/route level, and leverage Next.js native client-side routing caches or revalidation tags (`revalidatePath`) to refresh the view.
* **Mutations**: All write operations (create, update, delete) must go through **Next.js Server Actions**, not direct client-side Supabase calls. The client hook invokes the server action; the server action handles DB writes securely and calls `revalidatePath` to refresh stale data.

---

## 3️⃣ Safe Form Architecture (Zod & React Hook Form)

To prevent bad inputs from reaching the API or triggering server-side database crashes, forms must use Zod schemas and react-hook-form at the hook boundary.

### Casing Conventions for Form Variables:
* **Zod Schema Variable**: `camelCase` ending in `Schema` (e.g. `appointmentBookingSchema`).
* **Inferred TypeScript Type**: `PascalCase` ending in `FormValues` (e.g. `AppointmentBookingFormValues`).

### Form Reference Pattern:

```typescript
// src/modules/appointments/hooks/use-booking-form-schema.ts
import { z } from "zod";

export const bookingFormSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please choose a valid scheduling date",
  }),
  notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
```

Integrating this schema into your custom hook separates validation math completely from the layout:

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
  defaultValues?: Partial<BookingFormValues>; // Enables test injection
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

---

## 4️⃣ Golden UI Casing Guidelines

Keep application code variables strictly camelCase. Avoid database snake_case columns leaking directly into presentational components. Use your data-mapping models or boundary adapters inside the services/hooks layer to clean the response before passing it to the dumb UI component.

```typescript
// Good UI prop casing:
const appointmentDetails = {
  appointmentId: "123",
  patientFirstName: "John",
  scheduledTime: "10:00 AM",
}; // PASSED TO DUMB COMPONENT

// Bad UI prop casing (database leak):
const rawDbDetails = {
  appointment_id: "123",
  patient_first_name: "John",
  scheduled_time: "10:00 AM",
}; // FORBIDDEN IN PRESENTATION COMPONENTS
```

---

## 5️⃣ Data Mapping & Anti-Leak Adapters

Database schemas (such as PostgreSQL snake_case columns) must never leak directly into dumb presentational UI parameters. 
* All API fetch operations and Supabase clients must use adapter utilities or clean object mapping signatures inside the service/hook layer to format raw data payloads into standard camelCase properties before passing them down to components.

---

## 6️⃣ Shared UI Primitive Ref Forwarding

When a custom hook exposes `register` from `react-hook-form`, it returns an object containing `onChange`, `onBlur`, `name`, and **`ref`**. If a dumb component spreads this onto a shared kernel component (e.g., `<Input {...register('date')} />`), the underlying DOM node will **fail to bind the ref** unless the primitive is explicitly wrapped in `React.forwardRef`.

**Rule**: Every shared input primitive inside `src/components/ui/` that wraps a native `<input>`, `<textarea>`, or `<select>` must use `React.forwardRef`.

```tsx
// src/components/ui/input.tsx
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <input
          ref={ref}
          className={`rounded-lg border bg-slate-800/80 px-3 py-2 text-slate-200 focus:outline-none disabled:opacity-50 transition-all duration-200 ${
            error
              ? "border-red-500/50 focus:border-red-400"
              : "border-slate-700 focus:border-blue-500"
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
```
