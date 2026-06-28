# Task checklist for Scalable Tailwind CSS Frontend Refactoring

- [x] **Phase 1: Define Theme Configuration**
  - [x] Set up standardized CSS variables in `:root` inside `globals.css` (for primary, secondary, backgrounds, foregrounds, borders, shadows, and fonts).
  - [x] Implement Tailwind CSS v4 `@theme` bindings in `globals.css` using the extracted CSS variables.
  - [x] Optimize the light theme defaults.

- [x] **Phase 2: Refactor UI Components**
  - [x] Update [button.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/components/ui/button.tsx) to map variant classes to theme CSS variables.
  - [x] Update [navbar.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/components/ui/navbar.tsx) to replace hardcoded border/background/text colors with theme variables.

- [x] **Phase 3: Refactor Landing Page Sections**
  - [x] Update [landing-view.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/views/landing-view.tsx) to use theme background and text color variables.
  - [x] Refactor [hero-section.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/modules/patients/components/landing/hero-section.tsx) to use central theme variables instead of hardcoded gradients/colors.
  - [x] Refactor other landing components (About, Services, Gallery, Contact) as needed to adopt the central colors.

- [x] **Phase 4: Verification and Quality Check**
  - [x] Run typescript checks and `pnpm build` to verify there are no compilation errors.
  - [x] Verify style changes on the dev server.

- [x] **Phase 5: Refactor Shared Components & Portals**
  - [x] Update remaining UI elements in [src/components/ui](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/components/ui) (e.g., Badge, Input, Select, Textarea, Modal) to use theme custom properties.
  - [x] Refactor and adapt portal views (User Portal, Admin Portal, Doctor Portal, Secretary Portal) to consume unified theme color classes instead of hardcoded values.
