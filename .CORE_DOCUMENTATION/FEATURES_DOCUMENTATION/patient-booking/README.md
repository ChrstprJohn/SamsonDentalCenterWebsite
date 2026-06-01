# Patient Booking Flow

## Overview
The patient booking flow is a guided wizard designed to be a standalone, distraction-free experience for authenticated patients. It allows users to schedule appointments for themselves or their dependents seamlessly.

## Core Rules (from Business Plan)
1. **Authenticated Access Only:** All prospective bookers must be logged in before entering the wizard.
2. **Standalone Full-Page Wizard:** The booking wizard must be its own page, without being nested inside the Patient Portal sidebar layout, ensuring a distraction-free booking experience.
3. **Smart Redirection:**
   - **Clicking "Book Now" (Signed In):** Routes directly to the standalone booking wizard (`/booking`).
   - **Clicking "Book Now" (Signed Out):** Routes to the Login page with a redirect param (`/auth/login?redirect=/booking`). After login, the user lands in the wizard.
   - **Regular Login (Signed Out):** If the user clicks "Login" normally, they will be routed to their Patient Dashboard (`/user`), not the wizard.
4. **Atomic Submission:** The final step performs an atomic submission to prevent double-booking. No slots are held during the wizard navigation.

## Related Files
- **Wizard Views:** `src/modules/appointments/views/booking-view.tsx`
- **Route:** `src/app/booking/page.tsx` (planned standalone route)
- **Navigation Controls:** `src/components/ui/navbar.tsx`

## Wizard Steps
1. **Service Selection:** Choose a treatment (defines slot duration).
2. **Schedule Selection:** Pick a doctor (or "Any") and a time slot.
3. **Patient Details:** Book for self or create a dependent on-the-fly.
4. **Review & Submit:** Final validation, terms acceptance, and atomic submit.
