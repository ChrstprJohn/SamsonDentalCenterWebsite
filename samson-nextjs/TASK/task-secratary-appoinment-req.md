# Task: Secretary Pending Requests Queue (Review & Confirmation)

## Goals
Refactor the secretary pending requests view to support the "Request-to-Confirm" flow:
1. **Manual Start/End Time**: Replace dynamic slot selector with manual `startTime` and `endTime` inputs.
2. **Autofill & Fetch User Preferences**: Retrieve and display initial user inputs (`timePreference`, `serviceId`, `doctorId`, `date`).
3. **Handle Blank Doctor Preference**: For inquiries/leads without selected doctors, keep the doctor field blank initially for the secretary to choose.
4. **Priority Ordering**: List user-submitted pending requests first, followed by secretary-created pending requests.
5. **Aesthetics & Validation**: Clean UI inputs adhering to frontend design guidelines, using Zod schemas for payload validation, preventing invalid time entries (e.g., end time before start time).

---

## Coding Patterns to Follow
Must comply with system architecture and design guidelines without violation:

### Frontend Guidelines
* [1-ARCHITECTURE.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/1-ARCHITECTURE.md)
* [2-REACT-COMPONENTS.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/2-REACT-COMPONENTS.md)
* [3-REACT-HOOKS.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/3-REACT-HOOKS.md)
* [4-CODING-PATTERNS.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/frontend/4-CODING-PATTERNS.md)
  * **Rules**: Companion hooks (`use-secretary-pending-requests.ts`), named exports, no inline complex calculations, type safety for form values.

### Backend Guidelines
* [1-ARCHITECTURE.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/1-ARCHITECTURE.md)
* [1.5-CODING-PATTERNS.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/1.5-CODING-PATTERNS.md)
* [2-NEXTJS.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/2-NEXTJS.md)
* [3-CLEAN_CODE.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/3-CLEAN_CODE.md)
* [4-TESTING_GUIDELINES.md](file:///c:/Users/picar/Desktop/samson-website/.CORE_DOCUMENTATION/SERVERLESS_ARCHI/0-SYSTEM-DESIGN-V2/backend/4-TESTING_GUIDELINES.md)
  * **Rules**: Next.js Server Actions with Zod validations, return `{ success: boolean; data?: T; error?: string }`, handle transactions safely.

---

## Implementation Plan

### 1. Database & Type Definitions
- [ ] Verify `Appointment` table and queries return `timePreference` (Morning/Afternoon) and source tracking (e.g., `userId` vs `createdById` or metadata showing it came from patient portal vs secretary portal).
- [ ] Ensure TS types for `Appointment` include `timePreference: 'MORNING' | 'AFTERNOON' | null`.

### 2. Backend / Server Actions
- [ ] **Action**: Update `getClinicAppointmentsAction` or its use-case:
  - Query appointments with status `'PENDING'`.
  - Sort results: User-submitted requests (where `userId` is present or guest/inquiry-sourced) first, secretary-submitted requests last.
- [ ] **Action**: Update `updateAppointmentStatusAction` / `finishAppointmentReview`:
  - Accept `newStartTime` and `newEndTime` as strings (ISO or exact time).
  - Update status to `'CONFIRMED'` upon approval.

### 3. Frontend Custom Hook
- [ ] **Hook**: Update `use-secretary-pending-requests.ts`:
  - Remove all slot-related states (`editSlots`, `isLoadingEditSlots`, `getAvailableTimeSlotsAction` fetch).
  - Introduce state for `editStartTime` and `editEndTime` as manual string inputs.
  - In `toggleEditing`, initialize state with `selectedAppointment` values:
    - Pre-fill `editServiceId`, `editDoctorId` (leave empty if null), `editDate`.
    - Retrieve and map `timePreference` to display in the overview.
  - In `finishAppointmentReview`, validate that `editStartTime` and `editEndTime` are set and valid.

### 4. UI Components (`/secretary/sub-components`)
- [ ] **Overview**: Update `pending-request-overview.tsx` to display user's requested `timePreference` (e.g., "Requested: Morning" or "Requested: Afternoon").
- [ ] **Edit Panel**: Update `pending-edit-panel.tsx`:
  - Remove `SlotPicker`.
  - Add manual time inputs (Start Time & End Time) with clear labels and placeholder format (e.g., `09:15 AM`, `10:00 AM`).
  - Ensure doctor selector is blank/unselected if `doctorId` is not present in the request.
- [ ] **Form Validation**: Ensure secretary cannot submit without selecting a Doctor and filling in Start & End Times.

### 5. Verification & Testing
- [ ] Verify sorting: Submit a user request and a secretary request, ensure user request appears first.
- [ ] Verify confirmation: Confirm a request, check that status changes to `'CONFIRMED'` and exact start/end times are saved.
- [ ] Run typescript compiler and verify no linter/build errors.
