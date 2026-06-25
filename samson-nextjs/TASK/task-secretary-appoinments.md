# Checklist: Secretary Appointments Directory Development

Implement a clean, premium visual design following the Samson Dental design guidelines. Connect the frontend to live database server actions, matching the business logic specified in the system architecture and appointments directory plan.

## 📋 Architectural Constraints & Guidelines
- **Clean Architecture:** Use functional CQRS patterns for repository calls, functional dependency injection in use-cases, and streamlined server actions.
- **Strict Separation of Concerns:** Under no circumstance query or modify `PENDING`, `CHECKED_IN` or `TREATMENT_RENDERED` states on this page. 
- **Zod Schema Parsing:** Ensure all inputs are validated through Zod schema pipelines before executing DB updates.
- **Additive Development:** Develop new rescheduling/cancellation features side-by-side or cleanly separated; do not pollute unrelated hooks or modules.
- **Testing Standards:** Co-locate speculative specification tests directly next to any modified use-cases or components, adhering to the 80/15/5 testing pyramid rules.
- **Standard Formatters:** Display dates and times using the standard `formatShortDate` and `formatClinicTime` helpers from `@/shared/utils/date.util` to show time ranges as `Jun 30, 2026 | 9:00 AM – 9:30 AM`.

---

## 🛠️ Tasks

- [x] **Step 1: Repository Query Modification**
  - [x] Modify `getAppointmentsByClinicQuery` in `src/modules/appointments/repositories/clinic/clinic-appointments.queries.ts` to include `status_history` in its select statement to pull logs for the ledger history.

- [x] **Step 2: UI Tab & Filter Setup**
  - [x] Implement Two-Tab layout in `src/app/(portals)/secretary/appointments/page.tsx`:
    - **Tab 1: Upcoming** — Shows only `APPROVED` appointments.
    - **Tab 2: History** — Read-only archive of `COMPLETED`, `CANCELLED`, `REJECTED`, `DISPLACED`, `NO_SHOW` appointments.
  - [x] Integrate filters:
    - Search text bar: matches patient name, dependent name, doctor name, phone, email.
    - Date range filter: restricts by target appointment date using native `<input type="date">` inputs.
    - Doctor filter: dropdown list of doctors (fetched using `getDoctorsAction`).
  - [x] Format patient names:
    - Format dependent profiles: `DependentName (Dependent: HolderName)`.
    - Format guest profiles: `GuestName (Guest)`.
  - [x] **Use Date & Time formatters (`formatShortDate`, `formatClinicTime`) to display full time range (e.g. `Jun 30, 2026 | 9:00 AM – 9:30 AM`) in the table and details pane.**

- [x] **Step 3: Database Server Action Integration**
  - [x] Replace `useSecretary` mock appointments with `getClinicAppointmentsAction` live query.
  - [x] Handle separate fetch states for Upcoming (`APPROVED` status only) and History (other statuses) to respect strict boundaries.
  - [x] Exclude `PENDING` (owned by `/secretary/pending`) and `CHECKED_IN`/`TREATMENT_RENDERED` (owned by `/secretary/check-in`).

- [x] **Step 4: Detail Panel / Slide-Over**
  - [x] Display appointment summary details: Patient info, Service, Doctor, Date/Time, Source.
  - [x] Load and display immutable status history logs from `statusHistory` array.
  - [x] Connect Invoice/Receipt link for `COMPLETED` appointments.

- [x] **Step 5: Scheduling & Cancellation Actions**
  - [x] **Reschedule Action (Upcoming Tab):**
    - Render input controls for new Date, start/end Time, and Doctor.
    - Enforce a mandatory justification text note.
    - Trigger `updateAppointmentStatusAction` with `newDate`, `newStartTime`, `newEndTime`, `newDoctorId`, and `statusReason`.
  - [x] **Cancel Action (Upcoming Tab):**
    - Enforce a mandatory cancellation reason from a preset dropdown or custom input.
    - Trigger `updateAppointmentStatusAction` with status `'CANCELLED'` and the reason.
  - [x] Add loading indicators and try/catch error safety wrappers to prevent page crashes.

- [x] **Step 6: Verification & Safety**
  - [x] Verify RLS/ledger insertion works via Server Actions.
  - [x] Ensure manual validation tests are clean and do not break type safety.
