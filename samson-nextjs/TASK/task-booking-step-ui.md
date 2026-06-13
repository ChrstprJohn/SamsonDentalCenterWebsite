# Task: Booking Flow UI Makeover

This task track the UI overhaul of the user booking flow inside the patient portal, ensuring consistency, high visual standards, and proper Tailwind CSS class usage without changing functional logic.

## Tasks

- [ ] **Global Layout**
  - [ ] Remove `<Footer />` component from [layout.tsx](file:///c:/Users/picar/Desktop/samson-website/samson-nextjs/src/app/(portals)/booking/layout.tsx) to make it a distraction-free booking funnel.
  - [ ] Clean up non-standard Tailwind utility weightings (e.g. `slate-150`, `slate-350`, `slate-650`, `slate-750`, `slate-850`, `text-slate-805`, `dark:text-slate-195`, `blue-550`, `blue-450`) with standard, fully supported utility values.

- [ ] **Step 1: Choose a Treatment (Service Cards)**
  - [ ] Redesign service cards for a modern, glassmorphism look.
  - [ ] Improve pricing and duration badge aesthetics (e.g., subtle solid/translucent containers, refined icons).
  - [ ] Maximize contrast and text readability in light and dark modes.

- [ ] **Step 2: Select Date & Time (Schedule Layout)**
  - [ ] Redesign the top-to-bottom layout into a split layout:
    - **Left Side**: Preferred Doctor selection list.
    - **Right Side**: Custom Date carousel/calendar selector.
    - **Bottom**: Grid of available Time Slots.
  - [ ] Improve hover/active states for doctor cards, date tabs, and time slots.

- [ ] **Step 3: Patient Information**
  - [ ] Style patient type buttons (Myself vs Family) consistently with Step 2 selection UI.
  - [ ] Refine the patient details info cards and dependent selector lists.
  - [ ] Standardize form fields and input styles.

- [ ] **Step 4: Review Booking Details**
  - [ ] Make review cards consistent with Step 1 and Step 2 card aesthetics.
  - [ ] Improve section hierarchy and clinical notes block layout.
  - [ ] Style the confirm booking page to look extremely premium.

- [ ] **Success View**
  - [ ] Style the request submitted screen with clean summary cards and clear next-steps layout.
