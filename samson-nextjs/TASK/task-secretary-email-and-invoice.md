# Task List: Secretary Email Logs and Invoice Management

Governed by Architecture (Modulith, aggregate subfolders, thin actions, functional queries/commands/use-cases, camelCase properties, one file per operation, co-located unit tests).

## 1. Backend: Domain Outbox Email Logs & Actions
- `[x]` Zod DTO contracts:
  - `[x]` Create `get-outbox-logs.dto.ts` + validation test `get-outbox-logs.dto.spec.ts`
  - `[x]` Create `outbox-log-response.dto.ts` + validation test `outbox-log-response.dto.spec.ts`
- `[x]` Functional CQRS Repository Queries:
  - `[x]` Create `outbox.queries.ts` + query test `outbox.queries.spec.ts` (For read operation shortcut)
- `[x]` Server Actions:
  - `[x]` Create `resend-email.action.ts` + test `resend-email.action.spec.ts` (Thin server action returning data/error envelope)

## 2. Backend: Domain Invoices Queries
- `[x]` Functional CQRS queries:
  - `[x]` Verify `invoice.queries.ts` + tests (Correctly fetches invoices with columns Patient, Doctor, Date, Payment Method, Base Price, Discount Applied, Final Price)

## 3. Frontend: Secretary Email Logs Portal (`/secretary/emails`)
- `[x]` Search & Filter Controls:
  - `[x]` Search Box: Matches recipient emails and subjects
  - `[x]` Default filter of "All", with status filters for "Sent", "Failed", or "Pending" delivery
  - `[x]` Show "No matching email logs." empty state when search/filter yields no results
- `[x]` Email Ledger Table Columns:
  - `[x]` Recipient: Target email address
  - `[x]` Subject: Email title
  - `[x]` Type: Notification event type (e.g. OTP, Appointment Confirmation, Cancellation alert)
  - `[x]` Date & Time: Exact timestamp
  - `[x]` Status: Sent / Failed / Pending delivery with mapped badge variants
- `[x]` Actions:
  - `[x]` Failed emails show a "Resend" action button next to status badge
  - `[x]` Connect "Resend" action button to trigger Server Action `resendEmailAction`
- `[x]` Detail View:
  - `[x]` Clicking log entry opens detail view showing plain-text/HTML body of sent email

## 4. Frontend: Secretary Invoice Management Portal (`/secretary/invoices`)
- `[x]` Filter Controls:
  - `[x]` Search by patient name, service name, or doctor name
  - `[x]` Payment method filter dropdown (All, Cash, Card, HMO)
- `[x]` Invoice Ledger Table:
  - `[x]` Displays finalized invoices from checkouts where status is `FINALIZED` or `PAID`
  - `[x]` Columns: Patient Name, Doctor, Date, Payment Method, Final Price
- `[x]` Detail Receipt & Actions:
  - `[x]` View Receipt details pane showing itemized breakdown (Treatment, Dentist, Date, Base Price, Discount Applied, Total Amount Paid)
  - `[x]` Print Receipt: Prints clean layout using `@media print` CSS rules hiding other UI controls
  - `[x]` Download PDF Receipt action

## Verification and Bug Fixes Done
- Fixed `use-secretary-invoice-management.ts` type error by passing `page: 1, limit: 100` to `getInvoicesAction`.
- Fixed `outbox-log-response.dto.ts` zod schema `z.record(z.any())` compiler error to `z.record(z.string(), z.any())`.
- Fixed email empty state matching issue: outbox payload uses `guestEmail` key for guest/converted inquiries. Updated `outbox.queries.ts` search filter and `use-secretary-email-log.ts` recipient mapper to check both `email` and `guestEmail` payload keys.
- Verified empty state message `"No matching email logs."` is in `secretary-email-log-view.tsx` and documented in this task checklist.
