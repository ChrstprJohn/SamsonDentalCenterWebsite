# Task: Secretary Portal - Doctor Management Page Implementation

Implementing the Doctor Management page at `/secretary/doctors` adhering strictly to Serverless Architecture guidelines, Next.js App Router rules, and codebase design patterns.

---

## 🗄️ 1. Database & Server Actions (Backend)

- [x] **Database Setup & Schema Validation**:
  - Verify `users` table handles role `DOCTOR` and status flags. Note that since the database uses standard Supabase auth or metadata, status `FORCE_PASSWORD_CHANGE` or corresponding metadata flags must be integrated securely.
  - Verify database constraints on `doctor_services` junction table (many-to-many relationship of `doctor_id` to `service_id`).
  - Verify doctor schedule inheritance behavior: creating a new doctor automatically inserts their Layer 2 default schedules as **Monday to Friday, 8:00 AM - 5:00 PM**.
- [x] **Next.js Server Actions (`src/modules/doctors/actions/`)**:
  - [x] `create-doctor.action.ts`:
    - Accept input data: first name, middle name, last name, suffix, email, phone, specialization, default password, and selected service IDs.
    - Write to auth/users database, set user metadata status to `FORCE_PASSWORD_CHANGE`.
    - Insert selected services into `doctor_services` junction table.
    - Copy default clinic hours (**Mon-Fri 8am-5pm**) to `doctor_schedules` for the new doctor.
    - **Rule Check**: Must return a standardized, serializable response format (e.g., `{ success: boolean, message?: string, errors?: Record<string, string[]> }`).
  - [x] `update-doctor.action.ts`:
    - Accept updated doctor details and the array of selected service IDs.
    - Diff and update junction records in `doctor_services` (removing unselected and inserting new).
    - Update profile fields.
    - Standardize error return format to bridge server-side rejections to the client.

---

## 🎨 2. Component & Hook Architecture (Frontend)

- [x] **RSC Data Hydration Rule (No useEffect On-Mount Fetching)**:
  - The Next.js page at `src/app/secretary/doctors/page.tsx` must act as the async orchestrator, fetching raw doctors data, services list, etc. on the server side.
  - Data must be mapped/serialized and passed down as standard TS props. Client hooks/components must NOT fetch initial data via `useEffect` loops on mount.
- [x] **Data-Mapping & Anti-Leak Adapters**:
  - Map PostgreSQL snake_case database model properties to clean camelCase interface definitions (e.g., `doctor_id` -> `doctorId`, `created_at` -> `createdAt`) inside the services/hooks layer before injecting props into visual components.
- [x] **Dumb Presentational Components (`src/modules/doctors/components/`)**:
  - **Rule Check**: Keep filenames in `kebab-case.tsx` and export named PascalCase functions. No default exports.
  - **Rule Check**: Component files must not exceed **150 lines** of code (excluding imports/types). Split visual segments into a `sub-components/` subdirectory if exceeded.
  - **Rule Check**: Form layouts must render server errors *alongside* form fields, never replacing the form layout (prevents disappearing form UX bug).
  - [x] `doctor-card.tsx`: Renders doctor basic info, specialization, initials/avatar, and status badge (`ACTIVE` -> Green, `FORCE_PASSWORD_CHANGE` -> Orange, `INACTIVE` -> Slate).
  - [x] `doctor-list.tsx`: Scrollable list of doctor cards, including search inputs and status filter dropdowns.
  - [x] `service-pill-selector.tsx`: Interactive multi-select UI. Displays selected services as pills with `x` delete triggers. Offers dropdown list of unselected active clinic services to append new pills.
- [x] **Client Custom Hooks (`src/modules/doctors/hooks/`)**:
  - **Rule Check**: Filenames in `use-kebab-case.ts`, export named camelCase functions. Custom hooks must not return JSX or styles.
  - [x] `use-doctor-form-schema.ts`: Define Zod validation schema (`doctorFormSchema`) and TypeScript types (`DoctorFormValues`).
  - [x] `use-doctor-form.ts`: Hook binding for React Hook Form + Zod resolver + Server Action. Uses `setError` to map server-side validation/conflicts directly to RHF inputs.
  - [x] `use-doctor-management.ts`: Custom hook managing active doctor selection, search criteria, filter state, and view/edit toggling.
- [x] **Shared UI Primitive Ref Forwarding**:
  - Ensure that any core input primitives under `src/components/ui/` use `React.forwardRef` to cleanly support react-hook-form registration bindings.

---

## 🖥️ 3. Layout details (Split-pane and Sub-panes)

- [x] **Page Grid Layout**:
  - Main view uses `lg:grid-cols-12` split: Left column `lg:col-span-5` (Roster list of doctor cards) and Right column `lg:col-span-7` (Details & Edit pane).
- [x] **Details Pane Layout Split**:
  - Left Sub-Pane: Read-only doctor contact details and schedule preview (Mon-Fri 8:00 AM - 5:00 PM).
  - Right Sub-Pane: Form interface to edit initial details and services offered (utilizing the interactive pills selector).

---

## 🔒 4. First-Login Security Flow (Force Password Change)

- [ ] **Session Guard Middleware/Layout**:
  - Implement check in portal routes/layout checking if user's role is `DOCTOR` and status is `FORCE_PASSWORD_CHANGE`.
  - Block access to standard portals, force redirecting user to the Password Reset screen.
- [x] **Force Password Change Screen**:
  - Simple form collecting new password, triggering an action that resets the status to `ACTIVE` in database.

---

## 🧪 5. Testing & Verification

- [x] **Unit Tests**:
  - Co-locate tests alongside hook files (e.g. `use-doctor-form.spec.ts`).
  - Test validation rules, mock server actions, verify correct serialization, and verify error field mapping.
- [ ] **Manual Verification**:
  - [x] Verify adding a doctor copies Layer 1 baseline schedules (Mon-Fri 8am-5pm) to Layer 2 shifts.
  - [x] Verify adding and removing service pills updates the junction table.
  - [ ] Verify first login intercept works correctly and forces redirection.
