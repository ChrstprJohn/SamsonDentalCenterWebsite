# Secretary Portal: Dashboard

**Route**: `/secretary`

The dashboard provides a high-level operational overview of the day's clinic flow, highlighting items needing immediate attention.

## 1. Metrics Overview Grid
Quick informational counters displaying:
- **Arrivals Today**: Number of patients scheduled for check-in today.
- **Pending Requests**: Count of appointments in `PENDING` status.
- **New Inquiries**: Count of pending web form inquiries.
- **Checkouts Waiting**: Count of appointments in `TREATMENT_RENDERED` status awaiting billing finalization.

## 2. Today's Timeline
- Shows a list of approved appointments for the current day, ordered chronologically.
- Displays patient name, doctor, scheduled time, and status badge (`APPROVED`, `CHECKED_IN`, `COMPLETED`).

## 3. Quick Action Panel
Fast-access shortcuts:
- **Book Walk-In**: Direct link to `/secretary/book`.
- **Review Requests**: Direct link to `/secretary/pending`.
- **Convert Inquiries**: Direct link to `/secretary/inquiries`.
- **Run Checkout**: Direct link to `/secretary/check-in`.
