# Checklist: Secretary Pages Development

We will implement a clean, premium visual design following the Samson Dental design guidelines. All pages will use mock data layers and stub hooks (Mock-First Architecture) with dev mode toggles so the interface is fully interactive, responsive, and ready for future live integrations.

- [x] Step 1: Create Types and Mock Data files (`src/modules/staff/mocks/secretary.mock.ts` & `src/modules/staff/types/secretary.types.ts`)
- [x] Step 2: Implement Page Layout & Routing Setup in `src/app/(portals)/secretary`
  - [x] Dashboard (`/secretary`)
  - [x] Appointment Requests (`/secretary/pending`)
  - [x] Inquiries Queue (`/secretary/inquiries`)
  - [x] Book Appointment (`/secretary/book`)
  - [x] Appointments Directory (`/secretary/appointments`)
  - [x] Check-In / Out Tracker (`/secretary/check-in`)
  - [x] Invoice Management (`/secretary/invoices`)
  - [x] Email Log (`/secretary/emails`)
  - [x] Audit Log (`/secretary/audits`)
  - [x] Profile (`/secretary/profile`)
- [x] Step 3: Implement Shared UI Components & Hooks
- [x] Step 4: Verify UI Layout & Flow Correctness

## 🔄 Live Database & Server Action Hookup Tasks

### 🔌 Phase 1: Backend Server Actions (Do first)
- [x] **Patient Details for Staff Action**
  - Create `getPatientDetailsForStaffAction(patientId: string, dependentId?: string)` in `src/modules/patients/actions/profile/get-patient-details-for-staff.action.ts`
  - Restrict access to `SECRETARY` or `ADMIN` roles
  - Fetch patient profile (including `cancel_count`, `no_show_count`, `reschedule_count`) using `getPatientProfileForStaffQuery` (implemented in separate file to respect One File One Process)
  - Fetch patient appointments list using `getAppointmentsByUserQuery` and filter by `dependentId` if provided, to extract 5 latest appointments & completed count for the actual patient
- [x] **Doctor Schedule for Date Action**
  - Create `getDoctorScheduleAction(doctorId: string, date: string)` in `src/modules/appointments/actions/availability/get-doctor-schedule.action.ts`
  - Restrict access to `SECRETARY` or `ADMIN` roles
  - Fetch existing appointments using `getExistingAppointmentsQuery`
- [x] **Join Dependent Information**
  - Updated `getAppointmentsByClinicQuery` in `clinic-appointments.queries.ts` to fetch `dependent_id` details (name, relationship) so frontend can distinguish between account owner and dependent patient.

### 💻 Phase 2: Frontend Integration (`/secretary/pending`)
- [x] **Pending Requests List (Left Column)**
  - Replace mock data with live query fetching `getClinicAppointmentsAction({ status: 'PENDING' })`
- [x] **Request Details & Patient Profile (Right Column)**
  - Load and render selected patient account details (avatar, name, email, phone, contact details)
  - Display credibility/reliability scores: Completed, Cancellations, No-Shows, Reschedules
  - Display requested appointment details (service, assigned doctor, date, time)
  - Render patient notes/remarks for the appointment request
  - Render patient's past history (latest 5 appointments with date, service, doctor, status)
- [x] **Doctor Daily Timeline Visualizer**
  - Load doctor schedule for the requested date using `getDoctorScheduleAction`
  - Render timeline showing occupied slots to verify potential conflicts visually
- [x] **Decision & Status Finalization**
  - Connect "Approve" button to call `updateAppointmentStatusAction` with status `'APPROVED'` and predefined/custom reasons
  - Connect "Reject" button to call `updateAppointmentStatusAction` with status `'REJECTED'` and custom reason
  - Keep "Displace" button present but performing no action

### 🔒 Phase 3: Validation, Overlaps, and Security
- [x] **Patient Booking Overlap Warning Banner**
  - Detect active overlapping appointments for the same patient on the same day in `/secretary/pending` detail panel.
  - Display a prominent glassmorphic warning banner when a schedule conflict is found.
- [x] **Mandatory Justification Remarks & Dropdowns**
  - Enforce mandatory comments/reasons in the status update action schema (`updateAppointmentStatusAction`).
  - Provide a clean `<Select>` dropdown with template reasons for Approved, Rejected, and Displaced states, plus a custom write-in `<Textarea>`.
- [x] **Ledger RLS Bypass**
  - Resolved status transition RLS errors by executing ledger insertions using `createAdminClient()`.


