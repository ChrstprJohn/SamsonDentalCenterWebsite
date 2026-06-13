# My Appointments

The appointments panel is located on its own dedicated page (`/user/appointments`). This is the primary interface for patients to track, manage, and review their interactions with the clinic.

## Sub-Tabs

The interface is divided into three distinct tabs to organize appointments logically. Users can filter their appointments using a dynamic filter dropdown showing the account holder's name and individual dependent names (e.g., "All", "Christopher Picardo", "test2 test2").

### 1. Upcoming Tab
- **Statuses**: `Approved`, `Reschedule Requested`, `Checked-In`
- **Description**: Displays upcoming schedules that are confirmed or in the process of being updated.
- **Features & Actions**:
  - The main list uses **Ultra-Clean Teaser Cards** showing only essential identifiers (Service, Doctor, Date/Time, Status, Patient) and a "View Details" button.
  - Clicking "View Details" routes to the specific **Detailed Appointment View** (`/user/appointments/[id]`) where all actions are managed.
  - **Cancel** (On Detail Page): Available for `Approved` appointments. Prompts for a mandatory reason. *Warning*: Excessive cancellations register a reliability penalty.
  - **Reschedule Request** (On Detail Page): Available for `Approved` appointments. Users submit a proposed new date and time, entering the "Hold & Swap" flow.
  - **Comparison Split View**: When an appointment is in the `Reschedule Requested` state, the card dynamically splits to show the "Secured Current Slot" alongside the "Requested New Slot" so patients know their original booking is safe while waiting for staff review.
  - **Check-in Tracker**: Once checked in, the card highlights that the patient is currently at the clinic.

### 2. Pending Requests Tab
- **Statuses**: `Pending`
- **Description**: Displays initial booking requests that have not yet been approved or rejected by the clinic staff.
- **Features & Actions**:
  - The list uses **Ultra-Clean Teaser Cards**.
  - **Cancel** (On Detail Page): Available at any time. Prompts for a mandatory reason.

### 3. History Tab
- **Statuses**: `Rejected`, `Cancelled`, `Displaced`, `Completed`, `No-Show`, `Treatment Rendered`
- **Description**: A read-only historical ledger of all past interactions.
- **Features & Actions**:
  - The list uses **Ultra-Clean Teaser Cards**.
  - **No Actions Allowed**: Read-only view, even on the detailed page.
  - **Detailed Audit**: The detailed page displays the exact reasons for cancellation or rejection. Highlights displacement causes (e.g., clinic closures) and explicitly flags credibility indicators if a No-Show occurred.

## UI Components
- **Filter Dropdown**: A dynamic select element derived from the appointments list, showing the account user's name and all active family members.
- **Tab Counters**: Badges on the tabs (e.g., `Upcoming [2]`) show the count of appointments in that category.
- **Reschedule Blocked Modal**: Informs the user if they have exceeded the maximum allowed reschedule requests (`maxReschedules` limit).
- **Cancel Appointment Modal**: Requires the user to type a reason for cancellation before confirming the destructive action.

### 1. Ultra-Clean Teaser Card
The main dashboard lists (Upcoming, Pending, History) are built using `AppointmentTeaserCard` to ensure high scannability.
- **Top-Left**: Treatment Service
- **Middle-Left**: Doctor Name & Patient/Dependent Name
- **Bottom-Left**: Date and Time
- **Top-Right**: Current Status Badge
- **Bottom-Right**: "View Details" Quick Action button (Routes to `/user/appointments/[id]`).

### 2. Detailed Appointment View (`/user/appointments/[id]`)
When a user clicks into an appointment, they are routed to a dedicated page that displays a grid-based, organized dashboard-style detailed view. This ensures clinical details, schedule comparison views, and patient information are separated logically rather than dumped into a single summary box.

The following organized sections are strictly displayed on the detailed page:
- **Status Hero Section**: Displays the active status clearly (e.g., "Approved", "Pending Staff Review", "Completed", "Cancelled") with styled color schemes, status icons, and the unique Reference ID.
- **Schedule & Timing Card**: Shows date, time window, and the slot comparison split view if there is a pending or processed reschedule request.
  - **Consistent Remarks Placement**: To maintain UI consistency across all states, *all* clinic feedback, reschedule reasons, approval/rejection remarks, displacement causes, and cancellation reasons are rendered in a styled callout box at the bottom of this card.
- **Clinical Details Card**: Displays the service name, duration, and assigned specialist.
- **Patient Profile Card**: Shows patient name, relationship (if family), and who booked it.
- **System Records Card**: Shows reschedule attempts used out of the limit.
