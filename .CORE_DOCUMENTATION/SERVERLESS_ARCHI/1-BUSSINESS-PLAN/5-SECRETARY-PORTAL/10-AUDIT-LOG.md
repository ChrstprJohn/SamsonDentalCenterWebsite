# Secretary Portal: Audit Log

**Route**: `/secretary/audits`

A read-only timeline ledger recording every operational state-change action performed by staff in the portal (corresponds to records in `audit_logs` and `appointment_status_history`).

---

## 1. Grid Table
- **Search Bar**: Match by staff actor or patient target name.
- **Action Type Filter**: Filter logs by specific categories (`APPROVE_BOOKING`, `CANCEL_BOOKING`, `REJECT_BOOKING`, `RESCHEDULE_BOOKING`, etc.).

---

## 2. Table Columns
- **Timestamp**: Time action was executed (`created_at`).
- **Actor**: Username/name of the Secretary or Administrator who made the action.
- **Action Type**: E.g., `APPROVE_BOOKING`, `CANCEL_BOOKING`.
- **Target**: Patient name / Invoice ID.
- **Reason/Remarks**: The mandatory justification reason entered during the confirmation dialog.
