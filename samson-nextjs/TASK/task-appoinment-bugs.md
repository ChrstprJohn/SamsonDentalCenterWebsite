# Appointment Module Bugfix & Enhancement Checklist

This checklist tracks the identified bugs and enhancements in the user portal appointment flow, aligning with Samson Dental architecture guidelines (functional CQRS repository closures, server actions, client-side state hooks, and database constraints).

---

## 1. Predefined & Custom Cancellation Reasons
- [x] **UI Update in Cancel Modal**:
  - Update `cancel-appointment-modal.tsx` to replace the single text area with a hybrid input system:
    - Predefined common options (e.g., *Schedule Conflict*, *Personal Emergency*, *Health Issues*).
    - An `"Other (Custom)"` option.
    - A conditional text input/textarea field that appears only when `"Other (Custom)"` is selected.
  - [x] **Payload Mapping**:
    - Ensure validation correctly passes the selected/entered reason to the cancel action schema.

## 2. Stale UI State and Re-cancellation Prevention (Details/Dashboard Views)
- [x] **Instant Client State Update**:
  - Fix state lagging when cancelling from the appointment details view or dashboard summary cards.
  - When the cancel action resolves successfully:
    - Update the local state in `useUserDashboard` or detail view states immediately to change status to `CANCELLED`.
    - Ensure the "Cancel Reservation" action button is instantly disabled or hidden once the appointment is cancelled, preventing double clicks and re-submission errors.
- [x] **Router Refresh / Fetching**:
  - Trigger `router.refresh()` or re-fetch active details to update local caches and prevent stale UI displays.

## 3. Status History Ledger Integration (Audit Trail)
- [x] **SQL Database Ledger Updates**:
  - Review status change execution paths (`cancel-appointment.use-case`, `request-reschedule.use-case`, database procedures).
  - Currently, `appointment_status_history` ledger insertions only happen on the initial `PENDING` creation transaction (via RPC).
  - [x] **Add Status History logging** during subsequent status changes:
    - Ensure `cancel-appointment.use-case` or command inserts a row into `appointment_status_history` logging the previous status, new status (`CANCELLED`), who made the change (the user/patient UUID), and the reason.
    - Ensure rescheduling triggers proper history tracking in `appointment_status_history` for `RESCHEDULE_REQUESTED`.
- [x] **Audit Trail Display**:
  - Verify that if staff or admin views history, the timeline correctly maps all transitions.
  - Added new visual `StatusHistoryTimeline` component under the clinical cards on the appointment details view.

## 4. Conflicting UI Banner logic for Appointments
- [x] **Consolidated Banner Rendering**:
  - Fix conditional banners in `status-reason-banners.tsx` where conflicting messages can appear (e.g. showing "Reschedule Request Approved" banner even after the appointment is subsequentally cancelled).
  - Make sure that final statuses (like `CANCELLED`, `COMPLETED`, `REJECTED`) suppress previous pending or approved rescheduling alert banners in `reschedule-details.tsx`.

## 5. Rescheduling Flow Adjustments
- [x] **Disable Redirection to Booking Page**:
  - Temporarily disable the active redirect path in `handleRescheduleClick` (do not route users to `/booking?reschedule=true` for now).
  - [x] **Preserve Rescheduling Blocked Modal**:
    - Keep the warning/blocking dialog logic if the user exceeds the maximum allowed reschedule count (`maxReschedules` from clinic config).

## 6. Audit & Edge Case Check for Booking Funnel
- [x] **Cross-Month Calendar Slots Fetching**:
  - Update `useBookingData` to fetch calendar availability for both the current month and the subsequent month concurrently to allow cross-month selection.
- [x] **Date Picker Filtering**:
  - Filter calendar dates using clinic config parameters `allowSameDayBooking` (start from today vs. tomorrow) and `calendarRenderDays` (maximum days in advance).
- [x] **Past Time Slots Exclusion**:
  - Filter out time slots whose start time has already passed when viewing slots for today's date.
- [x] **Dependent Validation**:
  - Verify that wizard step validation prevents proceeding if a user selects "My Family" but has not chosen an existing dependent or entered new dependent details.

## 7. Atomic Cancellation (Prevent Multiple Cancellations)
- [x] **Fix Non-Atomic Cancellation**:
  - Ensure the database or use-case code prevents an already-cancelled appointment from being cancelled again. Currently, cancelling an already cancelled appointment goes through or throws "Cannot cancel appointment from terminal status: CANCELLED" but doesn't correctly block the state change atomically. Use a guard like `WHERE status != 'CANCELLED'` during the state update.
- [x] **Full Transaction Atomicity (RPC)**:
  - Created a Postgres RPC `cancel_appointment_transaction` to wrap the appointment status update, ledger entry insertion, and user cancel count increment into a single ACID transaction. This prevents partial failures where an appointment is cancelled but the ledger history is missing due to subsequent errors.
