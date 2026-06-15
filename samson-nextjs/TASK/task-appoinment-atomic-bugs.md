# Non-Atomic Database Transaction Bugs

This checklist tracks use-cases that perform multiple sequential database writes without a proper ACID transaction (e.g., via Supabase RPC). These use-cases are vulnerable to partial failures (where one step succeeds but a subsequent step fails, leaving the database in an inconsistent state).

---

## 1. Update Appointment Status
**File:** `src/modules/appointments/use-cases/status/update-appointment-status.use-case.ts`
**Description:** Used by clinic staff to approve, reject, or mark appointments as completed/no-show.
- [ ] Create an RPC (e.g., `update_appointment_status_transaction`) to wrap the following steps:
  - Update the appointment status
  - Insert a ledger entry into `appointment_status_history`
  - Increment the user's `cancel_count`, `no_show_count`, or `reschedule_count` (if applicable)
- [ ] Refactor use-case and actions to use the new atomic command.

## 2. Request Reschedule
**File:** `src/modules/appointments/use-cases/status/request-reschedule.use-case.ts`
**Description:** Used by patients when requesting a new time slot.
- [ ] Create an RPC (e.g., `request_reschedule_transaction`) to wrap the following steps:
  - Update the appointment status to `RESCHEDULE_REQUESTED`
  - Insert a ledger entry into `appointment_status_history`
  - Increment the `reschedule_count` on the user profile
- [ ] Refactor use-case and actions to use the new atomic command.

## 3. Submit Treatment
**File:** `src/modules/appointments/use-cases/treatment/submit-treatment.use-case.ts`
**Description:** Used by doctors to finalize an appointment and record treatments.
- [ ] Create an RPC (e.g., `submit_treatment_transaction`) to wrap the following steps:
  - Create the treatment records/notes for the appointment
  - Generate a pending invoice in the billing module
- [ ] Refactor use-case and actions to use the new atomic command.
