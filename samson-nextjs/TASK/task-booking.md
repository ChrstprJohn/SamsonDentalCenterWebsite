# 🛠️ Patient Booking Enhancement Tasks

- [x] Move the Booking page out of the User Portal layout (`src/app/(portals)/user/layout.tsx`) so it renders as a full standalone page (e.g., move to `src/app/booking/page.tsx` or `src/app/(portals)/booking/page.tsx`).
- [x] Update `src/components/ui/navbar.tsx`:
  - Update `handleBookNow` for signed-in users: navigate to the new standalone `/booking` route instead of `/user`.
  - Update `handleBookNow` for signed-out users: navigate to `/auth/login?redirect=/booking` instead of `/user`.
- [x] Verify the auth/login flow properly respects the `redirect` query parameter so users land on the booking page immediately after authenticating.
- [x] Ensure that a regular login (clicking "Login" without the `?redirect=/booking` param) continues to route users to the Patient Dashboard (`/user`) by default.
- [x] Update internal links (such as the reschedule button in `user-dashboard-view.tsx`) to point to the new standalone `/booking` route.
- [x] Remove the "Book Appointment" sidebar link from `src/app/(portals)/user/layout.tsx` (or update it to link to the new standalone route) to clean up the dashboard sidebar.
