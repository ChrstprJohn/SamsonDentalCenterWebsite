# 🚨 Appointments Module Architecture Audit & Fixes

## 1. God Component Violations (>150 Lines Rule)
The frontend architecture explicitly states that no component should exceed 150 lines to prevent God Components.
- [x] **`user-dashboard-view.tsx` (337 lines):** Break this down into smaller atomic sub-components (e.g., `upcoming-appointments.tsx`, `appointment-history.tsx`, `cancel-modal.tsx`).
- [x] **`booking-view.tsx` (253 lines):** Extract the success view and progress tabs into separate sub-components.
- [x] **`patient-details-step.tsx` (~300 lines):** Break this down into sub-components (e.g., `existing-dependent-selector.tsx`, `new-dependent-form.tsx`).

## 2. Mock Data & Missing Backend Connections
The current booking and dashboard flows are not connected to the database. They rely entirely on mock data and simulated timeouts.
- [x] **Dashboard Hydration:** Remove `INITIAL_APPOINTMENTS` in `user-dashboard-view.tsx`. Create an RSC page to fetch real appointments via the `get-patient-appointments` action and pass them to the view.
- [x] **Booking Submission:** Connect the "Submit Booking" button in `booking-view.tsx` to the `submitBookingAction` server action instead of using a `setTimeout` mock.
- [x] **Live Schedule Sync:** Remove `MOCK_SLOTS` from `date-time-step.tsx`. Connect the UI to the `get-availability` server action to fetch real doctor schedules and available slots from the database.

## 3. State Management & Hooks Extraction
- [x] **Dashboard Modals State:** The cancellation and reschedule modal logic is currently inline inside `user-dashboard-view.tsx`. Extract this into a dedicated `use-user-dashboard.ts` hook following the "Strict Logical Extraction" rule.
- [x] **Booking View Orchestration:** Remove inline logic from `booking-view.tsx` and move route checking, error handling, and `handleSubmit` into `use-user-booking.ts`.
- [x] **God Hook Decomposition (`use-user-booking.ts`):** Break the ~300 line orchestration hook into smaller use-case segments:
    - `use-booking-data.ts`: API fetching for available slots/dates.
    - `use-booking-state.ts`: Manage the wizard progression and selection state.
    - `submit-booking-payload.mapper.ts`: Delegate payload construction to a pure helper function instead of having it inline in the hook.
