# Vibe Coding Guide: Secretary Appointment Request Component

This document outlines the state, data structures, actions, and layouts for the **Appointment Requests** view (Secretary Dashboard). It serves as your structural reference when "vibe coding" different UI skins or layouts.

---

## 1. Dynamic State & Data Schema

This component is driven by the React Hook `useSecretaryPendingRequests` which encapsulates the following data streams and UI states.

### Core View States
- `isLoading` (`boolean`): Main loading state for the list of pending appointments.
- `isLoadingDetails` (`boolean`): Loading state while retrieving additional details for the selected appointment.
- `isSubmitting` (`boolean`): Submitting status when confirming the decision.
- `isEditing` (`boolean`): Flag indicating if the secretary is in "rescheduling/editing mode" for the request.

---

### Data Models & Mock Data
When vibe-coding, use these formats to populate lists, cards, and details panels.

#### Individual Appointment Request
```typescript
interface AppointmentRequest {
  id: string;
  patientId: string;
  dependentId?: string | null;
  doctorId: string;
  doctorAssignmentSource: 'SYSTEM' | 'MANUAL';
  serviceId: string;
  date: string;       // e.g. "2026-07-15"
  startTime: string;  // ISO string or "2026-07-15T09:00:00.000Z"
  endTime: string;    // ISO string or "2026-07-15T09:30:00.000Z"
  status: 'PENDING';
  note?: string;
}
```

#### Patient Details (`patientDetails`)
```typescript
interface PatientDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  history: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'APPROVED' | 'REJECTED' | 'DISPLACED' | 'PENDING' | 'CANCELLED';
  }>;
}
```

#### Doctor Schedule (`doctorSchedule`)
```typescript
interface DoctorTimeSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: 'BUSY' | 'AVAILABLE';
  patientName?: string;
}
```

#### Conflicting Appointment (`conflictingAppointment`)
An appointment returned if the patient already has an existing non-cancelled/non-rejected appointment that overlaps with the current request slot.

---

## 2. Event Handlers & API Actions

Your layout elements should bind to these actions:

| Action Trigger | Parameters | Description |
| :--- | :--- | :--- |
| `selectAppointment(id)` | `appointmentId: string` | Highlights request, resets decision status/reasons, and triggers loading detail query. |
| `toggleEditing()` | None | Toggles the editing/rescheduling panel. Syncs current request details into editing states. |
| `setDecision(status)` | `'APPROVED' \| 'REJECTED' \| 'DISPLACED'` | Sets the action selected by the secretary. |
| `setReason(reason)` | `string` | Sets preset reasons (e.g. `'CUSTOM'`, `'DOCTOR_UNAVAILABLE'`). |
| `setCustomReason(val)` | `string` | Text field value for custom remark notes. |
| `finishAppointmentReview(id)` | `appointmentId: string` | Validates details and calls the status update API. |

### Edit Form Setters (Rescheduling)
* `setEditService(serviceId)`
* `setEditDoctor(doctorId)`
* `setEditAppointmentDate(date)`
* `setEditCurrentMonth(dateObj)`
* `setEditStartTime(timeStr)` (e.g., `"09:00"`)
* `setEditEndTime(timeStr)` (e.g., `"09:30"`)
* `setEditNote(noteStr)`

---

## 3. UI Layout Skeletons

Here are a few layout alternatives you can vibe-code depending on your theme choices.

```
Layout A: Classic Two-Column Split (Master-Detail)
+------------------------------------+---------------------------------------+
|  LEFT PANEL: Request List (40%)    | RIGHT PANEL: Detail Pane (60%)        |
|  +------------------------------+  |  +---------------------------------+  |
|  | [Card] Patient John Doe      |  |  | Patient Info & Request Details  |  |
|  | - Service: Dental Cleaning   |  |  +---------------------------------+  |
|  | - Requested Slot: 9:00 AM    |  |  | Conflict Alert (if any)         |  |
|  | [Active]                     |  |  +---------------------------------+  |
|  +------------------------------+  |  | Doctor Schedule Timeline        |  |
|  | [Card] Patient Jane Smith    |  |  +---------------------------------+  |
|  | - Service: Teeth Whitening   |  |  | Edit/Reschedule Panel           |  |
|  +------------------------------+  |  +---------------------------------+  |
|                                    |  | Approval/Rejection Decision Form|  |
+------------------------------------+---------------------------------------+
```

```
Layout B: Full-screen Kanban Board
+----------------------+----------------------+----------------------+
| REQUESTED (PENDING)  | TO RESCHEDULE        | READY TO CONFIRM     |
+----------------------+----------------------+----------------------+
| [Card] Jane Smith    | [Card] John Doe      | [Card] Alex Mercer   |
| (Needs review)       | (Conflict found)     | (Slots check OK)     |
| [Review Button]      | [Adjust Slots]       | [Quick Approve]      |
+----------------------+----------------------+----------------------+
```

```
Layout C: Grid Card-List with Popout Drawers
+-------------------+-------------------+-------------------+
| [Card] John Doe   | [Card] Jane Smith | [Card] Bob Johnson|
| Review Details    | Review Details    | Review Details    |
+-------------------+-------------------+-------------------+
                   \                     /
                    \                   /
                     +-----------------+
                     | SLIDE-OUT DRAWER|
                     | Full Details &  |
                     | Decision Form   |
                     +-----------------+
```

---

## 4. Vibe-Coding Checklist & Rules

1. **Conflict Highlight**: Always check if `conflictingAppointment` exists. If yes, display a prominent warning banner containing the conflicting time.
2. **Decision Validation**:
   - Do not submit without `stagedStatus`.
   - Reason is required. If `stagedReason === 'CUSTOM'`, validate that `customReason` is non-empty.
   - If editing, validate that `editStartTime < editEndTime` and all fields (`service`, `doctor`, `date`) are selected.
3. **Responsive Flow**:
   - Mobile: Render the list as a full-screen view. Clicking a card opens a modal sheet or scrolls down to the details.
   - Desktop: Render side-by-side grids or multi-pane views (Layout A).
