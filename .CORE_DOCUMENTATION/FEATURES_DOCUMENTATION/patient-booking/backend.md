# Patient Booking Feature: Backend Architecture

This document outlines the backend execution, server actions, repository queries, and database schema involved in the Patient Booking flow.

---

## 📂 Backend File Structure & Colocation

```text
src/modules/appointments/
├── actions/booking/
│   └── submit-booking.action.ts   # 🚀 Server action to process the booking
src/modules/services/
├── actions/management/
│   └── get-services.action.ts     # 🚀 Server action to load active services
├── repositories/management/
│   └── service.queries.ts         # 🗄️ Database queries for services
└── dtos/management/
    └── service-response.dto.ts    # 📝 Zod validation schema for services
```

---

## 🚀 Server Actions

### Service Data Fetching (`getServicesAction`)
- **File**: `src/modules/services/actions/management/get-services.action.ts`
- **Logic**: Used in the `/booking` server component to prefetch available treatments. Queries the `services` table in Supabase via `getServicesQuery`. Validates the resulting data against `serviceResponseSchema` to ensure data integrity before passing to the frontend.

### Booking Submission (`submitBookingAction`)
- **File**: `src/modules/appointments/actions/booking/submit-booking.action.ts`
- **Logic**: 
  1. Validates the incoming payload against a submission schema.
  2. Performs atomic validation on the selected slot. If the slot has been taken by another user during the wizard session, it throws an error.
  3. Optionally creates a new dependent if the user provided dependent details.
  4. Inserts the appointment record into the database.

---

## 🗄️ Database & Environment Requirements

The booking flow relies on the following database states:
- **`services` table**: Must contain active service records (`is_active: true`) to populate the initial wizard step. If empty, the frontend gracefully degrades to a "No Services Available" view.
- **Clinic Configuration**: Global settings (fetched via `getClinicConfigAction`) govern if the `isBookingOpen` flag is true, otherwise the booking portal displays a maintenance message.
