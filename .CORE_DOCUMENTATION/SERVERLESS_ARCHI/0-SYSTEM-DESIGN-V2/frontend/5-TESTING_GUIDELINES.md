# Frontend Testing Guidelines

> **System Note:** Governed by `agent-skills/test-driven-development` and `agent-skills/browser-testing-with-devtools`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document outlines the testing strategy and execution parameters for the Samson Dental frontend. By dividing our code strictly into Presentational Components and companion Custom Hooks, we make automated testing highly performant, deterministic, and extremely simple to write.

---

## 1️⃣ Three-Tiered Frontend Testing Strategy

To ensure zero visual regressions and perfect state accuracy, developers must adhere to the three testing tiers:

### A. Unit Testing Custom Hooks & Server Actions (Highest Focus)
* **Goal**: Test state management, async mutation handlers, form validation, and hook logic in isolation.
* **Tooling**: `@testing-library/react` (utilizing native `renderHook` and `act`) / Vitest.
* **Placement**: Co-located right next to the hook file (`use-booking-form.spec.ts` next to `use-booking-form.ts`).
* **Server Actions**: Test server action files (e.g., `create-booking.action.ts`) as standalone async functions. Mock the database client and assert the correct return shape.

### B. Visual & Integration Testing of Presentation Components
* **Goal**: Verify that presentational components render correctly across various states. Because dumb components are deterministic (same props → same output), exhaustive Vitest unit tests are **low-ROI boilerplate**.
* **Preferred Tooling**: Storybook for interactive visual review, Playwright for visual regression snapshots.
* **When Vitest is Justified**: Only when the component contains conditional rendering logic that is genuinely complex (e.g., multi-branch status badges, permission-gated UI sections). Simple prop-to-JSX mapping does NOT need a `.spec.tsx` file.
* **Placement**: Co-located if written (`booking-card.spec.tsx` next to `booking-card.tsx`).

### C. End-to-End (E2E) Flow Testing
* **Goal**: Verify critical user workflows (e.g. logging in, scheduling a teeth cleaning, making a payment) across real browser environments.
* **Tooling**: Playwright.
* **Placement**: Inside a root-level global `tests/e2e/` folder.

---

## 2️⃣ Co-Located Test Placement Pattern

Every component and hook must be accompanied by its sibling test file from day one. Do not defer writing tests for a future iteration.

```text
src/modules/appointments/
├── actions/
│   ├── create-booking.action.ts
│   └── create-booking.action.spec.ts  ← Server Action unit test
├── components/
│   └── booking-card.tsx               ← No .spec.tsx required (dumb component)
├── hooks/
│   ├── use-booking-form.ts
│   └── use-booking-form.spec.ts       ← Hook unit test (mandatory)
```

---

## 3️⃣ Blueprint: Testing a React Hook Form Hook in Isolation

When custom hooks wrap `react-hook-form`, testing them requires verifying two distinct paths:
1. **Validation Rejection**: Ensuring the Zod schema blocks invalid inputs and populates the `errors` object.
2. **Validation Cleared / Success**: Ensuring valid data flows seamlessly into the Server Action.

By allowing optional `defaultValues` injection, the hook becomes infinitely easier to test and hydrate across different entry points.

```typescript
// src/modules/appointments/hooks/use-booking-form.spec.ts
import { renderHook, act } from "@testing-library/react"; // Native React 18+ imports
import { useBookingForm } from "./use-booking-form";
import { createBookingAction } from "../actions/create-booking.action";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Server Action, NOT a database client
vi.mock("../actions/create-booking.action", () => ({
  createBookingAction: vi.fn(),
}));

describe("useBookingForm Custom Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default form state", () => {
    const { result } = renderHook(() =>
      useBookingForm({ serviceId: "service-123" })
    );

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isBooked).toBe(false);
    expect(result.current.serverError).toBeNull();
    expect(result.current.errors).toEqual({});
  });

  it("should reject submission when Zod validation fails (empty date)", async () => {
    const { result } = renderHook(() =>
      useBookingForm({ serviceId: "service-123" })
    );

    // Attempt submission without setting a date
    await act(async () => {
      await result.current.onSubmit();
    });

    // Zod rejects: Server Action should NEVER be called
    expect(createBookingAction).not.toHaveBeenCalled();
    expect(result.current.errors.date).toBeDefined();
  });

  it("should successfully submit when validation passes", async () => {
    (createBookingAction as any).mockResolvedValueOnce({ success: true, message: "Booking confirmed" });

    const { result } = renderHook(() =>
      useBookingForm({
        serviceId: "service-123",
        defaultValues: { date: "2026-06-01" }, // Inject valid data for testing
      })
    );

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(createBookingAction).toHaveBeenCalledWith("service-123", "2026-06-01");
    expect(result.current.isBooked).toBe(true);
    expect(result.current.serverError).toBeNull();
  });

  it("should handle Server Action errors without hiding the form", async () => {
    (createBookingAction as any).mockResolvedValueOnce({ success: false, message: "Slot unavailable" });

    const { result } = renderHook(() =>
      useBookingForm({
        serviceId: "service-123",
        defaultValues: { date: "2026-06-01" },
      })
    );

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.isBooked).toBe(false);
    expect(result.current.serverError).toBe("Slot unavailable");
  });
});
```

---

## 4️⃣ Core Testing Rules

1. **Keep Mocks Explicit**: Mock only external boundaries (Supabase, API endpoints, payment gates). Never mock the internal logic of the hook or component under test.
2. **Deterministic Timeouts**: If testing a component or hook with debouncing or timers, use virtual time controls (`vi.useFakeTimers()`) to prevent slow or flaky test suites.
3. **No Visual Testing in Unit Tests**: Do not test CSS colors, grid layouts, or fonts in Vitest. Unit tests check logical assertions (e.g. is the button disabled when loading?). Visual fidelity must be verified in the browser or via visual regression tests in Playwright.
