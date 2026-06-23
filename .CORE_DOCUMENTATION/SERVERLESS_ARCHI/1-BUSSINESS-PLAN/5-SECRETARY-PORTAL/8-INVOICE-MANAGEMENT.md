# Secretary Portal: Invoice Management

**Route**: `/secretary/invoices`

Contains structured records of all completed transactions for invoice accounting, insurance claims, and billing history.

---

## 1. Invoice Ledger Table
Lists finalized invoices from completed checkouts (matches against `invoices` table where `status` is `FINALIZED` or `PAID`).

### Columns
- **Invoice ID**: Database UUID.
- **Patient**: Name of the patient (patient name vs dependent vs guest).
- **Doctor**: Dentist who rendered treatment.
- **Date**: Date checkout was finalized (`updated_at` timestamp).
- **Payment Method**: `CASH`, `CARD`, or `HMO`.
- **Base Price**: Original service cost.
- **Discount Applied**: Numeric percentage/value deducted.
- **Final Price**: Total amount charged (`amount` column).

---

## 2. Actions
- **View Receipt**: Opens a modal showing itemized breakdown (service costs, discount applied, payment method, metadata).
- **Print / PDF Receipt**: Generates print-friendly clean layouts of finalized transactions.
