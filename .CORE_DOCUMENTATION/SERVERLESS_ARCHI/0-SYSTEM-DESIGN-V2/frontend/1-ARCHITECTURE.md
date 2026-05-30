# Frontend Architectural Blueprint & Directory Layout

> **System Note:** Governed by `agent-skills/frontend-ui-engineering` and `agent-skills/incremental-implementation`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document establishes the official architectural standards, folder organization, and modular scaling principles for the Samson Dental frontend using **Next.js (App Router)** and **React**. The primary goal is to enforce extreme modularity, eliminate technical debt, and prevent massive "God Components" that bundle UI styling and state logic.

---

## 1️⃣ Core Architectural Principles

1. **Strict Logical Extraction (Mandatory Hook Binding for Domain Logic)**  
   No React component may manage its own complex state, side effects, or lifecycle logic inline. Every component requiring complex business state, network data mutations, or event-driven reactions must delegate that logic to a companion custom hook. *Exception: Trivial layout state (e.g., simple toggles) is exempt to prevent boilerplate fatigue.*

2. **Server-Side Data Orchestration vs. Dumb UI Presentation**  
   * **Server Components (RSCs)**: Next.js Server Components are allowed—and encouraged—to query the database or APIs directly. They act as async data-fetching orchestrators.
   * **Client Components**: These are strictly presentational. They receive data from RSCs and event callbacks via TypeScript props. They have zero direct knowledge of business formulas or database connections.

3. **Domain‑First Component Organization**  
   UI elements are organized by business feature rather than technical type. Standard global components (buttons, input fields) live in a shared kernel, while business-focused elements (booking forms, patient cards) live directly within their respective domain module.

4. **God Component Prevention Rule**  
   A single component file must not exceed **150 lines of code**. If a component grows past this limit, it is a trigger that the component is doing too much. It must be broken down into smaller, atomic sub-components.

5. **Explicit Client Boundary Marking**  
   Because Next.js defaults to React Server Components (RSC), files that use interactive primitives, browser APIs, or React lifecycle hooks must explicitly state their boundary.
   * **Must include `'use client'` at line 1:** All files inside `src/context/`, `src/modules/*/hooks/`, `src/modules/*/views/`, and any component file within `src/modules/*/components/` that binds to a custom hook, handles browser events (clicks, submits), or manages local state.
   * **Must NOT include `'use client'`:** Route wrappers, layouts, page definitions, server data clients (`*.server.ts`), and server actions (`actions/`).

6. **Data Infrastructure Protection**  
   To prevent accidental leaks of backend infrastructure, database credentials, or private keys into client bundles, all server-side data clients (`*.server.ts`) must import the `server-only` package at the very top of the file.
   ```typescript
   import 'server-only';
   // Your secure server-side database logic here
   ```

7. **Boundary Serialization Rule**  
   Data passed from a Server Component across a client boundary (`'use client'`) must be a plain, serializable JavaScript object. Ensure dates are converted to ISO strings or timestamps, and complex database models are mapped to clean TypeScript definitions before being injected into interactive child views.

---

## 2️⃣ Directory & Folder Blueprint

```text
src/
├── app/                        # Next.js App Router Routing Layer
│   ├── layout.tsx              # Root HTML, Fonts, Global Providers
│   ├── (public)/               # Public marketing pages & landing routing
│   │   ├── page.tsx            # RSC Page: imports views from modules
│   │   └── layout.tsx
│   └── (portals)/              # Role-based secure routing
│       ├── user/               # Patient Portal routes
│       │   └── appointments/
│       │       └── page.tsx    # RSC: Fetches DB data → passes to Module View
│       └── admin/              # Clinic Admin routes
│
├── components/                 # Global UI Shared Kernel (Pure, Headless/Styled UI)
│   ├── ui/                     # Design System primitives (React.forwardRef mandatory)
│   │   ├── button.tsx          # Must accept strictly typed props, zero state
│   │   ├── input.tsx           # forwardRef for react-hook-form register binding
│   │   └── modal.tsx
│   └── feedback/               # Skeletons, Spinners, Toast containers
│
├── hooks/                      # Global UI Hooks (Non-domain-specific)
│   ├── use-media-query.ts      # Responsive design triggers
│   ├── use-disclosure.ts       # Open/Close state helpers for modals
│   └── use-click-outside.ts    # Dropdown click dismissal hook
│
├── modules/                    # Self-Contained Domain Modules (The Core)
│   ├── appointments/           # Appointments Domain Module
│   │   ├── actions/            # Secure Server Actions ('use server')
│   │   │   └── create-booking.action.ts
│   │   │
│   │   ├── views/              # Portal Layout Orchestrators ('use client')
│   │   │   └── booking-view.tsx # Binds Server Props + Custom Hook → Dumb Component
│   │   │
│   │   ├── components/         # Atomic Presentational Components (Dumb Renderers)
│   │   │   ├── appointment-card.tsx
│   │   │   ├── appointment-list.tsx
│   │   │   └── booking-card.tsx # 100% dumb: receives props, renders UI
│   │   │
│   │   ├── hooks/              # State Machines & React Hook Form Schemas
│   │   │   ├── use-booking-form.ts          # Zod + RHF + Server Action delegation
│   │   │   └── use-booking-form-schema.ts   # Zod schema & inferred types
│   │   │
│   │   ├── services/           # Technical Infrastructure Clients
│   │   │   ├── appointments.server.ts  # 'server-only' DB fetchers (Strictly RSC only)
│   │   │   └── appointments.client.ts  # Browser fetch / REST handlers (Strictly Client only)
│   │   │
│   │   ├── mocks/              # Mock-First Development Data (Dev-only)
│   │   │   └── appointments.mock.ts
│   │   │
│   │   └── exports.ts          # Public Module Facade (NOT index.ts — see Section 4)
│   │
│   └── billing/                # Billing Domain Module
│       ├── actions/
│       ├── views/
│       ├── components/
│       │   └── payment-summary.tsx
│       └── hooks/
│           └── use-payment-summary.ts
│
├── context/                    # Shared Global State Contexts
│   └── theme-context.tsx       # Dark/Light mode context
```

> ⚠️ **The `index.ts` Barrel File Trap**: In Next.js App Router, if a single barrel file (`index.ts`) exports both a `'use client'` hook and a server utility, importing *anything* from that file into an RSC page can cause the compiler to lose track of the client boundary — leading to build errors or accidental client bundle leaks. Use `exports.ts` instead and keep server-only paths imported directly (e.g., `from './services/appointments.server'`).

---

## 3️⃣ Rules to Prevent God Components (Component Scale Refactoring)

As interfaces expand, UI files naturally attract clutter. Follow these strict refactoring rules to prevent "God Components":

### A. The 150-Line Threshold
* **Rule**: If your `.tsx` file (excluding imports and type declarations) exceeds **150 lines**, it must be divided.
* **Execution**: Follow the **Compound Component Multi-File Progression**:
  1. **Under 150 Lines**: Keep sub-elements (custom table rows, small list icons) in the same file as private, un-exported local components.
  2. **Over 150 Lines**: Extract sub-elements into a dedicated `sub-components/` directory placed directly inside that specific feature folder.
  3. **Cross-Domain Reusability**: If a sub-component is duplicated outside its parent module, migrate it out of `modules/` entirely and refactor it into `src/components/ui/` as a core design system primitive.

### B. Single Responsibility in UI
* A single component should render one distinct visual piece.
* **Bad**: A `dashboard.tsx` that renders the header, the sidebar, a search bar, a data grid, and a footer in one gigantic JSX block.
* **Good**: A `dashboard.tsx` that coordinates `<Sidebar />`, `<DashboardHeader />`, and `<DataGrid />`.

### C. Extract Complex JSX Render Trees
* If you have deep nesting of divs and complex CSS grids inside a single component, group distinct blocks into local child components.
* Use meaningful TypeScript props interfaces to pass the needed slice of data cleanly down the tree.

### D. The Trivial State Exemption (Boilerplate Reduction)
The "Mandatory Hook Binding" rule is relaxed for trivial, localized UI state to prevent developer fatigue ("Boilerplate Tax").
* **Rule**: Any component (domain or global) is allowed to maintain localized, low-frequency layout state (`useState`) directly inline if the logic is exclusively for simple visual toggling (e.g., `isOpen` for accordions, simple tab switches, dropdown visibility).
* **Exception**: If the state interacts with form validation, complex multi-step wizards, or requires side-effects (`useEffect`), it MUST be extracted to a hook.

---

## 4️⃣ How to Use This Blueprint

1. **Bootstrap visual components** in `components/ui/` for design consistency. All input primitives wrapping native `<input>`, `<textarea>`, or `<select>` must use `React.forwardRef` for `react-hook-form` compatibility.
2. **Develop domain modules** (`src/modules/*`) with high cohesion. Place dumb rendering in `components/`, view orchestrators in `views/`, state/form logic in `hooks/`, and secure write operations in `actions/`.
3. **Connect page entry points** (`src/app/`) by importing views from modules. The RSC pages must remain simple shells that fetch data from `services/*.server.ts` and feed it as props to the module's view orchestrator.
4. **Never cross-import private module contents**. If the `billing` module needs to show appointment details, it must import them through the public facade `appointments/exports.ts`. Never use a blanket `index.ts` barrel file to re-export mixed server/client code.

---

*Document version: 2.0 (Next.js Frontend) – last updated 2026‑05‑30*
