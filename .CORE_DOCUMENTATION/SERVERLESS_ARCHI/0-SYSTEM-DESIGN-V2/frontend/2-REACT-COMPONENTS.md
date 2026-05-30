# React Components Guide: The Principle of Dumb Components

> **System Note:** Governed by `agent-skills/code-review-and-quality` and `agent-skills/code-simplification`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document establishes our strict standards for building React components. To make our frontend highly scalable, extremely testable, and robust against UI refactoring, we enforce the **Dumb Component Pattern**. All components must be presentational shells, stripping out all inline state, business logic, calculations, and network interactions.

---

## 1. What is a "Dumb Component"?

A **Dumb Component** (also called a presentational component) is a component that focuses exclusively on **how things look**. In the Next.js App Router context, this refers strictly to **Client Components**.

### The Golden Rules of Dumb Client Components:
1. **No Direct State Mutations (With One Exception)**: They do not calculate or transition business state themselves. All complex interactive actions trigger callback functions passed down from props. 
   * *Exception (The Trivial State Exemption)*: You may use `useState` inline for purely visual layout toggles (e.g., `isOpen` for an accordion or dropdown) to avoid boilerplate fatigue.
2. **No Data Fetching / API Logic**: Client Components do not import database clients (like Supabase), fetch APIs, or trigger Axios calls. They receive pre-fetched data directly via props from their parent **Server Component (RSC)** orchestrator.
3. **No Business Rules**: They do not calculate complex pricing, format custom business rules, or determine role permissions. Those calculations must be performed on the server or in a hook.
4. **Driven by TypeScript Props**: Their entire behavior is strictly typed via a clear `Props` interface. Given the same props, a dumb component always renders the exact same visual interface (deterministic rendering).

---

## 2. Refactoring Blueprint: Before vs. After

Let's look at a real-world example of refactoring a complex "God Component" into a Dumb Component.

### ❌ THE WRONG WAY: The "God Component"
This component is unmaintainable. It manages local states, fetches pricing asynchronously, performs math, calls the database, and handles styling all in one file.

```tsx
// src/modules/appointments/components/booking-card.tsx
// FORBIDDEN PATTERN: Heavy logic mixed with UI rendering
import { useState, useEffect } from "react";
import { supabase } from "@/shared/database/client";

export function BookingCard({ serviceId }: { serviceId: string }) {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState("");
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    // Direct network fetching inside a component - FORBIDDEN
    async function fetchPrice() {
      const { data } = await supabase.from("services").select("base_price").eq("id", serviceId).single();
      if (data) {
        // Business calculation inside component - FORBIDDEN
        const taxRate = 0.12;
        setPrice(data.base_price * (1 + taxRate));
      }
    }
    fetchPrice();
  }, [serviceId]);

  const handleBook = async () => {
    setLoading(true);
    // Direct side-effect / state mutation in component - FORBIDDEN
    const { error } = await supabase.from("appointments").insert({ service_id: serviceId, booking_date: date });
    setLoading(false);
    if (!error) {
      setBooked(true);
      alert("Successfully booked!");
    }
  };

  return (
    <div className="card">
      <h3>Book Appointment</h3>
      <p>Total Cost: ${price.toFixed(2)} (Tax Included)</p>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={handleBook} disabled={loading || !date}>
        {loading ? "Booking..." : booked ? "Booked!" : "Confirm Appointment"}
      </button>
    </div>
  );
}
```

---

### ✅ THE CORRECT WAY: Server Component Hydration + Dumb Presentational Component

We completely eliminate the `useEffect` network loop and layout flashes by fetching raw data at the **Next.js Server Component (RSC) boundary** (on the server), and passing the formatted data down as safe, immutable props.

#### 1. The Server Component (RSC) Boundary
This component runs strictly on the server, fetching database records securely without leaking credentials or database queries to the client.

```tsx
// src/app/appointments/booking/page.tsx
import { createClient } from "@/shared/database/server";
import { BookingView } from "@/modules/appointments/views/booking-view";
import { mapServiceRecord } from "@/modules/services/dtos/management/service-response.dto";

export default async function BookingPage({ searchParams }: { searchParams: { serviceId: string } }) {
  const supabase = await createClient();
  
  // 1. Fetch data securely at the server boundary
  const { data: rawService } = await supabase
    .from("services")
    .select("id, name, base_price")
    .eq("id", searchParams.serviceId)
    .single();

  if (!rawService) {
    return <div>Service not found</div>;
  }

  // 2. Map database schema to standardized types
  const service = mapServiceRecord(rawService);

  // 3. Format and pass as safe, deterministic props
  const taxRate = 0.12;
  const totalPrice = service.basePrice * (1 + taxRate);
  const formattedPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalPrice);

  return (
    <main className="p-8">
      <BookingView 
        serviceId={service.id} 
        serviceName={service.name} 
        formattedPrice={formattedPrice} 
      />
    </main>
  );
}
```

#### 2. The Presentation Component (100% Dumb, Error-Resilient)
This file resides in the client bundle but remains **100% presentational**. It has no business calculations or async database references. Errors are rendered **inline alongside the form**, never replacing it — this prevents the "Disappearing Form" UX bug.

```tsx
// src/modules/appointments/components/booking-card.tsx
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { BookingFormValues } from "../hooks/use-booking-form-schema";
import { Input } from "@/components/ui/input";

interface BookingCardProps {
  serviceName: string;
  formattedPrice: string;
  register: UseFormRegister<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
  serverError: string | null;
  isSubmitting: boolean;
  isBooked: boolean;
  onSubmit: () => void;
}

export function BookingCard({
  serviceName,
  formattedPrice,
  register,
  errors,
  serverError,
  isSubmitting,
  isBooked,
  onSubmit,
}: BookingCardProps) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/30"
    >
      <h3 className="text-xl font-semibold text-slate-100 mb-2">Book {serviceName}</h3>
      <div className="mb-4">
        <span className="text-xs text-slate-400">Total Price (incl. tax)</span>
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          {formattedPrice}
        </p>
      </div>

      {/* Server error rendered ALONGSIDE the form, never replacing it */}
      {serverError && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {serverError}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-300">Select Date</label>
        {/* Shared Input primitive with forwardRef accepts register spread */}
        <Input
          type="date"
          disabled={isSubmitting || isBooked}
          error={errors.date?.message}
          {...register("date")}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isBooked}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        {isSubmitting ? "Processing..." : isBooked ? "✓ Booked!" : "Confirm Appointment"}
      </button>
    </form>
  );
}
```

*(Note: The companion hook `use-booking-form.ts` uses Zod + React Hook Form for client-side validation and delegates mutations to a secure **Server Action** (`create-booking.action.ts`). The full pattern is documented in [3-REACT-HOOKS.md](3-REACT-HOOKS.md). The `<Input />` primitive uses `React.forwardRef` to support ref binding — see [4-CODING-PATTERNS.md](4-CODING-PATTERNS.md))*


---

## 3. Practical Benefits of the Dumb Component Pattern

* **Designer / UI Developer Isolation**: Developers focused on styling can tweak classes, fonts, grids, and animations in the presentation file without worrying about breaking database triggers or authorization logic.
* **Trivial Storybook / UI Playground Setup**: Since the UI takes only props, testing various states (loading, error, success, empty data) does not require complex mock stores or mock servers. You just pass in different hardcoded props.
* **Component Reusability**: Because the component is disconnected from any specific domain orchestrator, it can easily be repurposed across different layouts or portals (e.g., patient view vs. admin dashboard scheduler).
