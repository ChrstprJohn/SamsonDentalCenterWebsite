# Architecture Decision Record (ADR) Log

> **System Note:** Governed by `agent-skills/documentation-and-adrs`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document serves as the historical log for major architectural decisions in the Samson Dental backend. 

* **Why we use ADRs:** Architecture is a series of trade-offs. Recording *why* we chose a specific path prevents future developers (and AI agents) from second-guessing decisions or re-litigating settled debates.

---

## ADR-001: Modular Monolith Architecture
* **Date:** May 2026
* **Status:** Accepted
* **Context:** The system needs to be scalable but not overly complex out of the gate. Microservices introduce network overhead, complex deployments, and distributed data issues. A standard monolith often devolves into a "Big Ball of Mud" where everything depends on everything else.
* **Decision:** We will use a **Modular Monolith (Modulith)**. Code will be strictly separated by business domain into isolated modules (e.g., Users, Appointments) that communicate only through defined facades or orchestrators.
* **Consequences:** Easier to deploy than microservices, easier to maintain than a standard monolith. Requires discipline to not violate module boundaries.
* **Reference:** [1-ARCHITECTURE.md](1-ARCHITECTURE.md)

---

## ADR-002: Express + TypeScript Stack
* **Date:** May 2026
* **Status:** Accepted
* **Context:** The backend requires a mature, well-supported ecosystem that allows for strict typing.
* **Decision:** We will use **Node.js, Express, and strict TypeScript**. We will rely on DTOs and validation libraries to enforce type safety at runtime.
* **Consequences:** We must manually configure routing and middleware (unlike opinionated frameworks like NestJS), but we gain maximum control and flexibility.
* **Reference:** [2-EXPRESS.md](2-EXPRESS.md)

---

## ADR-003: Additive Routing (Gatekeeper Pattern) for API Versioning
* **Date:** May 2026
* **Status:** Accepted
* **Context:** Mobile clients and third-party integrations will break if we modify API response shapes or required inputs.
* **Decision:** We will never break a live API route. Instead, we will use **Additive Routing**. When breaking changes are needed, we create a new `/v2` controller route. The `/v1` controller is converted into a Gatekeeper that translates legacy inputs into the modern shape and passes them to the single, shared underlying Service layer.
* **Consequences:** Our core business logic stays clean and un-versioned. We must maintain translation logic in legacy controllers until old clients are deprecated.
* **Reference:** [5-API_VERSIONING.md](5-API_VERSIONING.md)
