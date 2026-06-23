# Secretary Portal: Check-In / Out Tracker

**Route**: `/secretary/check-in`

Tracks daily operations for active patient visits. Divided into two main queues:

---

## 1. Check-In Queue
Lists all `APPROVED` appointments scheduled for today.
- **Table Columns**: Patient Name, Scheduled Slot, Doctor, Service.
- **Mark Checked-In**: Sets status to `CHECKED_IN` and logs action in `appointment_status_history`.
- **Undo Check-In**: Reverts status to `APPROVED` if marked accidentally.

---

## 2. Check-Out Queue (Treatment Rendered)
Lists appointments marked as `CHECKED_IN` where the doctor has submitted clinical treatment details (moving the status to `TREATMENT_RENDERED` and creating a record in `invoices` with `DRAFT` status).

- **Checkout Action**: Opens the Checkout & Invoicing dialog:
  - **Review Draft Invoice**: Reviews service name, doctor, and base price (`price` from `services` table).
  - **Pricing & Discounts**: Enter standard price alterations or a discount percentage (0-100%).
  - **Select Payment Method**: Dropdown options: `CASH`, `CARD`, `HMO`.
  - **Complete Checkout**:
    - Updates `invoices` status to `FINALIZED`.
    - Updates appointment status to `COMPLETED`.
    - Inserts a ledger entry into `appointment_status_history`.
    - Triggers async outbox notification event.
