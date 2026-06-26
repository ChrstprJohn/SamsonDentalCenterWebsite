# Task: Secretary Reschedule Requests Page

Clinic secretaries need a dedicated page to review, approve, and reject patient reschedule requests (`status = 'RESCHEDULE_REQUESTED'`).

## 1. Documentation
- [x] **Create Business Plan Page**
  - Path: `c:\Users\picar\Desktop\samson-website\.CORE_DOCUMENTATION\SERVERLESS_ARCHI\1-BUSSINESS-PLAN\5-SECRETARY-PORTAL\3.5-RESCHEDULE-REQUESTS.md`
  - Detail layout, fields, and states (comparing original vs proposed values).

## 2. Secretary Portal UI Implementation
- [x] **Create Reschedule Requests Page**
  - Route: `/secretary/reschedule-requests`
  - Path: `src/app/(portals)/secretary/reschedule-requests/page.tsx`
  - Implement a 2-column layout matching `/secretary/pending`.
  - Fetch appointments with status `RESCHEDULE_REQUESTED`.
  - Left pane: list of reschedule requests.
  - Right pane: comparison of original appointment vs proposed reschedule details, patient reason, doctor schedule timeline.
  - Form action triggers: Approve/Reject buttons linking to `updateAppointmentStatusAction`.
- [x] **Update Sidebar Layout Navigation**
  - Path: `src/app/(portals)/secretary/layout.tsx`
  - Add menu item for "Reschedule Requests".
- [x] **Update Secretary Dashboard View**
  - Path: `src/modules/staff/views/secretary-dashboard-view.tsx`
  - Add metric badge showing the count of `RESCHEDULE_REQUESTED` appointments.
  - Add quick action button redirecting to `/secretary/reschedule-requests`.

## 3. Verification & Build
- [x] Ensure `pnpm test` runs and passes successfully.
- [x] Ensure `pnpm build` completes without compilation/TypeScript errors.
- [x] Run `graphify update .` to sync code updates.
