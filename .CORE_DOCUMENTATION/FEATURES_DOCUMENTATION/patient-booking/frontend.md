# Patient Booking Feature: Frontend Architecture

This document outlines the frontend engineering, components, validation logic, custom hooks, and testing guidelines for the Patient Booking flow.

---

## 📂 Frontend File Structure & Colocation

All frontend code belongs strictly inside `src/modules/appointments` to preserve clean modular boundaries:

```text
src/modules/appointments/
├── components/booking/
│   ├── add-dependent-modal.tsx    # Modal to add a new dependent
│   ├── booking-progress-tabs.tsx  # Tabs showing current wizard step
│   ├── booking-success-view.tsx   # View shown upon successful booking
│   ├── date-time-step.tsx         # Wizard Step 2
│   ├── existing-dependent-selector.tsx # Dependent selection
│   ├── patient-details-step.tsx   # Wizard Step 3
│   ├── review-step.tsx            # Wizard Step 4
│   └── service-step.tsx           # Wizard Step 1
├── views/
│   └── booking-view.tsx           # 🖥️ View orchestrator page shell ('use client')
└── hooks/booking/
    ├── use-booking-data.ts        # 🎣 Manages data fetching (availability)
    ├── use-booking-state.ts       # 🎣 Manages local wizard state
    ├── submit-booking-payload.mapper.ts # 🗺️ Maps state to DTO payload
    └── use-user-booking.ts        # 🎣 View controller hook orchestrating the above
```

---

## 🖥️ View Orchestration (`booking-view.tsx`)

The `BookingView` component acts as the orchestrator for the 4-step wizard. It conditionally renders the step components based on the `currentStep` state from `useUserBooking`.

### Wizard Steps
1. **Step 1 — Service Selection (`ServiceStep`)**: Fetches active services. Renders available treatments with mapped emojis, duration, and pricing.
2. **Step 2 — Schedule Selection (`DateTimeStep`)**: Displays a calendar for date selection and available time slots. Filters out taken slots based on the selected service duration.
3. **Step 3 — Patient Details (`PatientDetailsStep`)**: Allows users to select if the booking is for themselves or a dependent. Supports on-the-fly creation of new dependents.
4. **Step 4 — Review & Submit (`ReviewStep`)**: Summarizes selections. Requires explicit acceptance of Terms & Conditions and Privacy Policy.

---

## 🎣 View Controllers (`use-user-booking.ts` & others)

The complex state is broken down into specialized hooks:
1. **`useBookingState`**: Handles wizard step transitions (next, prev, goTo), selections (service, date, slot, patient type), and form inputs.
2. **`useBookingData`**: Handles fetching available dates and slots based on the selected service duration.
3. **`useUserBooking`**: Combines the above hooks, integrates the payload mapper (`submit-booking-payload.mapper.ts`), and triggers the `submitBookingAction` server action. Handles loading states and error toasts.
