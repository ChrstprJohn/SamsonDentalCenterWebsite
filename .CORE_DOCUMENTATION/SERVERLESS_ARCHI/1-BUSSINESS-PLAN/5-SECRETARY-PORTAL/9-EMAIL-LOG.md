# Secretary Portal: Email Log

**Route**: `/secretary/emails`

A read-only lookup ledger of all email notifications, OTP confirmation codes, status change updates, and billing summaries sent out by the system (corresponds to processed email events in the `outbox` or email tracker logs).

---

## 1. Search & Filter Controls
- **Search Box**: Matches recipient emails.
- **Status Filter**: Sent, Failed, or Pending delivery.

---

## 2. Table Columns
- **Recipient**: Target email address.
- **Subject**: Email title.
- **Type**: Notification type (OTP, Appointment Confirmation, Cancellation alert).
- **Date & Time**: Exact timestamp.
- **Status**: Sent / Error badge.

---

## 3. Detail View
- Clicking a log entry opens a dialog showing the plain-text/HTML body of the sent email for diagnostic verification.
