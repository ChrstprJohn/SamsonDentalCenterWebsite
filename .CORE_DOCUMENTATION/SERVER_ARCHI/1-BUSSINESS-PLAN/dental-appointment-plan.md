# Dental Appointment Website Plan

## Goal
Build a dental appointment website with a public landing experience and role-based private portals for users, secretaries, and admins. The first focus is the business flow, booking logic, and account access flow. System design decisions can be finalized later.

## Product Scope

### Public Site
- One landing page with these main sections:
	- Hero
	- Services
	- About Us
	- Gallery
	- Contact
- The nav should stay minimal: logo, section links, login, and book now.
- The fixed nav links should scroll to Hero, Services, About Us, Gallery, and Contact.
- The services section can still use service cards that open service details.
- If a visitor tries to book without an account, they are prompted to log in or create an account.
- Terms of Service and Privacy Policy live in the footer and open separate pages instead of being placed on the landing page.

### Account Access
- Sign up and login for users.
- Registration should collect only the minimum fields needed for booking and account access.
- Current identity fields should be kept as:
	- Email (required for account creation and OTP verification)
	- First name
	- Last name
	- Middle name
	- Suffix
	- Contact number
- OTP verification sent to email for confirmation.
- Terms of Service and Privacy Policy must be checked during booking flow, and later during sign in and sign up flow.
- Account creation must be confirmed before booking access is enabled.

### User Portal
The public user portal should include:
- Profile (with avatar field for customization, editable but optional)
- Dashboard
- Upcoming appointments
- Appointment history
- My requests
- Account settings
- Notifications (in-app and email; SMS can be added later for booking decisions)
- If logged in, the main navigation should display a notification indicator/bell icon
- Notifications section should show appointment status changes, reminders, and messages from the clinic

### Private Portals
There will be two private areas:
- Admin portal
- Secretary portal

### Secretary Portal
The secretary portal should include:
- Profile (view and edit personal information)
- Dashboard
- Pending appointments
- Upcoming appointments
- Appointment history
- Display section for grouped booking requests
- Check-in/Check-out tracking
- Invoice management (view invoices generated after appointment completion)
- Audit page
- Email page to view sent emails
- The dashboard should prioritize pending requests and upcoming appointments.
- All actions (approve, reject, cancel, reschedule, mark completed) must be confirmed with a confirmation popup before execution.

### Admin Portal
The admin portal should include:
- Dashboard
- Manage services
- Manage doctors
- Manage users
- Manage secretaries
- Clinic config for shared system constants and settings (including:
	- Booking open/closed status with maintenance message
	- Max reschedules per appointment (default: 1)
	- Clinic name, address, phone, email
	- Operating hours
	- Appointment slot duration
	- Other clinic-wide settings that can be modified without deploying code)
- Audit page
- The dashboard should prioritize upcoming appointments and pending requests.

## Roles

### User
- Browse services.
- Create an account or log in.
- Book appointments.
- View upcoming appointments and history.
- Manage profile and account settings (including optional avatar).
- Cancel requested appointments (pending status).
- Cancel approved appointments with a reason.
- Reschedule approved appointments once by default (unless admin changes the clinic limit).
- View appointment notifications and status updates.
- Manage email and notification preferences.

### Secretary
- Manage profile (view and edit personal information).
- Review pending appointments and grouped booking requests.
- Approve or reject appointment requests with custom or predefined reasons (confirmation popup required).
- View appointment notes and history.
- View upcoming appointments and appointment history.
- Mark appointments with check-in/check-out status.
- View and manage invoices (invoices are auto-generated after appointment time passes or when marked Completed).
- Cancel appointments with a reason (confirmation popup required).
- Reschedule appointments with a reason (confirmation popup required).
- Work with doctor schedules and resolve scheduling conflicts.
- View audit logs of actions taken.

### Admin
- Manage services (create, edit, delete).
- Manage doctors (create, edit, delete, assign availability).
- Manage users (view, edit, deactivate accounts).
- Manage secretaries (create, edit, deactivate accounts, assign to clinics).
- View and configure clinic settings (clinic info, operating hours, booking status, reschedule limits, etc.).
- View comprehensive dashboard data and analytics.
- View audit logs across all actions.

## Implemented Booking Flow Architecture

The booking system uses a single consolidated User Booking Wizard. All prospective bookers are directed through the mandatory user login/registration flow first before booking.

### 1. User Booking Wizard
The User Booking Wizard is tailored for authenticated patients, letting them book appointments for themselves or seamlessly manage and book slots for family members (dependents).

- **React Architecture:** Implemented in `UserBookingWizard.jsx` consuming the `useUserBooking.js` custom hook.
- **Wizard Steps (Breadcrumbs: Service ➔ Schedule ➔ Details ➔ Review):**
  1. **Service Selection (`UserServiceStep`):** Allows selecting any active General or Specialized clinic service.
  2. **Schedule Selection (`DateTimeStep`):** Fetches dynamic calendar availability. Upon selecting a slot, secures a server-side hold tied to the persistent user session.
  3. **Patient Details (`UserOtherInfoStep`):** The patient selects whether the booking is for "Self" or "Someone Else".
     - **Book for Self:** The `booked_for_name_parts` payload is sent as `null`, prompting the backend to snapshot the authenticated user's profile details.
     - **Book for Someone Else (Dependents):** The patient can select an existing family member/dependent or dynamically create a new dependent profile on-the-fly (capturing first, middle, last, suffix, birthday, relationship, sex, and optional note).
  4. **Review & Submit (`UserReviewStep`):** Displays detailed summaries and triggers `validateAbuse()` calling `/appointments/user-validate` to check for overlapping schedules, active appointment caps, daily service quotas, and dependent thresholds.
  5. **Atomic Wizard Submission:** Submits the consolidated payload to `/appointments/submit-wizard` which atomically registers the appointment under the chosen patient profile, cleans up the slot hold on the server, and triggers async staff notifications.

### 2. Unified Slot Hold & Session Recovery System
To protect clinic inventory and ensure slot atomicity, the wizard integrates with a centralized session-based slot hold system.

- **Atomic Reservation:** Selected slots are reserved in the database with a 10-minute TTL (Time-to-Live). Unique database constraints prevent two users from holding the same slot simultaneously.
- **Real-Time Visual Countdown:** Once a slot hold is secured, a global countdown timer (e.g. `9:59`) and an animated progress bar are rendered across all wizard steps. If the time remaining reaches 2 minutes (`120s`), the system triggers a warning toast. The progress bar changes color from amber to red when less than 1 minute remains.
- **Session Recovery Interceptor:** The wizard leverages a `sessionId` (persisted in `localStorage` for users). If a user refreshes, closes the tab, or reloads during a booking, the wizard detects the active hold and displays a beautiful **"Resume Booking?" Bottom-Sheet Modal** showing their reserved slot and remaining hold time, allowing them to continue their checkout seamlessly.
- **Graceful Expiration & Reselection:** If the 10-minute hold expires during the wizard checkout, the wizard shows a custom **"Need More Time?" Expiration Modal**, automatically releases the hold on the server, clears the form's date/time selections, and gracefully redirects the user back to the Schedule step while preserving all other entered profile/personal details, facilitating a fast and frictionless reselection.
- **Exit & Rollback Cleanup:** Clicking the "Exit" button in the wizard header launches a **"Discard Booking?" Confirmation Modal**, warning the user that their slot will be released. Confirming the exit calls the server-side hold release, clears all local storage state, and rotates the user's `sessionId` to maintain inventory cleanliness.

## Appointment Status Constants
- Pending: Submitted request, awaiting staff review.
- Approved: Confirmed by clinic with an approval reason and synchronized to the doctor calendar.
- Rejected: Declined by staff with a rejection reason.
- Displaced: The requested slot is no longer valid because of a blocked date, time, service, doctor unavailability, or similar inventory change.
- Rescheduled: An approved appointment moved to a new time and requires a reschedule reason.
- Cancelled: An approved appointment was cancelled by the user, secretary, or admin and requires a cancel reason.
- Completed: Patient attended and the system unlocks invoicing and dental history updates.
- Hold / Expired: Internal backend state used during the 10-minute rolling reservation window.

### Request Notes and Reasons
- Every appointment can store a user note entered during booking.
- The note is specific to that appointment, so users can describe their specific needs.
- Approve actions should open a popup with a common approval reason or a custom approval reason.
- Reject actions should open a popup with a common rejection reason or a custom rejection reason.
- Displaced actions should store the reason that caused the displacement, such as blocked date, blocked time, removed service, or doctor unavailable.
- Cancel actions should also require a reason, regardless of whether the action is taken by the user, secretary, or admin.
- Reschedule actions should require a reason, including who initiated the change and why the new time is needed.
- Reschedule should be allowed only once per request for now, and that limit should later be adjustable from admin clinic config.
- User cancel, no-show, and reschedule history should be retained for future approval review.

### Action Rules
- Pending requests may be approved, rejected, or displaced.
- Approved requests may later be rescheduled or cancelled.
- Users may cancel pending requests at any time.
- Users may cancel approved appointments with a reason.
- Users may reschedule approved appointments once by default unless the admin changes the clinic limit.
- Displaced requests should force the user back into availability selection if a new slot is still possible.
- Rescheduled requests keep the original request history and record the new time as part of the same booking group.
- Cancelled requests should free the slot back into availability if the appointment was previously active.

## Booking Availability Rules
- Public availability must exclude approved, pending, and active lock states for the selected date.
- Availability can be cached briefly on the client for faster rendering, but it must always be revalidated by the server before a hold is created.
- A slot hold must be unique per time slot and enforced atomically so stale UI state cannot create double holds.
- Slot locks are session-aware and expire automatically if the booking is abandoned.
- Slot holds are temporary booking states, and they should not appear in the public time picker while active.
- Pending appointments should also remain hidden from the public time picker until they are approved or rejected.
- Rejected, cancelled, and expired holds should return inventory to the public availability pool.
- If online booking is turned off or the clinic is in maintenance mode, the booking page must show a closed page with a message and no booking actions.
- Admins should be able to toggle booking open or closed from clinic config, including a maintenance message for the public booking page.

## Appointment Status Flow
- Pending
- Approved
- Rejected
- Displaced
- Cancelled
- Completed
- Hold / Expired

## Navigation Plan
The landing page navigation should scroll to page sections. For now, the exact section list is still to be decided.

## Footer
The footer should include standard pages and links:
- **Pages**: Terms of Service, Privacy Policy
- **Contact**: Clinic contact information (address, phone, email)
- **Hours**: Operating hours
- **Social Links**: Links to clinic social media (if applicable)
- **Legal**: Copyright notice
- Footer links should open in separate pages/modals rather than inline content
- Footer should be consistent across all public and private portal pages

## Technical Direction
- Use a monorepo structure.
- Use Turbo for workspace orchestration.
- Keep system architecture decisions flexible for now.
- Focus first on business flow and feature planning.

## MVP Priority
1. Landing page and service presentation.
2. Authentication with OTP email verification.
3. Implemented User booking wizard with dynamic availability and slot holds.
4. Pending appointment workflow.
5. Secretary and admin approval flow with grouped row visibility.
6. Admin management for services, doctors, users, and secretaries.
7. User dashboard, notifications, and appointment tracking.



## Current Decisions and Gaps
### Decisions So Far
- Services will have variable durations (e.g., 30 mins, 1 hour), meaning the booking engine must find contiguous blocks of free time.
- Doctors will have custom schedules (working hours, breaks, days off) rather than standard clinic-wide hours.
- Invoicing is strictly for formal digital record-keeping because the clinic already has a separate billing system. There is no online payment gateway.
- Pending requests can be cancelled by the user at any time while they remain pending.
- Pending requests can be approved or rejected by the secretary and admin.
- Approved appointments can later be cancelled or rescheduled by staff.
- Secretaries should not edit approved bookings directly; they can only approve, reject, cancel, or reschedule based on their role rules.
- Cancel and reschedule actions should require a reason.
- The booking maintenance state should show a closed page with a reason message.
- The plan should be split into three frozen parts: user booking UI, secretary review flow, and admin clinic settings.
- User rescheduling should be allowed once by default, with the limit later made configurable from admin clinic settings.
- Admin and staff rescheduling can stay unlimited if the clinic chooses to allow it.
- Booking closed mode should show a closed page with a message and no booking actions.
- User cancellations, no-shows, and reschedules should be recorded so the approval page can use them later as reliability signals.
- Reliability should be tracked with simple counters for cancel, no-show, and reschedule history.

### Frozen Specification Gaps

#### 1. Booking Holds & Session Management
- Holds are stored in the database with a TTL (time-to-live) of 10 minutes.
- A background job or lazy cleanup purges expired holds and frees inventory.
- Each user can have only one active booking session at a time; starting a new booking cancels any previous session.
- Holds are internal only and invisible to admins/secretaries in dashboards.
- Atomicity: slot claims use a database transaction checking (hold exists + appointment count = 0), then insert.
- If a slot claim fails due to another user claiming it first, the frontend receives an error and must refresh availability for reselection.

#### 2. Notifications for Grouped Bookings
- Notifications fire per-appointment row as soon as each row is acted upon (approved/rejected/etc).
- However, notifications are queued and sent asynchronously after all secretary decisions on the group are finalized.
- Each notification is personalized per family member (e.g., "Your son Timmy's appointment approved for 2:00 PM").
- Batch finalization: secretary approves some rows, rejects others, then clicks a "finalize group" action; notifications are sent after that.

#### 3. Availability Caching & Stale Data
- Availability is cached on the client side for 2-5 minutes.
- Cached times are revalidated on the backend before each slot claim attempt.
- When a user clicks a stale or unavailable slot, the backend rejects the claim with an error.
- Frontend must catch the error, refresh availability, and force the user to reselect.
- Cached availability is only refreshed on-demand (when a slot claim fails), not eagerly on every doctor/service/date change.

#### 4. Secretary Workflow Conflicts & Audit
- Optimistic locking: if two secretaries attempt to act on the same appointment simultaneously, the first one succeeds and the second receives a conflict error.
- The secretary dashboard always fetches fresh data (no caching) to prevent confusion.
- Audit logs are lightweight: log only final decisions (approve/reject/cancel/reschedule), not intermediate changes.
- Audit entries include: actor (secretary/admin), timestamp, action type, reason, and target appointment.

#### 5. Reschedule Limits & Tracking
- Reschedule limits are tracked per appointment: `{ rescheduleCount, maxReschedules: 1 }`.
- Users are blocked from rescheduling after they hit the limit (1 reschedule by default).
- Blocked appointments show a UI indicator in the user's portal; clicking it displays a message prompting the user to contact staff.
- The limit does not reset for the lifetime of the appointment (once rescheduled, cannot reschedule again by user).
- Admins/staff retain unlimited ability to reschedule on behalf of users.

#### 6. No-Show, Invoice Generation & Doctor Calendar
- No-shows are auto-detected: when the appointment time passes without a completed status, the system marks it as no-show (requires a check-in system or time-based trigger).
- Invoicing is triggered in two ways:
  - Automatically when the appointment time passes (invoice is generated and marked as draft).
  - Or manually when a secretary/admin clicks "Mark Completed"; this also generates/finalizes the invoice.
  - Draft invoices have a "Checkout" button so additional services can be added before final payment.
  - Secretaries and admins can view invoices in the invoice management section.
- Doctor calendar conflicts are prevented at the database level with a unique constraint on (doctor_id, date, time_slot).
- If a double-booking somehow occurs, the database enforces it and an admin must manually resolve the conflict.

### Still To Confirm
- None; all gaps are frozen.

## Footer Pages
- Terms of Service
- Privacy Policy
- Other legal or policy pages can be added here later if needed.

## Open Questions
- None for the current booking flow.

## Next Step
Once the business flow is confirmed, move into system design, data model design, and route/module planning.