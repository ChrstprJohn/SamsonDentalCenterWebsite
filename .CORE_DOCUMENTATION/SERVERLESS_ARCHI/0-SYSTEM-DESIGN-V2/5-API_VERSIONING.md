# API Versioning & Gatekeeper Architecture Manual

> **System Note:** Governed by `agent-skills/api-and-interface-design` and `agent-skills/deprecation-and-migration`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document establishes the official development standards for updating, extending, and versioning our REST API endpoints. By utilizing a modular architecture, we ensure that breaking changes on the frontend do not force us to rewrite or duplicate our underlying core database services.

---

## 1. The Core Philosophy: Why We Version

An API is a strict data contract between the backend and client applications (Web, Mobile, Third-Party integrations). 

* **The Problem:** If you modify an existing database field or input structural layout in production, any active user who has not immediately updated their mobile or web application will experience instant runtime crashes.
* **The Solution:** We implement **Additive Routing**. Instead of overwriting live endpoints, we expose multiple version pathways simultaneously (e.g., `/api/v1` and `/api/v2`). This allows legacy systems and modern systems to coexist seamlessly.

---

## 2. When to Version (Breaking vs. Non-Breaking Changes)

Do not create a new API version for every change. Only increment the global version identifier when introducing a **Breaking Change**.

### 🟢 Non-Breaking Changes (No version bump needed)
* Adding a brand-new endpoint (e.g., introducing `GET /api/v1/analytics`).
* Adding an optional property field to an incoming request DTO.
* Adding a new data property to an outgoing JSON response payload (frontend clients will naturally ignore unmapped fields).

### 🔴 Breaking Changes (Requires a `v2` or higher bump)
* Deleting or renaming an existing request parameter or payload field (e.g., splitting `fullName` into `firstName` and `lastName`).
* Restructuring URL routing patterns (e.g., moving from `/users/:id` to `/users/profile/:id`).
* Modifying core authentication behavior (e.g., switching from Cookie Sessions to JWT Tokens).

---

## 3. The "Compatibility Gatekeeper" Pattern

When a new version is created, **we do not duplicate or rewrite our internal Services, Use Cases, or Repositories.** The database and business layers always reflect the latest standard of truth. 

The individual versioned controllers act as input translators at the gate:
* **The V2 Controller:** Accepts the clean, modern input directly and feeds it straight to the core service layer.
* **The V1 Controller:** Acts as a backward-compatibility layer. It intercepts the old legacy format, transforms the shape of the data on the fly to match the new internal layout, passes it to the *same* core service, and outputs the answer in the old structure the legacy client expects.

---

## 4. Complete Code Implementation Blueprint

This code layout shows how two active API routes utilize the exact same underlying service engine simultaneously without data collisions.

### 4.1 The Shared Core Business Service
The service file only cares about the modern data layout. It remains entirely blind to API route names or versions.

```typescript
// src/modules/users/users.service.ts
import { UsersRepository } from "./users.repository";

export class UsersService {
  constructor(private usersRepo: UsersRepository) {}

  // The modern business engine expects separate firstName and lastName properties
  async registerNewUser(data: { firstName: string; lastName: string; email: string }) {
    return await this.usersRepo.saveToDatabase(data);
  }
}
```

### 4.2 The V2 Controller (Modern)
Connects directly to the service with the new data shape.

```typescript
// src/modules/users/controllers/v2/users.controller.ts
import { Request, Response } from "express";
import { UsersService } from "../../users.service";

export class UsersV2Controller {
  constructor(private usersService: UsersService) {}

  async register(req: Request, res: Response) {
    // V2 clients send { firstName, lastName, email }
    const user = await this.usersService.registerNewUser(req.body);
    res.status(201).json(user);
  }
}
```

### 4.3 The V1 Controller (Gatekeeper Translator)
Transforms legacy data into the modern shape before calling the core service.

```typescript
// src/modules/users/controllers/v1/users.controller.ts
import { Request, Response } from "express";
import { UsersService } from "../../users.service";

export class UsersV1Controller {
  constructor(private usersService: UsersService) {}

  async register(req: Request, res: Response) {
    // Legacy V1 clients send { fullName, email }
    const { fullName, email } = req.body;
    
    // Compatibility Translation: Split fullName into first and last
    const [firstName, ...lastNames] = fullName.split(" ");
    const lastName = lastNames.join(" ");

    // Call the exact same underlying service
    const user = await this.usersService.registerNewUser({
      firstName,
      lastName,
      email
    });

    // Translate output back to legacy format if necessary
    res.status(201).json({
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email
    });
  }
}
```

---

*Document version: 1.1 – last updated 2026‑05‑17*