# Secretary Portal: Inquiries Queue

**Route**: `/secretary/inquiries`

This queue manages incoming submissions from the public website contact/inquiry form. These are unauthenticated guest drafts.

## 1. Split-Pane Layout
The page uses a stable 2-column split-pane layout to review guest inquiries, tweak logistics inline, and commit the pipeline status:
- **Left Column (Table)**: A list of all active inquiries showing the initial user submission data.
- **Right Column (Details Pane)**: Displays form data, provides inline accordion edit panels, and stages the final review decision.

---

## 2. Left Column (Inquiries Table)
Lists unauthenticated submissions from the landing page.

### Columns
- **Guest Name**: Provided name.
- **Initial Requested Service**: The raw service selected by the guest in the landing page form.
- **Initial Requested Date**: The target date picked by the guest.
- **Email & Phone**: Guest contact data.
- **Submitted At**: Timestamp when the inquiry was received.

---

## 3. Right Column (Details Pane / Converter Layout)
Organized into structured cards to clearly highlight original request details vs. active modifications.

### A. Action-First Review Selection (Dominant Toggle)
At the very top of the Details Pane (or right below the basic selected inquiry header), the secretary picks the review action:
- **Convert to Appointment**: Stages the inquiry for conversion.
- **Drop Inquiry**: Stages the inquiry to be discarded.

The selected action dynamically alters which sections are visible in the rest of the details pane.

### B. Guest Profile Card
Displays basic guest info:
- **Name**: Guest Full Name (editable input).
- **Email & Phone**: Contact fields (editable input).

### C. Initial Request Details Card
Displays read-only values snapshotting the original visitor request:
- **Requested Service**: Service name.
- **Requested Date**: Target date.
- **Guest Remarks/Note**: Plain text message submitted.

### D. Active Parameters (Progressive Accordions) - *Visible only if "Convert to Appointment" is selected*
Provides interactive edit controls:
- **Service Selection**: Displayed as service cards or pill buttons to select the treatment.
- **Schedule Selection**:
  - **Inline Calendar Picker**: A visual monthly/weekly calendar grid (rather than a simple date text input). Days can be clicked directly to update the active date parameter.
  - **Doctor Availability Cards**: Shows cards representing available doctors on the selected date. Each doctor card displays:
    - Dentist name.
    - Standard operating shift schedule (e.g. `M/W/F` vs `T/Th`).
  - **Timeslots Grid**: A grid showing all daily slot intervals (e.g. 9:00 AM - 5:00 PM). Active/available slots are clickable pills, while occupied or conflicting slots are rendered as disabled greyed-out options.

### E. Patient Identity Linking - *Visible only if "Convert to Appointment" is selected*
- **Link to Patient Profile**: Uses Search-First checks to link the inquiry to an existing patient account, or registers a Guest user if no record matches.

### F. Justification for Dropping - *Visible only if "Drop Inquiry" is selected*
- **Reason for Dropping**: A mandatory text input field detailing why the inquiry is being dropped.

---

## 4. Staged Review Execution
At the bottom of the details pane, a single, definitive action button commits the staged state:

- **"Finish Review" Action Button**:
  - Commits the selection.
  - If **Convert** is finalized, registers the appointment under the resolved patient profile, updates status to `CONVERTED`, and creates the booking.
  - If **Drop** is finalized, updates the inquiry status to `DROPPED` and removes it from the active list.
  - Triggers a validation check to guarantee mandatory reasons are typed out if dropping.
  - Clears selection and refreshes the left-column table.
