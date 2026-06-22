# Patient Portal Component & Data Map Blueprint

This document acts as a complete design and data blueprint for remaking or refactoring the **Patient Portal**. It maps every UI component, sub-component, and modal directly to its data requirements, statuses, page routes, and interactive actions.

---

## 📂 Navigation & Layout Frame
All pages in the Patient Portal render within a shared dashboard layout shell.

### 1. Navigation Shell / Sidebar
- **Route Namespace**: `/user/*`
- **Dynamic Elements**:
  - **Active Profile Badge**: Shows the authenticated user's profile image/avatar, full name, and role (`Patient`).
  - **Notification Bell (Header)**:
    - **Data Required**: Unread notifications count/indicator status.
    - **Action**: Clicking opens the in-app notification dropdown/menu or routes to `/user/notifications`.
  - **Navigation Links**:
    - Dashboard (`/user`)
    - My Appointments (`/user/appointments`)
    - Notifications (`/user/notifications`)
    - Account Settings (`/user/settings`)

---

## 🏠 Page 1: Dashboard (`/user`)
Provides an immediate summary of the patient's upcoming activity, recent notifications, and quick routes.

```
┌────────────────────────────────────────────────────────┐
│               DashboardWelcomeBanner                  │
├───────────────────────────┬────────────────────────────┤
│                           │                            │
│ DashboardUpcomingWidget   │ DashboardRecentNotifications│
│                           │                            │
└───────────────────────────┴────────────────────────────┘
│                DashboardQuickActions                   │
└────────────────────────────────────────────────────────┘
```

### 1. `DashboardWelcomeBanner`
- **Purpose**: Personalized welcome text.
- **Data Rendered**:
  - `patientName`: `string` (Defaults to `Patient` or fallback, populated from `user.user_metadata?.first_name` or `firstName`).
- **Aesthetic/Text**: `"Welcome back, [patientName]!"`

### 2. `DashboardUpcomingWidget`
- **Purpose**: Highlights the single next upcoming confirmed/active appointment.
- **Data Rendered**:
  - `nextAppointment`: `AppointmentDto | null`
    - Date and time (e.g., `"Monday, June 22, 2026"` & `"10:00 AM - 11:00 AM"`).
    - Status Badge: styled depending on status (`APPROVED`, `RESCHEDULE_REQUESTED`, `CHECKED_IN`).
    - Assigned specialist name: `doctor` (e.g., `"Dr. Jane Doe"`).
    - Treatment service: `service.name` (e.g., `"Dental Clean-up & Scaling"`).
- **Actions**:
  - **"Manage Appointments"**: Routes to `/user/appointments` (triggers when clicking "Manage").
  - **"Book New Appointment"**: Routes to `/booking` (triggers if no upcoming appointments are found).

### 3. `DashboardRecentNotifications`
- **Purpose**: Displays a list of the 3-5 latest in-app notifications.
- **Data Rendered**:
  - `recentNotifications`: `Notification[]`
    - Notification text/message, type, and timestamp (e.g., `"Your reschedule request has been approved - 2 hours ago"`).
- **Actions**:
  - **"View All" Button**: Routes to `/user/notifications`.

### 4. `DashboardQuickActions`
- **Purpose**: Prominent card-styled buttons for immediate navigation.
- **Actions**:
  - **Book Appointment**: Routes to `/booking`.
  - **View Schedules**: Routes to `/user/appointments`.
  - **Edit Profile Settings**: Routes to `/user/settings`.

---

## 📅 Page 2: My Appointments (`/user/appointments`)
A dedicated control center to filter, track, and manage all scheduled, pending, and past dental visits.

```
┌────────────────────────────────────────────────────────┐
│ Header: "My Appointments" + [+ New Booking Button]     │
├────────────────────────────────────────────────────────┤
│ Tabs: [Upcoming (N)]   [Pending (M)]   [History (K)]   │
│                                      [Filter Dropdown] │
├────────────────────────────────────────────────────────┤
│                       Tab Panel                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ AppointmentTeaserCard                              │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ AppointmentTeaserCard                              │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 1. Page Header & Actions
- **Header Title**: `"My Appointments"`
- **Subtitle**: `"Track your pending requests, view upcoming schedules, and look through your dental visit history."`
- **Action Button**: `+ New Booking` (Routes to `/booking`).

### 2. Tab Filter & Badge Counters
- **Tab Selection**: State controlling active panel (`upcoming` | `pending` | `history`).
- **Tab Badges**: Render counts dynamically derived from filtered lists:
  - **Upcoming**: Count of scheduled appointments (Status: `APPROVED`, `RESCHEDULE_REQUESTED`, `CHECKED_IN`).
  - **Pending Requests**: Count of initial requests awaiting approval (Status: `PENDING`).
  - **History**: Count of past or resolved slots (Status: `REJECTED`, `CANCELLED`, `DISPLACED`, `COMPLETED`, `NO_SHOW`, `TREATMENT_RENDERED`).
- **Filter Dropdown**:
  - **Data Needed**: Extracted list of unique patient and dependent profiles from the appointments.
  - **Structure**: Dropdown showing `"All"`, `"Account Holder Name"`, and any associated `"Dependent / Family Member Name"`.
  - **Behavior**: Selecting a name filters the items shown in the active tab panel.

### 3. `AppointmentTeaserCard` (High-Scannability Card)
Lists appointments inside each Tab Panel.
- **Data Rendered**:
  - **Top-Left**: Treatment Service Name (`service.name`)
  - **Middle-Left**: Specialist Doctor (`doctor.firstName lastName`) & Patient Name (`dependent` or primary `patient.firstName lastName`)
  - **Bottom-Left**: Time Window (`startTime` - `endTime`) & Date (`date`)
  - **Top-Right**: Colored Status Badge (`status`)
- **Actions**:
  - **"View Details"**: Routes to `/user/appointments/[id]`.

---

## 🔍 Page 3: Detailed Appointment View (`/user/appointments/[id]`)
An organized grid displaying clinical details, comparison views, and patient metadata.

```
┌────────────────────────────────────────────────────────┐
│ ← Back to Appointments                                  │
│ Title: "Appointment Profile"        [Cancel] [Reschedule]│
├────────────────────────────────────────────────────────┤
│                  Status Hero Banner                    │
├───────────────────────────┬────────────────────────────┤
│                           │                            │
│  AppointmentScheduleCard  │   AppointmentPatientCard   │
│  (Comparison Split View)  │                            │
│                           ├────────────────────────────┤
│  AppointmentClinicalCard  │   AppointmentSystemCard    │
│                           │                            │
│  StatusHistoryTimeline    │                            │
│                           │                            │
└───────────────────────────┴────────────────────────────┘
```

### 1. Actions Header
- **Back Link**: `← Back to Appointments` (triggers `window.history.back()` or routes back).
- **Page Title**: `"Appointment Profile"`
- **Conditional Action Buttons**:
  - **Cancel Request / Cancel**: Visible if status is `PENDING` or `APPROVED`. Opens `CancelAppointmentModal`.
  - **Reschedule**: Visible if status is `APPROVED` and `rescheduleCount < maxReschedules`. Opens the rescheduling scheduler flow.
  - **Reschedule Disabled**: Visible if status is `APPROVED` but `rescheduleCount >= maxReschedules`. Opens `RescheduleBlockedModal`.

### 2. `AppointmentStatusHero`
- **Purpose**: Displays the active status clearly.
- **Data Rendered**:
  - `status`: Active status (e.g., `APPROVED`, `PENDING`, `CANCELLED`, etc.).
  - `id`: The unique Booking Reference ID (UUID).
  - Status Indicators (Color-coded hero banner with state description e.g., `"Pending Staff Review"` or `"Checked-In at Clinic"`).

### 3. `AppointmentScheduleCard`
- **Purpose**: Details dates, times, and handles slot changes.
- **Data Rendered**:
  - **Standard View** (No reschedule requested):
    - `date`: Main booked date.
    - `startTime` to `endTime`: Current booked time window.
  - **Reschedule requested split comparison view** (Visible if `proposedDate` is present):
    - **Left Column ("Secured Current Slot" / "Previous Slot")**:
      - Displays the original secured slot's date and time.
      - Opacity styled lower if reschedule is already approved (indicating previous status).
    - **Right Column ("Requested New Slot" / "New Secured Slot")**:
      - Displays `proposedDate`, `proposedStartTime`, and `proposedEndTime`.
      - Highlighted with warning border/color if pending review, or success color if approved.
  - **Consistent Remarks Placement**: A styled callout box rendered at the bottom of the card displaying `statusReason` (e.g., Cancellation reasons, Approval comments, rejection reasons, displacement explanations).

### 4. `AppointmentClinicalCard`
- **Purpose**: Displays the dental service details.
- **Data Rendered**:
  - `service.name`: Treatment Service Name.
  - `service.durationMinutes`: Service duration helper text.
  - `doctor.prefix` `doctor.firstName` `doctor.lastName` `doctor.suffix`: Assigned Specialist Name & Credentials.
  - `userNote`: Patient note submitted during booking (renders in a styled text block labeled `"Patient Note on Booking"`).

### 5. `AppointmentPatientCard`
- **Purpose**: Displays patient identity details.
- **Data Rendered**:
  - `patientName`: Full name of patient/dependent receiving treatment.
  - `isFamily`: Flag indicating if a dependent received the treatment.
  - `dependent.relationship`: (If family) Relationship type (e.g., Child, Spouse).
  - `bookedBy`: Primary account holder's name who made the booking.

### 6. `AppointmentSystemCard`
- **Purpose**: Displays metadata.
- **Data Rendered**:
  - `rescheduleCount`: Number of times this appointment has been rescheduled.
  - `maxReschedules`: Maximum config threshold (e.g., `rescheduleCount / maxReschedules`).
  - `archivedStatus`: Displays the inactive status badge if the appointment is in a finalized state (e.g., Completed, Cancelled).

### 7. `StatusHistoryTimeline` (Status Audit Trail)
- **Purpose**: Displays the sequential history of status updates for accountability.
- **Data Rendered**:
  - `statusHistory`: Array of status updates:
    - `newStatus`: The new status.
    - `createdAt`: Date/time of transition.
    - `reason`: Accompanying comment/remark (italicized block).
    - `actorRole`: Role of the person who initiated the change (`PATIENT`, `SECRETARY`, `DOCTOR`, `ADMIN`).

---

## 💬 Modals

### 1. `CancelAppointmentModal`
- **Trigger**: Patient clicks "Cancel" or "Cancel Request" on detailed view.
- **Fields**:
  - **Cancel Reason Input**: Mandatory text input.
- **Confirm Button**: Disabled until a cancellation reason is provided.
- **Action**: Triggers backend cancellation.

### 2. `RescheduleBlockedModal`
- **Trigger**: Patient clicks "Reschedule" but `rescheduleCount >= maxReschedules`.
- **Content**: Information warning that the maximum allowed reschedules for this booking has been reached, prompting them to contact support or clinic staff directly.

---

## 🛠️ Data Model / DTO Reference (`AppointmentDto`)
```typescript
interface AppointmentDto {
  id: string;                         // UUID
  patientId: string;                  // UUID
  dependentId: string | null;         // UUID (if booked for dependent)
  serviceId: string;                  // UUID
  doctorId: string;                   // UUID
  date: string;                       // YYYY-MM-DD
  startTime: string;                  // HH:MM:SS
  endTime: string;                    // HH:MM:SS
  status: AppointmentStatus;          // 'PENDING' | 'APPROVED' | 'CANCELLED' | 'REJECTED' | 'RESCHEDULE_REQUESTED' | 'CHECKED_IN' | 'COMPLETED' | etc.
  userNote: string | null;            // Note provided by patient
  statusReason: string | null;        // Remarks for status change
  proposedDate: string | null;        // Proposed reschedule date
  proposedStartTime: string | null;   // Proposed reschedule start time
  proposedEndTime: string | null;     // Proposed reschedule end time
  proposedDoctorId: string | null;    // Proposed reschedule doctor ID
  rescheduleCount: number;            // Current reschedule count
  createdAt: string;                  // Timestamp
  updatedAt: string;                  // Timestamp
  
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    prefix: string | null;
    suffix: string | null;
  } | null;

  service: {
    id: string;
    name: string;
    durationMinutes: number;
  } | null;

  patient: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;

  dependent: {
    id: string;
    firstName: string;
    lastName: string;
    relationship: string;
  } | null;

  statusHistory: Array<{
    id: string;
    previousStatus: string | null;
    newStatus: string;
    reason: string | null;
    createdAt: string;
    actorRole: 'PATIENT' | 'SECRETARY' | 'DOCTOR' | 'ADMIN';
  }>;
}
```

---

## 🎨 Status Design & Styling Variations

The visual theme, status badge color schemes, icons, and notification alerts vary depending on the active state of the appointment. When rendering these in components (like the `AppointmentStatusHero` or `AppointmentTeaserCard`), map them using the definitions below:

### 1. Status Mapping Table

| DB Status Code | UI Label Name | Icon | Theme styling (Tailwind CSS) |
|---|---|---|---|
| **`PENDING`** | `Pending Staff Review` | 🗓️ | `bg-amber-50 dark:bg-amber-950/20`, `border-amber-200 dark:border-amber-900`, `text-amber-800 dark:text-amber-350` |
| **`APPROVED`** | `Approved` | ✅ | `bg-emerald-50 dark:bg-emerald-950/20`, `border-emerald-200 dark:border-emerald-900`, `text-emerald-800 dark:text-emerald-350` |
| **`REJECTED`** | `Rejected` | ❌ | `bg-rose-50 dark:bg-rose-950/20`, `border-rose-200 dark:border-rose-900`, `text-rose-800 dark:text-rose-350` |
| **`CANCELLED`** | `Cancelled` | ❌ | `bg-rose-50 dark:bg-rose-950/20`, `border-rose-200 dark:border-rose-900`, `text-rose-800 dark:text-rose-350` |
| **`RESCHEDULE_REQUESTED`** | `Reschedule Requested` | 🗓️ | `bg-amber-50 dark:bg-amber-950/20`, `border-amber-200 dark:border-amber-900`, `text-amber-800 dark:text-amber-350` |
| **`DISPLACED`** | `Displaced` | 🗓️ | `bg-amber-50 dark:bg-amber-950/20`, `border-amber-200 dark:border-amber-900`, `text-amber-800 dark:text-amber-350` |
| **`CHECKED_IN`** | `Checked-In` | ✅ | `bg-emerald-50 dark:bg-emerald-950/20`, `border-emerald-200 dark:border-emerald-900`, `text-emerald-800 dark:text-emerald-350` |
| **`TREATMENT_RENDERED`** | `Ready for Checkout` | 💳 | `bg-blue-50 dark:bg-blue-950/20`, `border-blue-200 dark:border-blue-900`, `text-blue-800 dark:text-blue-350` |
| **`COMPLETED`** | `Completed` | ✅ | `bg-emerald-50 dark:bg-emerald-950/20`, `border-emerald-200 dark:border-emerald-900`, `text-emerald-800 dark:text-emerald-350` |
| **`NO_SHOW`** | `No-Show` | ⚠️ | `bg-slate-100 dark:bg-slate-900/40`, `border-slate-200 dark:border-slate-800`, `text-slate-700 dark:text-slate-300` |

### 2. Status-Specific Callout Banners
When visiting the detailed view of an appointment, three specific statuses trigger an additional inline message box inside the `AppointmentStatusHero` block:

#### A. CHECKED_IN
- **Alert Icon**: `🏥`
- **Banner Style**: `bg-emerald-500/10`, `border-emerald-500/20`, `text-emerald-805 dark:text-emerald-350`
- **Content**: `"You are Checked-In! Please wait in the reception area. Your doctor will see you shortly."`

#### B. TREATMENT_RENDERED
- **Alert Icon**: `💳`
- **Banner Style**: `bg-blue-500/10`, `border-blue-500/20`, `text-blue-805 dark:text-blue-350`
- **Content**: `"Billing & Checkout Required: Your treatment is completed. Please proceed to the clinic front desk for final checkout and invoice settlement."`

#### C. NO_SHOW
- **Alert Icon**: `⚠️`
- **Banner Style**: `bg-rose-500/10`, `border-rose-500/20`, `text-rose-805 dark:text-rose-350`
- **Content**: `"Reliability Warning: You missed this appointment. Failures to attend without prior cancellation are recorded as negative credibility, which may restrict your reservation permissions."`

