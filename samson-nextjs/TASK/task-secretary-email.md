# Task: Secretary and Patient Portal Email Transactions

## Already Done (Email Sent)
- [x] **APPOINTMENT_BOOKED** (Patient self-books online) -> Sends `appointment_request_received` email.
- [x] **APPOINTMENT_CONVERTED_FROM_INQUIRY** (Secretary approves guest inquiry) -> Sends `appointment_confirmed` email.
- [x] **APPOINTMENT_MANUALLY_BOOKED_GUEST** (Secretary books guest manually) -> Sends confirmation email.
- [x] **APPOINTMENT_MANUALLY_BOOKED_PATIENT** (Secretary books registered patient manually) -> Sends confirmation email.

## Missing (Email Can Be Added Later)

### 1. General Appointment Approvals / Rejections
- [ ] **Approve Pending Appointment** (Pending -> Approved) -> Send confirmation email with booking details.
- [ ] **Reject Pending Appointment** (Pending -> Rejected) -> Send email notifying rejection and reason.

### 2. Cancellations
- [ ] **Cancel Appointment by Patient** (Pending/Approved -> Cancelled) -> Send cancellation confirmation to patient & alert email to secretary.
- [ ] **Cancel Appointment by Staff** (Approved -> Cancelled) -> Send cancellation email to patient with reason.

### 3. Patient Reschedule Requests
- [ ] **Submit Reschedule Request** (Approved -> Reschedule Requested) -> Send receipt email to patient ("reschedule pending review") & alert to secretary.
- [ ] **Approve Reschedule Request** (Reschedule Requested -> Approved with new slot) -> Send confirmation email with new slot details.
- [ ] **Reject Reschedule Request** (Reschedule Requested -> Approved with original slot) -> Send email notifying original slot is retained.

### 4. Staff Reschedule Actions
- [ ] **Manual Reschedule by Secretary/Admin** (Approved -> Rescheduled with new slot) -> Send notification to patient with new slot details & reason.

### 5. Displacement & Attendance
- [ ] **Displace Appointment** (Approved -> Displaced/Cancelled due to doctor schedule changes) -> Send urgent warning email to patient to re-book.
