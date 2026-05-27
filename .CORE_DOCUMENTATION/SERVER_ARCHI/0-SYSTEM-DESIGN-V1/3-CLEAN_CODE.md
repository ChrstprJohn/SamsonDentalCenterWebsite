# Clean Code Structure & Layer Separation Guidelines

> **System Note:** Governed by `agent-skills/code-review-and-quality` and `agent-skills/code-simplification`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document outlines the operational rules for maintaining clean, separated, and highly maintainable backend layers. It details the responsibility of each layer, explains the necessity of the data "passing chain," and defines explicit rules for when shortcuts are allowed.

---

## 1. The Separation of Concerns (Division of Labor)

To prevent code files from growing into unmaintainable "God Files," every layer in the system has one specific, isolated job.

| Layer | Primary Responsibility | What it Knows About | What it MUST NOT Know About |
| :--- | :--- | :--- | :--- |
| **Controller** | HTTP Traffic Handling | Express Request/Response, Status Codes, Cookies | Database Schemas, SQL queries, Business Math |
| **Facade** | Module Border Security | Authorized Public Functions, Module Interfaces | Deep internal use-case files, private methods |
| **Service / Use Case** | Pure Business Logic | App Business Rules, Clinic Restrictions, Calculations | Express Objects (`req`, `res`), SQL queries, DB Types |
| **Repository / Query** | Data Storage Access | Supabase SDK, Raw SQL, DB connections | HTTP Requests, business rules, multi-module states |

---

## 2. The Data Passing Chain (Why We Suffer the Extra Typing)

Passing data sequentially down the chain (Controller $\rightarrow$ Facade $\rightarrow$ Service $\rightarrow$ Repository) can feel tedious in a small project, but it serves as a critical architecture shield as the app scales.

### Reason A: True Isolation of Concerns
By keeping the layers separate, you protect your brain from cognitive overload. When fixing a bug, you only need to look at a single, short file focused on one type of thinking:
* Fixing a route issue? Change **only** the Controller.
* Fixing an appointment booking rule? Change **only** the Service.
* Optimizing a slow database look-up? Change **only** the Repository.

### Reason B: Structural Refactor Insurance
The **Facade** acts as a locked door with a receptionist. If you decide to rename, delete, or completely rewrite your internal services or use-case files, external modules will not break. As long as the Facade's public function name stays the same, you can change the underlying implementation gears anytime without a domino-effect crash across the app.

---

## 3. Practical Rules for Safely Adding Features

To add features without breaking existing production code, always follow the **Additive Coding Pattern**:

1. **Build Next to Old Code, Not Inside It:** When adding a new capability (e.g., sending an SMS notification after a booking), write the SMS logic in its own separate file or module. 
2. **Use Orchestrators as Safety Nets:** Use an external orchestrator to call the core booking logic first, and then call the new SMS logic inside a `try/catch` block. If the new feature fails or the SMS provider goes down, the core booking system continues to work flawlessly.
3. **Extend Existing Objects Safely:** When updating input configurations (DTOs) for a new feature, always mark new fields as optional (`?` in TypeScript) or provide default values so legacy callers don't crash.

---

## 4. The Engineering Shortcut Cheat Sheet

You do not have to be a rigid machine. You can optimize your development speed by knowing when to strictly use the chain and when to bypass it.

### 🟢 The "Pure Read" Shortcut (Queries)
If a route is simply reading data from the database to display on a screen or table (e.g., fetching a list of users for an admin panel dashboard), there are usually no complex business rules involved.
* **The Shortcut:** You are authorized to skip the Service/Use Case layer. Have the Controller request the data directly from the Repository/Query file via the Facade. This eliminates useless "copy-paste" service functions.

### 🔴 The "Write/Modify" Strict Rule (Commands)
If a route inserts, updates, deletes, or changes the state of data in your system (e.g., processing a payment, updating a schedule slot, creating an account), **you must follow the full chain**.
* **The Rule:** State-changing actions naturally collect weird, complex business restrictions over time. Keeping the strict Service layer intact here guarantees your data remains valid and secure against business logic bugs.

---

*Document version: 1.1 – last updated 2026‑05‑17*