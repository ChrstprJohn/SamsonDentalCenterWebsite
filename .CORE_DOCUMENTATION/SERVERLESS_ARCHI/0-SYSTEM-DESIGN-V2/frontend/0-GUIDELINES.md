# 🎨 Samson Dental – Frontend System Design Guidelines

> **AI System Note:** This directory contains the project-specific frontend system architecture for Samson Dental. These documents define *how* our user interfaces, state management, components, and React hooks should be structured. Adhere to these project constraints while following the generalized engineering workflows defined in `agent-skills` (e.g., `frontend-ui-engineering`).

## Table of Contents & Agent Skills Integration Map

This table maps our project-specific frontend system design documents to the corresponding `agent-skills` workflows that enforce them.

| System Design Doc | Description | Governed By Skill(s) |
| :--- | :--- | :--- |
| **[1. Architectural Blueprint](1-ARCHITECTURE.md)** | Next.js App Router directory structure, RSC vs. Client boundaries, `exports.ts` facade rules, `views/` + `actions/` layer, God Component prevention, and the `index.ts` barrel file trap. | `frontend-ui-engineering`, `incremental-implementation` |
| **[2. React Components Guide](2-REACT-COMPONENTS.md)** | Dumb Client Component principles, inline error rendering (no "Disappearing Form" bug), and `React.forwardRef` input primitives for `react-hook-form` compatibility. | `code-review-and-quality`, `code-simplification` |
| **[3. Custom React Hooks Guide](3-REACT-HOOKS.md)** | Hook Binding with Zod + React Hook Form, Server Action delegation for mutations, Trivial State Exemption, and the View Orchestrator pattern. | `api-and-interface-design`, `code-review-and-quality` |
| **[4. Coding & State Patterns](4-CODING-PATTERNS.md)** | Naming conventions, 3-tier state topology, Zod + RHF form architecture, Anti-Leak Adapters, and `React.forwardRef` shared UI primitives. | `frontend-ui-engineering`, `api-and-interface-design` |
| **[5. Testing Guidelines](5-TESTING_GUIDELINES.md)** | Hook + Server Action unit testing (Vitest), Zod validation rejection/success paths, dumb component test exemption, and Playwright E2E flows. | `test-driven-development`, `browser-testing-with-devtools` |
| **[6. Mock-First Architecture](6-MOCK-FIRST-ARCHITECTURE.md)** | Interface-Driven Development with RSC-level mock data injection, stub hooks, View Orchestrators, row-specific loading states, and Shared UI kernel. | `frontend-ui-engineering`, `api-and-interface-design` |

---

## 🎨 Unified Frontend Technical Checklist

| Area | Recommendation |
|------|-----------------|
| **Component Structure** | 100% Dumb Client Components. No inline business state, zero data fetches inside UI code. Server errors rendered *alongside* the form, never replacing it. |
| **State & Logic** | Complex state extracted into custom hooks. Trivial layout toggles (`isOpen`, tab index) may use inline `useState` (Trivial State Exemption). |
| **Data Flow** | RSC pages fetch data via `services/*.server.ts` → pass as serializable props → View Orchestrator (`views/`) binds hook + dumb component. |
| **Mutations** | All write operations go through **Server Actions** (`actions/`), never direct client-side Supabase calls. Hooks invoke the action; actions call `revalidatePath`. |
| **Form Validation** | Zod schemas + React Hook Form at the hook boundary. Client-side Zod validates first, then Server Action fires. `defaultValues` injection for testability. |
| **Shared UI Primitives** | All `<input>`, `<textarea>`, `<select>` wrappers in `src/components/ui/` must use `React.forwardRef` for `react-hook-form` `register` binding. |
| **Module Facades** | Use `exports.ts` (not `index.ts`) to prevent client/server boundary bleed in Next.js barrel files. Import server-only paths directly. |
| **Visual Aesthetics** | Harmonious curated HSL color palettes, elegant dark modes, subtle glassmorphism, responsive Flex/Grid layouts, and fluid micro-animations. Avoid default colors and browser fonts. |
| **SEO & Semantic HTML** | Strict use of HTML5 tags (`<main>`, `<section>`, `<nav>`, `<article>`, `<header>`, `<footer>`). One `<h1>` per page with a logical heading hierarchy. |
| **Accessibility (a11y)** | Interactive elements must have unique, descriptive IDs. Fully keyboard navigable, correct use of ARIA attributes, color contrast compliant. |
| **Security** | All `*.server.ts` files must `import 'server-only'` at line 1. Data crossing the RSC→Client boundary must be plain serializable JS objects (no Dates, BigInts, or class instances). |
| **Performance** | Lazy-load heavy components, use proper React memoization (`useMemo`, `useCallback`) when passing functions/objects to deep children, optimize media assets. |
| **List State** | Track row-specific loading states by ID (`loadingId: string \| null`), never a blanket boolean that cascades across all rows. |

> [!NOTE]
> Adhering to these standards ensures the Samson Dental frontend remains exceptionally clean, highly performant, visually premium, and simple to test or scale. Each guideline file focuses on its specific domain but follows the visual and architectural language defined here.

*Document version: 3.0 (Next.js Frontend) – last updated 2026‑05‑30*
