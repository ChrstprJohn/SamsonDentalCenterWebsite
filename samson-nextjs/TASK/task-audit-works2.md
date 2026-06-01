# Frontend Architecture Audit & Remediation

## Audit Findings

### 1. `landing-view.tsx` God Component Violation
- **Violation**: The file `src/modules/patients/views/landing-view.tsx` is 408 lines long, violating the maximum component size threshold of 150 lines defined in `1-ARCHITECTURE.md` (Rule 4). It defines multiple complex layouts (Hero, Services, About, Gallery, Contact, Modal) inline.
- **Violation**: It manages state for the contact form and service selection directly inline, rather than delegating complex state and mock API interactions to a companion custom hook (Rule 1: Mandatory Hook Binding).
- **Required Fix**: Break down the view into 5 sub-components inside `src/modules/patients/components/landing/` and extract the state logic into `src/modules/patients/hooks/landing/use-landing-view.hook.ts`.

### 2. `profile-settings-view.tsx` State Management Violation
- **Violation**: The file `src/modules/patients/views/profile-settings-view.tsx` is 186 lines long, breaching the 150-line rule.
- **Violation**: It contains extensive inline `useState` declarations for 8 different form fields and handles mock API submissions directly in the view. This strictly violates Rule 1: Mandatory Hook Binding.
- **Required Fix**: Extract all profile state management into `use-profile-settings-view.hook.ts`. Split the form into `profile-details-form.tsx` and `profile-preferences-form.tsx`.

### 3. Missing Forgot Password Flow in UI
- **Violation**: The authentication UI does not expose the new Forgot Password flow implemented in the backend.
- **Required Fix**: Update `login-form.tsx` to include a link to `/auth/forgot-password`.

---

## Remediation Checklist

- [x] **Phase 1: Update Login View**
  - [x] Add "Forgot Password?" link to `login-form.tsx`.

- [x] **Phase 2: Refactor Landing View**
  - [x] Create `use-landing-view.hook.ts`
  - [x] Create `hero-section.tsx`
  - [x] Create `services-section.tsx`
  - [x] Create `about-section.tsx`
  - [x] Create `gallery-section.tsx`
  - [x] Create `contact-section.tsx`
  - [x] Assemble in `landing-view.tsx`

- [x] **Phase 3: Refactor Profile Settings View**
  - [x] Create `use-profile-settings-view.hook.ts`
  - [x] Create `profile-details-form.tsx`
  - [x] Create `profile-preferences-form.tsx`
  - [x] Assemble in `profile-settings-view.tsx`
