# Task: Patient Portal Navigation & Layout Refactor

## Overview
Separate the Patient Portal into distinct pages: Dashboard, My Appointments (tabbed: Upcoming, Pending, History), Notifications, and Account Settings (including Profile management).

---

## To-Do List

### Phase 1: Sidebar & Navigation Updates
- [ ] Refactor the User Portal Sidebar (`src/app/(portals)/user/layout.tsx`) to feature:
  - 📊 **My Dashboard** (`/user`)
  - 📅 **My Appointments** (`/user/appointments`)
  - 🔔 **Notifications** (`/user/notifications`)
  - ⚙️ **Account Settings** (`/user/settings`)

### Phase 2: Patient Dashboard Refactor
- [ ] Refactor `/user/page.tsx` and create a dedicated Dashboard View:
  - Welcome Banner ("Welcome back, [First Name]!").
  - **Next Appointment Widget**: Displays details of the single closest upcoming appointment (or a friendly "Book a slot" CTA).
  - **Recent Notifications Summary**: Displays the last 3 notifications with a "View All" button routing to `/user/notifications`.
  - **Quick Action Shortcuts**: Buttons for "New Booking", "Manage Appointments", "Settings".

### Phase 3: My Appointments Page & Tabs
- [ ] Create `/user/appointments/page.tsx`.
- [ ] Refactor the existing dashboard view into a tabbed `PatientAppointmentsView` containing:
  - **Upcoming Tab**: Active confirmed appointments (`APPROVED`, `RESCHEDULE_REQUESTED`, `CHECKED_IN`).
  - **Pending Requests Tab**: Awaiting review (`PENDING`).
  - **History Tab**: Terminal states (`COMPLETED`, `CANCELLED`, `REJECTED`, `DISPLACED`, `NO_SHOW`, `TREATMENT_RENDERED`).
- [ ] Support rescheduling requests and cancellations with modal confirmations.

### Phase 4: Notifications Hub Scaffold
- [ ] Create `/user/notifications/page.tsx` and `NotificationsView` component.
- [ ] Show notification items with custom status badges/icons (appointment, reminder, announcement).
- [ ] Implement filter tabs (All, Unread, Read) and mock actions (Mark as read, Delete, Mark all as read).

### Phase 5: Account Settings Consolidation
- [ ] Ensure the `/user/settings` route features both Profile Details (name, avatar, details) and Security/Preferences in a unified layout.

### Phase 6: Verification
- [ ] Verify page transitions, layouts, and responsiveness using the local development server.
