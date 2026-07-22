# Task: Booking Calendar & Doctor Timeline View

For the secretary portal (`/secretary-v2/book`), we want to redesign the layout into a 2-column layout to allow secretaries to view doctors' schedules side-by-side while booking appointments.

## Proposed Layout Architecture

```
+-------------------------------------------------------+--------------------------+
| LEFT COLUMN (Timeline View)                           | RIGHT COLUMN (Sidebar)   |
| Header: Doctor Schedules                              | Header: Booking Console  |
+-------------------------------------------------------+--------------------------+
|                                                       | +----------------------+ |
| Time      | Dr. Adams   | Dr. Brown   | Dr. Carter   | |   CALENDAR / FORM    | |
| ----------+-------------+-------------+------------- | | (Hides when an       | |
| 08:00 AM  |             | +---------+ |              | |  appointment card is | |
| 08:10 AM  |             | | Patient | |              | |  clicked)            | |
| 08:20 AM  | +---------+ | | Service | |              | +----------------------+ |
| 08:30 AM  | | Patient | | | 8-8:30  | |              | OR                       |
| 08:40 AM  | | Service | | +---------+ |              | +----------------------+ |
| 08:50 AM  | | 8:20-9  | |             |              | |  APPOINTMENT DETAILS | |
| 09:00 AM  | +---------+ |             | [Booked]     | |  (With close button   | |
| ...       |             |             |              | |   to show form again)| |
+-------------------------------------------------------+--------------------------+
```

---

## 1. Left Column: Doctor Timeline Grid

### Core Features:
- **Header**: "Doctor Schedules" or similar header specific to the timeline display.
- **Columns**: One column for time labels, and one column per active doctor (fetched via `getDoctorsAction`).
- **Rows**: Rows represent 10-minute increments from a configured start time to end time (e.g., `08:00 AM` to `05:00 PM` or based on clinic hours).
- **Time Slots**:
  - `08:00 AM`
  - `08:10 AM`, `08:20 AM`, `08:30 AM`, `08:40 AM`, `08:50 AM`
  - `09:00 AM`, etc.
- **Booked Blocks**:
  - Fetch appointments for the selected date using `getClinicAppointmentsAction({ date: selectedDate })`.
  - Span blocks on the grid according to the appointment `startTime` and `endTime` matching the doctor's column (stretching across all overlapping 10-minute intervals).
  - **Card Content**:
    - **Patient Name** (Main label)
    - **Service** (Sub-label, below the patient's name)
    - **Time Range** (e.g. `08:00 AM - 08:30 AM`)
  - **Clicking a Card**: Selecting/clicking an appointment card sets `selectedAppointmentDetails`, which triggers the right column sidebar to show the appointment details instead of the calendar & booking form.

---

## 2. Right Column: Navigation & Booking Forms

### Top Section: Calendar Widget & Navigation Header
- **Header**: "Booking Console" or similar header specific to the booking panel.
- Displays a month-view calendar showing the active date.
- Clicking a day sets `selectedDate` which:
  - Triggers a reload of the left-hand timeline's appointments.
  - Automatically updates the booking scheduler form's date selector.

### Bottom Section: Existing Booking Form
- Renders the fields from `BookPatientIdentityPanel` and `BookSchedulePanel`.
- To fit in a single sidebar column, we can arrange them vertically or convert them into a clean multi-step/collapsible accordion layout.
- Submit action: Once successfully booked, trigger a refresh of the timeline data for the selected date to display the newly added appointment blocks.

### Appointment Details Mode
- If an appointment card is selected from the timeline, hide the Calendar and Booking Form.
- Render a details pane containing the clicked appointment's attributes: patient details, doctor, service, status, times, etc.
- Include a "Close / Back" button that clears the selected appointment and shows the calendar & booking form again.

---

## 3. Implementation Plan & Checklist

- [x] **Step 1: Create Timeline Fetching Hook**
  - Add state for selected date: `selectedDate` (defaults to today's date formatted as `YYYY-MM-DD`).
  - Add state for loaded appointments: `appointments` list.
  - Add state for active doctors: `doctors` list.
  - Add state for selected appointment details: `selectedAppointmentDetails`.
  - Trigger fetches when `selectedDate` changes.

- [x] **Step 2: Build `<DoctorTimeline />` Component**
  - Define time slot steps (10-minute intervals).
  - Construct the scrollable grid container.
  - Map appointment times to coordinate grid positions or rows.
  - Display placeholder cells and color-coded occupied cells for booked slots.
  - Bind `onClick` handler on appointment cards to set `selectedAppointmentDetails`.

- [x] **Step 3: Redesign `<SecretaryBookAppointmentView />` Layout**
  - Change main wrapper grid: `grid grid-cols-1 xl:grid-cols-12 gap-8`.
  - Left column (`xl:col-span-8` or `xl:col-span-7`): Render left header and `<DoctorTimeline />`.
  - Right column (`xl:col-span-4` or `xl:col-span-5`):
    - Render right header.
    - If `selectedAppointmentDetails` is set, render the appointment details panel with a "Close" button.
    - Otherwise, render calendar selector at the top and patient identity panel + schedule booking panel underneath.

- [x] **Step 4: Connect Calendar & Form Interactions**
  - Ensure the calendar's active date updates `selectedDate` in `useSecretaryBookAppointment`.
  - Ensure `submit()` callback refetches the timeline appointments on success.
  - Verify layout responsiveness.
