# 📚 Samson Dental – System Design Guidelines

> **AI System Note:** This directory contains the project-specific system architecture for Samson Dental. These documents define *what* we are building and *how* it should be structured. When working on this project, adhere to these project constraints while following the generalized engineering workflows defined in `agent-skills`.

## Table of Contents & Agent Skills Integration Map

This table maps our project-specific system design documents to the corresponding `agent-skills` workflows that enforce them.

| System Design Doc | Description | Governed By Skill(s) |
| :--- | :--- | :--- |
| **[1. Architecture Blueprint](1-ARCHITECTURE.md)** | Core Modular Monolith structure and directory layout. | `spec-driven-development`, `incremental-implementation` |
| **[1.5. Golden Coding Patterns](1.5-CODING-PATTERNS.md)** | Standard coding templates, mappers, DTOs, and layer blueprints. | `code-review-and-quality`, `code-simplification` |
| **[2. Express & TypeScript](2-EXPRESS.md)** | Backend framework conventions, routing, and DTOs. | `api-and-interface-design`, `frontend-ui-engineering` |
| **[3. Clean Code & Layers](3-CLEAN_CODE.md)** | Separation of concerns (Controllers vs Services). | `code-review-and-quality`, `code-simplification` |
| **[4. Testing Guidelines](4-TESTING_GUIDELINES.md)** | Unit vs Integration testing strategy and mocks. | `test-driven-development` |
| **[5. API Versioning](5-API_VERSIONING.md)** | Additive routing and the Compatibility Gatekeeper. | `api-and-interface-design`, `deprecation-and-migration` |
| **[6. Architecture Decision Log](6-ADR-LOG.md)** | Historical log of major architectural decisions. | `documentation-and-adrs` |

## ✅ Unified Technical Checklist
| Area | Recommendation |
|------|-----------------|
| Testing | Unit tests for logic, integration tests for DB, E2E for critical flows. |
| CI/CD | GitHub Actions: lint, type-check, test, Docker build. |
| Security | Input validation, rate limiting, CSP, Helmet, `.env` secrets. |
| Logging | Central JSON logger with correlation IDs, health endpoint. |
| API Docs | Auto-generated Swagger/OpenAPI docs. |
| Error Handling | Global middleware mapping custom errors to HTTP status codes. |
| Performance | Lazy loading, caching for read-only queries, pagination. |
| Code Quality | ESLint, Prettier, `no-any`, strict TypeScript (`tsc --noEmit`). |

> [!NOTE] 
> Keep this file as the single source of truth for the project's technical requirements. Each guideline file focuses on its specific domain but follows the visual language defined here.
