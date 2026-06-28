# Master Specification: Secretary Portal (Samson Dental Center)

This document compiles the complete functional specification, data models, page routing, and user interface details for the Secretary Portal. Use this to construct or reconstruct the portal view files, hooks, and layout shells.

---

## 1. Frontend Architecture & Design Guidelines

To maintain visual cohesion, type safety, and clean code division:

- **100% Dumb Presentational Client Components**: All pages must rely on mock data and central state hooks (e.g., `useSecretary`), maintaining zero direct database queries or live API fetch side-effects on the views.
- **Form Component Schema**: Custom inputs (such as `<Input />`, `<Textarea />`, and `<Select />`) must follow clean schemas. Primitives like `<Select />` must receive options as an array of `{ value, label }` shapes rather than rendering inline JSX children options.
- **Double-Colon Postgres Casts**: Never write double-colons (e.g., `::text`) inside TypeScript/TSX code as it will trigger Turbopack compilation failures. Use TypeScript `as string` or standard type assertions instead.
- **Premium Aesthetics**: Use cohesive dark modes, HSL tailored variables, subtle background gradient indicators, grid layouts, and clean animations (like fading panels). Avoid default unstyled browser elements or raw red/blue alerts.
- **No Batch Operations**: Batched checkbox multi-selections or bulk status finalization are disallowed. The portal enforces an individual, item-by-item review flow.

---

## 2. Shared Data Models & Types (`secretary.types.ts`)

```typescript
export type AppointmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'RESCHEDULE_REQUESTED'
  | 'DISPLACED'
  | 'CHECKED_IN'
  | 'TREATMENT_RENDERED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type PaymentMethod = 'CASH' | 'CARD' | 'HMO';
export type InquiryStatus = 'NEW' | 'CONVERTED' | 'DROPPED';
export type AppointmentSource = 'SELF_BOOKED' | 'STAFF_CREATED';

export interface PatientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  cancelCount: number;
  noShowCount: number;
  rescheduleCount: number;
}

export interface Appointment {
  id: string;
  patientId: string | null;
  patientName: string;
  dependentId?: string | null;
  dependentName?: string | null;
  serviceId: string;
  serviceName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  userNote?: string;
  statusReason?: string;
  clinicalNotes?: string;
  rescheduleCount: number;
}

export interface Inquiry {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  phoneNumber: string;
  email: string;
  preferredServiceId: string;
  preferredServiceName: string;
  preferredDate: string;
  patientNote?: string;
  status: InquiryStatus;
  secretaryNotes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  amount: number;
  basePrice: number;
  discountApplied: number;
  paymentMethod?: PaymentMethod | null;
  status: 'DRAFT' | 'FINALIZED' | 'PAID' | 'VOID';
  created_at: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  type: string;
  timestamp: string;
  status: 'Sent' | 'Failed' | 'Pending';
  content?: string;
}

export interface AuditLog {
  id: string;
  actorName: string;
  action: string;
  targetName: string;
  reason?: string;
  timestamp: string;
}
```

---

## 3. Sidebar Navigation Shell (`layout.tsx`)

A sticky sidebar container provides fast route switching:

- **Dashboard**: `/secretary`
- **Appointment Requests**: `/secretary/pending`
- **Inquiries Queue**: `/secretary/inquiries`
- **Book Appointment**: `/secretary/book`
- **Appointments Directory**: `/secretary/appointments`
- **Check-In / Out Tracker**: `/secretary/check-in`
- **Invoice Management**: `/secretary/invoices`
- **Email Log**: `/secretary/emails`
- **Audit Log**: `/secretary/audits`
- **Profile**: `/secretary/profile`
- **Services Management**: `/secretary/services`
- **Doctor Management**: `/secretary/doctors`
- **Doctor Schedule Management**: `/secretary/schedules`


---

## 4. Comprehensive Page Specifications

### Page 1: Dashboard (`/secretary`)
Provides Today's timeline and operational summaries.
- **Arrivals Today Metric**: Scheduled check-ins for the current day.
- **Pending Requests Metric**: Total count of active patient booking requests.
- **New Inquiries Metric**: Web-form guest submissions awaiting triage.
- **Checkouts Waiting Metric**: Treatment-rendered invoices awaiting payment checkout.
- **Today's Timeline**: Chronological, reactive timeline of approved appointments for today showing Patient, Dentist, Time, and Status badges (`APPROVED`, `CHECKED_IN`, `COMPLETED`).
- **Quick Links**: Rapid navigation buttons to Manual Booking (`/secretary/book`), Requests review (`/secretary/pending`), Inquiries triage (`/secretary/inquiries`), and Checkout trackers (`/secretary/check-in`).

---

### Page 2: Appointment Requests (`/secretary/pending`)
Reviews online booking requests submitted by logged-in users.
- **Layout**: Dynamic 2-column split-pane layout (`lg:grid-cols-12` where left list table is `lg:col-span-5` and details pane is `lg:col-span-7`).
- **Left Column (Requests Table)**: Scrollable list of pending requests containing:
  - Patient Full Name
  - Requested Service
  - Target Date & Time
- **Right Column (Details Pane)**:
  - **Header Info Card**: Patient Name, requested service, target dentist, and slot date/time.
  - **Patient Note Card**: Read-only patient feedback or special sensitivities notes.
  - **Patient Reliability Counters**: Displays previous cancellation, no-show, and reschedule metrics.
  - **Doctor Daily Schedule Timeline**: A visual timeline mapping all clinic time slots (from 8:00 AM to 5:00 PM) for the requested dentist on the selected date. Uses a vertical line and status bullet thread to render:
    - *Occupied Slots*: Gray slate cards displaying scheduled patient name and status.
    - *Free Slots*: Clean dotted cards showing available status and a green "OPEN" pill.
    - *Requested Slot*: Highly highlighted primary card showing "👉 CURRENT REQUEST" and "REQUESTED" status.
  - **Staged review action selector**: Tab buttons for `Approve`, `Reject`, or `Displace`.
    - Remarks Dropdown is rendered if approving, or justification textarea is rendered if rejecting/displacing.
  - **"Finish Review Decision" Button**: Submits the staged state.

---

### Page 3: Inquiries Queue (`/secretary/inquiries`)
Triages unauthenticated guest form submissions.
- **Layout**: Dynamic 2-column split-pane layout (`lg:grid-cols-12` where left list table is `lg:col-span-5` and details pane is `lg:col-span-7`).
- **Left Column (Inquiries Table)**: Lists new inquiries showing Guest Name (concatenated First/Middle/Last/Suffix), preferred service, target date, email, and phone number.
- **Right Column (Details Pane)**:
  - **Guest Profile Card**: Editable inputs for First Name, Middle Name, Last Name, Suffix, Phone, and Email.
  - **Action-First Review Toggle**: Pick **Convert to Appointment** or **Drop Inquiry** at the top of the pane. Changing this selection updates visible inputs dynamically:
  - **If "Convert to Appointment" is selected**:
    - *Initial Request Context Card*: Read-only requested service, date, and patient remarks.
    - *Progressive Accordions*:
      1. *Service Selection Accordion*: Selectable Pill buttons representing active treatments.
      2. *Schedule & Availability Accordion*:
         - *Inline Calendar Month Grid*: Clickable days of the month (June 2026 for mock consistency).
         - *Doctor cards*: Render available dentists with shift indicator badges (e.g. M/W/F).
         - *Timeslots Grid*: Grid of daily slots. Active slots are clickable, while occupied slots are disabled/greyed-out.
    - *Patient Profile Linking Card*: Search-first select menu to link to an existing registered patient profile, or default to registering them as a guest.
  - **If "Drop Inquiry" is selected**:
    - *Reason for Dropping Textarea*: A mandatory text entry box explaining why the lead was dropped.
  - **"Finish Inquiry Review" Button**: Commits the review decision at the bottom.

---

### Page 4: Book Appointment (`/secretary/book`)
A stepper wizard to create manual walk-in or phone call bookings.
- **Layout**: Full-width unified stepper. Bypasses the split-pane layout to avoid clutter.
- **Step 1: Patient Identity (Search-First Verification)**:
  - Search input box (looks up Name, Email, or Phone).
  - Selecting a matched profile locks/disables their details and skips to Step 2.
  - Creating a new profile opens inputs for First/Middle/Last name, Suffix, Phone (required), and Email (optional).
- **Step 2: Service & Schedule Selection**:
  - Service selection dropdown.
  - Doctor picker (assigned dentist or "Any Doctor").
  - Date & Timeslot Picker.
- **Step 3: Review & Submit**:
  - Summarizes the patient identity, selected service, assigned doctor, and date/time.
  - **Submit Button**: Automatically schedules the appointment as `APPROVED`, bypassing pending review gates.

---

### Page 5: Appointments Directory (`/secretary/appointments`)
Full audit logs lookup for all historical and upcoming bookings.
- **Filters**:
  - Status multi-select filter (`PENDING`, `APPROVED`, `REJECTED`, `CHECKED_IN`, `TREATMENT_RENDERED`, `COMPLETED`, `CANCELLED`, `DISPLACED`, `NO_SHOW`).
  - Search query matching against patient name, phone, email, or dentist name.
  - Date range filters.
- **Table Columns**: Patient name, Service, Doctor, Date & Time, booking source (`SELF_BOOKED` vs `STAFF_CREATED`), and styled status badge.
- **Details Drawer**: Clicking a row opens a details pane displaying the full status log history (actor, previous status, updated status, timestamp, and justification reason). Allows Rescheduling/Cancelling if the appointment is currently active.

---

### Page 6: Check-In / Out Tracker (`/secretary/check-in`)
Handles daily arrivals and checkouts.
- **Check-In Queue**: Table listing approved bookings scheduled for today. Features a primary button to mark them as `CHECKED_IN`, and an option to undo the action.
- **Check-Out Queue**: Lists patients whose status is `TREATMENT_RENDERED` (doctor has finished treatment and uploaded a draft invoice).
- **Check-Out Modal**:
  - Displays doctor's submitted treatment draft invoice.
  - Allows the secretary to modify price additions/subtractions or apply a discount percentage (0-100%).
  - Method of payment selector: `CASH`, `CARD`, `HMO`.
  - **Complete Button**: Transitions status to `COMPLETED` and locks/finalizes the invoice transaction.

---

### Page 7: Invoice Management (`/secretary/invoices`)
Ledger of locked billing statements.
- **Table Columns**: Invoice ID, Patient Name, Doctor, Finalization Date, Payment Method, Base Price, Discount, and Final Price.
- **Actions**: View receipt details (opens details popup modal) or download receipt PDF.

---

### Page 8: Email Log (`/secretary/emails`)
Diagnostic tool to verify sent email notifications.
- **Table Columns**: Recipient email, Subject, Notification Type, timestamp, and Sent status badge.
- **Action**: Click a log row to open the plain-text/HTML outbox body content in a dialog.

---

### Page 9: Audit Log (`/secretary/audits`)
Ledger of portal actions.
- **Table Columns**: Timestamp, Actor Name, Action Type (`APPROVE_BOOKING`, etc.), Target Name, and justification Reason.

---

### Page 10: Profile (`/secretary/profile`)
Personal credentials editor for the staff user.
- **Fields**: First name, Middle name, Last name, Suffix, Email (read-only), Phone number.
- **Password**: Link to trigger password modifications.

---

### Page 11: Services Management (`/secretary/services`)
Manages the clinic's treatment catalog using a Multi-State Service Lifecycle to prevent data referential breaks in past invoices or logs.
- **Service Lifecycle States**:
  - `DRAFT`: Visible nowhere (initial configuration stage).
  - `ACTIVE`: Visible on both the public Patient Portal and internal Secretary Portal.
  - `HIDDEN`: Hidden from Patient Portal self-bookings, but remains visible in the Secretary Portal for intake screening.
  - `ARCHIVED`: Soft-deleted/retired clinic-wide (hidden from both booking wizards, but retained in historical ledger records).
- **Service Catalog Layout**: A grid of service cards containing service names, categories, descriptions, base pricing, duration, and status indicators.
- **Form Controls**: Includes toggles for Online Booking visibility and a confirmation-guarded "Archive" utility, plus fields for editing service details.


---

### Page 12: Doctor Management (`/secretary/doctors`)
Manages the dentist roster and handles secure staff recruitment.
- **Roster Directory Layout**: Grid of cards or list view showing each doctor's name, specialization, contact info, and status badge (`ACTIVE`, `PENDING_REGISTRATION`, `INACTIVE`).
- **Secure Invitation Workflow**: The secretary inputs the doctor's details (Name, Email, Specialization) and clicks "Send Invitation". The system creates a profile in `PENDING_REGISTRATION` status, auto-hooks their default Layer 2 availability, and generates a secure 48-hour email invitation link.
- **Password Ownership**: The doctor clicks the email link to choose their own password, promoting secure credential management.
- **Details Drawer**: Displays full contact details, active schedules summary, and options to resend the invitation or update their active status.


---

### Page 13: Doctor Schedule Management (`/secretary/schedules`)
Configures clinic and doctor availability using a tiered 3-layer scheduling architecture with a tabbed interface.
- **Tab 1: Clinic Global Hours**: Configures Layer 1 clinic-wide operating hours (Monday–Sunday) with active toggles and time ranges.
- **Tab 2: Custom Doctor Shifts**: Selects a doctor to edit their standard weekly Layer 2 schedule (with toggles to unlock custom hours or inherit Layer 1 baseline).
- **Tab 3: Time Exclusions & Blocks**: A split-screen layout with a Form (left) to schedule Layer 3 vacation/sick blocks for doctors, and a Table (right) displaying active blocks with a quick "Revoke Block" action.



