# 🛠️ Patient Booking Enhancement Tasks

- [x] Move the Booking page out of the User Portal layout (`src/app/(portals)/user/layout.tsx`) so it renders as a full standalone page (e.g., move to `src/app/booking/page.tsx` or `src/app/(portals)/booking/page.tsx`).
- [x] Update `src/components/ui/navbar.tsx`:
  - Update `handleBookNow` for signed-in users: navigate to the new standalone `/booking` route instead of `/user`.
  - Update `handleBookNow` for signed-out users: navigate to `/auth/login?redirect=/booking` instead of `/user`.
- [x] Verify the auth/login flow properly respects the `redirect` query parameter so users land on the booking page immediately after authenticating.
- [x] Ensure that a regular login (clicking "Login" without the `?redirect=/booking` param) continues to route users to the Patient Dashboard (`/user`) by default.
- [x] Update internal links (such as the reschedule button in `user-dashboard-view.tsx`) to point to the new standalone `/booking` route.
- [x] Remove the "Book Appointment" sidebar link from `src/app/(portals)/user/layout.tsx` (or update it to link to the new standalone route) to clean up the dashboard sidebar.

## Booking Empty States & Maintenance Mode
- [x] **Maintenance Mode:** Update `BookingPage` (`src/app/(portals)/booking/page.tsx`) to fetch `clinicConfig`. If `isBookingOpen` is `false`, render a closed view with the `maintenanceMessage`.
- [x] **Empty Services:** Update `ServiceStep` (`src/modules/appointments/components/booking/service-step.tsx`) to display a user-friendly message when there are no available services.
- [x] **Empty Slots:** Update `DateTimeStep` (`src/modules/appointments/components/booking/date-time-step.tsx`) to accept `availableSlots` as a prop and display a user-friendly message when there are no available time slots on the selected date.
