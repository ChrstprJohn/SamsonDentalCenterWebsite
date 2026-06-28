# Appointment Statuses & Ledger Implementation Tasks

This document tracks the tasks required to implement the "Append-Only Pragmatic Ledger" pattern for appointment statuses, ensuring banking-level data integrity for state transitions.

## Phase 1: Database Schema Updates (Completed)
- [x] Add `appointment_status_history` table to `schema.sql`.
- [x] Add `reschedule_count INT DEFAULT 0 NOT NULL` to `users` table for credibility tracking.
- [x] Update `submit_booking_transaction` RPC to insert the genesis `PENDING` ledger entry atomically.
- [x] Create migration `20260613000000_appointment_ledger.sql`.

## Phase 2: Architectural Refactoring (Completed)
Addressed violations of the `1-ARCHITECTURE.md` (One File, One Process) pattern:
- [x] **Split Use-Cases**: Demolished `update-appointment-status.use-case.ts` into isolated `cancel-appointment`, `request-reschedule`, and staff-only `update-appointment-status` use cases.
- [x] **Split Repositories**: Removed `appointment-status.commands.ts`. Extracted into strictly isolated `get-appointment-by-id.query.ts`, `update-status.command.ts`, `insert-ledger-entry.command.ts`, and `increment-user-credibility-metric.command.ts`.
- [x] **Split DTOs**: Extracted patient-side actions (`cancel-appointment.dto.ts`, `request-reschedule.dto.ts`) from the generic staff DTO to prevent monolithic schemas.
- [x] Wired segregated files into `actions/status/` properly and validated TypeScript build.

## Phase 3: "Hold and Swap" Reschedule Pattern (Completed)
Implement the Hold and Swap architecture so patients can safely request reschedules without immediately losing their secured slot.

- [x] **Database Alterations (Appointments Table)**
  - Add nullable columns: `proposed_date` (DATE), `proposed_start_time` (TIMESTAMPTZ), `proposed_end_time` (TIMESTAMPTZ), and `proposed_doctor_id` (UUID).
- [x] **Update DTOs & Use-Cases**
  - Update `request-reschedule.dto.ts` to accept the new requested time slot payload from the user.
  - Update `request-reschedule.use-case.ts` and `update-status.command.ts` to write the new requested time slot into the `proposed_*` columns.
- [x] **Staff Approval/Rejection Logic**
  - **Approve**: Secretary accepts. System copies `proposed_*` values into the main calendar slots (`date`, `start_time`, `end_time`, `doctor_id`), wipes the `proposed_*` columns to `NULL`, and sets status to `APPROVED`.
  - **Reject**: Secretary denies. System wipes the `proposed_*` columns to `NULL` and restores the appointment status to `APPROVED` (locking in the original slot).
- [x] **Patient Portal UI Updates**
  - Build the "Comparison Split View" so users can see "Secured Current Slot" vs "Requested New Slot".

