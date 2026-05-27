  # Next.js + TypeScript Testing Architecture Blueprint

  > **System Note:** Governed by `agent-skills/test-driven-development`. Follow the 80/15/5 test pyramid.
  > Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

  This document defines the testing strategy, standards, and code patterns for our Next.js App Router full-stack application using **Vitest** and **Playwright**. By segregating our backend/frontend into structured layers, we can cleanly test our modules without manual data-entry fatigue.

  ---

  ## 1. The Testing Pyramid (80 / 15 / 5)

  We divide our testing strategy into three distinct categories to balance speed with accuracy:

  | Strategy | Proportion | What It Tests | Is Database Connected? | Speed |
  | :--- | :--- | :--- | :--- | :--- |
  | **Unit Tests** | **80%** | Single business use-case or server action in complete isolation using Vitest. | **No** (Database/Supabase mocked via `vi.mock`). | Sub-millisecond |
  | **Integration Tests**| **15%** | Real interactions between Use-Cases, Repositories, and the actual Postgres/Supabase database. | **Yes** (Isolated Supabase environment). | Moderate |
  | **E2E Tests** | **5%** | Full visual flow in the browser using Playwright. | **Yes** (Real or seeded database). | Slow |

  ---

  ## 2. Test File Placement & Co-location Rules

  To maintain high visibility and ease of maintenance, we enforce strict guidelines on where test files must be located:

  * **Unit & Integration Tests (`*.spec.ts` / `*.test.ts`)**: Must be **co-located** directly next to the source code file they are testing.
    * *Example:* `src/modules/patients/use-cases/register-patient.use-case.ts` will have its test file right next to it: `src/modules/patients/use-cases/register-patient.use-case.spec.ts`.
    * *Why?* Co-location makes lack of coverage immediately obvious and simplifies import paths.
  * **E2E Tests (`*.spec.ts`)**: Must live in a global **`e2e/`** folder at the root of the project (outside `src/`).
    * *Example:* `e2e/portals/appointment-booking.spec.ts`.
    * *Why?* Playwright E2E tests interact with the application from the outside, crossing multiple domains, so they warrant a dedicated root-level folder.

  ---

  ## 2. Unit Testing Patterns (Testing Use Cases with Vitest)

  **Rule:** Unit tests must never touch a real database network connection. We use Vitest to fake the behavior of our **Repository** layer so we can focus exclusively on testing edge cases in our business rules.

  ### Code Implementation:
  ```typescript
  // src/modules/appointments/use-cases/book-appointment.spec.ts
  import { describe, it, expect, vi } from "vitest";
  import { BookAppointmentUseCase } from "./book-appointment.use-case";
  import { AppointmentsRepository } from "../repositories/appointments.commands";

  describe("BookAppointmentUseCase (Unit Test)", () => {
    
    it("should throw a SlotTakenError if the requested slot is already taken", async () => {
      // 1. Create a Fake/Mock Repository
      const mockAppointmentsRepo = {
        checkSlotStatus: vi.fn().mockResolvedValue(true), // Simulate: Slot IS occupied
        saveBooking: vi.fn(),
      } as unknown as AppointmentsRepository;

      // 2. Inject the mock into the use-case constructor (Dependency Injection)
      const useCase = new BookAppointmentUseCase(mockAppointmentsRepo);

      // 3. Assert: Verify the use-case throws the expected domain error
      await expect(
        useCase.execute({ patientId: "patient_01", slotId: "slot_locked_id" })
      ).rejects.toThrow("This slot is already booked!");

      // 4. Verify: Ensure the save function was blocked
      expect(mockAppointmentsRepo.saveBooking).not.toHaveBeenCalled();
    });

    it("should successfully save the booking if the slot is completely available", async () => {
      // 1. Configure the mock to return an available status
      const mockAppointmentsRepo = {
        checkSlotStatus: vi.fn().mockResolvedValue(false), // Simulate: Slot is FREE
        saveBooking: vi.fn().mockResolvedValue({ id: "booking_xyz", status: "CONFIRMED" }),
      } as unknown as AppointmentsRepository;

      const useCase = new BookAppointmentUseCase(mockAppointmentsRepo);
      const payload = { patientId: "patient_01", slotId: "slot_free_id" };

      // 2. Execute the action
      const result = await useCase.execute(payload);

      // 3. Assertions
      expect(result.status).toBe("CONFIRMED");
      expect(mockAppointmentsRepo.saveBooking).toHaveBeenCalledWith(payload.patientId, payload.slotId);
    });
  });
  ```

  ---

  ## 3. Integration & E2E Testing Patterns

  **Rule:** Integration and E2E tests run against real user flows. Playwright is our designated runner for visual validation and portal logins.

  ### Next.js E2E Pattern (Playwright):
  ```typescript
  // e2e/portals/appointment-booking.spec.ts
  import { test, expect } from '@playwright/test';

  test.describe("Patient Appointment Portal (E2E Test)", () => {
    test.beforeEach(async ({ page }) => {
      // 1. Seed user auth or sign in
      await page.goto('/login');
      await page.fill('input[type="email"]', 'patient@samson.com');
      await page.fill('input[type="password"]', 'securePassword123');
      await page.click('button[type="submit"]');
    });

    test("should successfully book an appointment through the UI portal", async ({ page }) => {
      await page.goto('/user/appointments/new');
      
      // Choose service & doctor
      await page.selectOption('select[name="service"]', { label: 'Teeth Cleaning' });
      await page.selectOption('select[name="doctor"]', { label: 'Dr. Samson' });
      
      // Submit form
      await page.click('button#book-now');

      // Assert redirect & validation message
      await expect(page).toHaveURL('/user/dashboard');
      await expect(page.locator('.toast-success')).toContainText('Appointment requested successfully!');
    });
  });
  ```

  ---

  *Document version: 2.0 (Next.js Edition) – last updated 2026‑05‑27*