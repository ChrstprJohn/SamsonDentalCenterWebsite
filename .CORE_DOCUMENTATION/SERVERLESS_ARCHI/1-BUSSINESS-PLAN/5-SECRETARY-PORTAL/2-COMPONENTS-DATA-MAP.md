# Secretary Portal Component & Data Map Blueprint

This document maps all the UI components, sub-components, modals, and actions in the **Secretary Portal** workspace to their exact data requirements and state behaviors.

---

## 📂 Navigation & Layout Frame
All secretary features are loaded inside `/secretary` using the shared sidebar layout shell.

---

## 🏠 Page: Secretary Dashboard (`/secretary`)
Coordinates clinic schedules, batch family bookings, check-in patients, and finalizes transactions.

```
┌────────────────────────────────────────────────────────┐
│ Header: "Secretary Dashboard"                          │
│ Subtitle: "Coordinate clinic schedules..."             │
├───────────────────────────┬────────────────────────────┤
│                           │                            │
│ PendingBookingQueue       │ CheckoutQueue              │
│ (Individual & Family)     │ (Draft Invoices)           │
│                           │                            │
│                           ├────────────────────────────┤
│ CheckInTracker            │ PatientNotifications       │
│ (Upcoming / Checked-In)   │ (Email Search Logs)        │
│                           │                            │
├───────────────────────────┴────────────────────────────┤
│                    AuditTimeline                       │
└────────────────────────────────────────────────────────┘
```

---

## 📋 Components Detail & Data Map

### 1. `PendingBookingQueue`
- **Purpose**: Prioritizes reviewing booking requests awaiting staff decision.
- **Data Rendered**:
  - `pendingQueue`: `PendingBooking[]` (Grouped into Family Groups vs. Individual Bookings).
- **Actions**:
  - **"Approve Batched (N)" Button**: Displays at the top of the queue when one or more row checkboxes are selected. Triggers `BookingApprovalModal` for all selected IDs.

#### A. Sub-Component: `FamilyGroupRow`
- **Purpose**: Containers for dependents/family members booking together on the same day.
- **Data Rendered**:
  - `famId`: Group ID.
  - `members`: `PendingBooking[]` inside the family unit.
    - Checkbox selection (`selectedPendingIds`)
    - Patient Name (`patientName`) and Relationship (`relationship`)
    - Dental Treatment Name (`serviceName`)
    - Requested Date and Time (`date` at `time`)
- **Actions**:
  - **"Approve Group" Button**: Automatically selects all members of the group and triggers the approval modal.
  - **Checkbox Select**: Toggles individual row selection.
  - **"Approve" Row Button**: Triggers `BookingApprovalModal` for the single member.
  - **"Reject" Row Button**: Triggers `BookingRejectionModal` for the single member.

#### B. Sub-Component: `IndividualBookingRow`
- **Purpose**: Rows for single patients booking individually.
- **Data Rendered**:
  - Checkbox selection (`selectedPendingIds`)
  - Patient Name (`patientName`)
  - Treatment Service Name (`serviceName`)
  - Requested Date and Time (`date` at `time`)
- **Actions**:
  - **Checkbox Select**: Toggles row selection.
  - **"Approve" Button**: Triggers `BookingApprovalModal` for the individual booking.
  - **"Reject" Button**: Triggers `BookingRejectionModal` for the individual booking.

---

### 2. `CheckInTracker`
- **Purpose**: Lists confirmed appointments for the day to log physical arrival at the clinic.
- **Data Rendered**:
  - `upcomingList`: `UpcomingAppointment[]`
    - Patient Name (`patientName`)
    - Date and Time (`date` at `time`)
    - Doctor (`doctorName`)
    - Status Badge: Styled depending on state:
      - `APPROVED` (Displays `"Scheduled"`, color: grey/secondary)
      - `CHECKED_IN` (Displays `"Checked In"`, color: blue/emerald highlight)
- **Actions**:
  - **"Mark Checked-In" / "Undo Check-In" Button**: Action toggles patient state between `APPROVED` and `CHECKED_IN`.

---

### 3. `CheckoutQueue`
- **Purpose**: Queue of sessions completed by doctors waiting for financial checkout.
- **Data Rendered**:
  - `draftInvoices`: `DraftInvoice[]`
    - Patient Name (`patientName`)
    - Service rendered (`serviceName`)
    - Assigned Dentist (`doctorName`)
    - Standard Service Cost (`basePrice`)
- **Actions**:
  - **"Check-Out" Button**: Opens the `InvoiceCheckoutModal` to input payment details.

---

### 4. `PatientNotifications`
- **Purpose**: Filterable audit ledger of system-sent emails for debugging verification codes and bookings.
- **Data Rendered**:
  - `emailLogs`: `EmailLog[]`
    - Recipient Address (`recipient`)
    - Subject line (`subject`)
    - Time sent (`timestamp`)
    - Delivery Status Badge (`status` e.g., Sent, Delivered)
- **Actions**:
  - **Search Input**: Text filter checking recipient email or subject text.

---

### 5. `AuditTimeline`
- **Purpose**: Display logs of actions performed by secretaries or admins.
- **Data Rendered**:
  - `audits`: `AuditLog[]`
    - Actor Name
    - Action type performed
    - Timestamp
    - Reason / Remarks details

---

## 💬 Dialog Modals

### 1. `BookingApprovalModal`
- **Trigger**: Clicking "Approve" (single, group, or batched).
- **Inputs**:
  - **Approval Reason / Remarks**: Select pre-defined reasons (e.g., "Slot is available", "Patient details verified") or enter custom input remarks.
- **Action**: Confirms and converts `PENDING` request to `APPROVED`.

### 2. `BookingRejectionModal`
- **Trigger**: Clicking "Reject" on any row.
- **Inputs**:
  - **Rejection Reason**: Mandatory text field explaining why booking was rejected (e.g., "Schedule fully booked", "Specialist unavailable").
- **Action**: Confirms and converts `PENDING` request to `REJECTED`.

### 3. `InvoiceCheckoutModal`
- **Trigger**: Clicking "Check-Out" from the Checkout Queue.
- **Data Displayed**:
  - Patient Name, service name, doctorName, and standard basePrice.
- **Inputs**:
  - **Discount Percent (%)**: Numerical input from `0` to `100`.
  - **Payment Method Select**: Dropdown choice:
    - `CARD` (Credit/Debit Card)
    - `CASH` (Cash Payment)
    - `INSURANCE` (Insurance Claim)
- **Dynamic Pricing Calculations**:
  - $\text{Total Due} = \text{basePrice} - (\text{basePrice} \times \frac{\text{discountPercent}}{100})$
- **Action**: Clicking "Complete & Lock Receipt" submits payment info, creates a final invoice log, and updates the appointment status from `TREATMENT_RENDERED` to `COMPLETED`.

---

## 🛠️ Data Model structures

```typescript
interface PendingBooking {
  id: string;
  patientName: string;
  serviceName: string;
  date: string;
  time: string;
  relationship?: string; // e.g. "Spouse", "Child" (if family group member)
  familyGroupId?: string | null;
}

interface UpcomingAppointment {
  id: string;
  patientName: string;
  serviceName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'APPROVED' | 'CHECKED_IN';
}

interface DraftInvoice {
  id: string;
  patientName: string;
  serviceName: string;
  doctorName: string;
  basePrice: number;
}

interface EmailLog {
  recipient: string;
  subject: string;
  timestamp: string;
  status: string;
}

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  reason?: string;
}
```
