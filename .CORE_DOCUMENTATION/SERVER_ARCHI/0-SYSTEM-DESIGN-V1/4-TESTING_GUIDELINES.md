# Express + TypeScript Testing Architecture Blueprint

> **System Note:** Governed by `agent-skills/test-driven-development`. Follow the 80/15/5 test pyramid.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document defines the testing strategy, standards, and code patterns for our backend application using **Jest**. By segregating our backend into structured layers, we can cleanly test our code configurations without manual data-entry fatigue.

---

## 1. The Testing Pyramid (80 / 15 / 5)

We divide our testing strategy into three distinct categories to balance speed with accuracy:

| Strategy | Proportion | What It Tests | Is Database Connected? | Speed |
| :--- | :--- | :--- | :--- | :--- |
| **Unit Tests** | **80%** | Single business service or use-case in complete isolation. | **No** (Database calls mocked). | Sub-millisecond |
| **Integration Tests**| **15%** | Real interaction between Repositories and the actual database. | **Yes** (Isolated test DB). | Moderate |
| **E2E Tests** | **5%** | Full HTTP request/response cycle using Supertest. | **Yes** (Test DB + Express). | Slow |

---

## 2. Unit Testing Patterns (Testing Services with Mocks)

**Rule:** Unit tests must never touch a real database network connection. We use Jest to fake the behavior of our **Repository** layer so we can focus exclusively on testing edge cases in our business math and rules.

### Code Implementation:
```typescript
// src/modules/appointments/use-cases/book-appointment.spec.ts
import { BookAppointmentUseCase } from "./book-appointment.use-case";
import { AppointmentsRepository } from "../repository/appointments.repository";

describe("BookAppointmentUseCase (Unit Test)", () => {
  
  it("should throw a 422 error if the requested slot is already taken", async () => {
    // 1. Create a Fake/Mock Repository
    const mockAppointmentsRepo = {
      checkSlotStatus: jest.fn().mockResolvedValue(true), // Simulate: Slot IS occupied
      saveBooking: jest.fn(),
    } as unknown as AppointmentsRepository;

    // 2. Inject the mock into the use-case constructor (Dependency Injection)
    const useCase = new BookAppointmentUseCase(mockAppointmentsRepo);

    // 3. Assert: Verify the use-case throws the expected error
    await expect(
      useCase.execute({ patientId: "patient_01", slotId: "slot_locked_id" })
    ).rejects.toThrow("This slot is already booked!");

    // 4. Verify: Ensure the save function was blocked
    expect(mockAppointmentsRepo.saveBooking).not.toHaveBeenCalled();
  });

  it("should successfully save the booking if the slot is completely available", async () => {
    // 1. Configure the mock to return an available status
    const mockAppointmentsRepo = {
      checkSlotStatus: jest.fn().mockResolvedValue(false), // Simulate: Slot is FREE
      saveBooking: jest.fn().mockResolvedValue({ id: "booking_xyz", status: "CONFIRMED" }),
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

**Rule:** Integration and E2E tests must run against a real, isolated test database that is seeded and cleared between test runs.

### Code Implementation (E2E with Supertest):
```typescript
// src/modules/appointments/controllers/appointments.controller.spec.ts
import request from 'supertest';
import { app } from '../../../app';
import { db } from '../../../shared/database';

describe("Appointments API (E2E Test)", () => {
  beforeAll(async () => {
    // Setup isolated test database connection
  });

  afterEach(async () => {
    // Clean up database tables between tests
    await db.appointment.deleteMany();
  });

  it("should return 201 and book an appointment via the API", async () => {
    const response = await request(app)
      .post('/api/v1/appointments')
      .send({ patientId: "patient_01", slotId: "slot_123" });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("CONFIRMED");
  });
});
```

---

*Document version: 1.1 – last updated 2026‑05‑17*