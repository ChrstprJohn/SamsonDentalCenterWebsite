# Graph Report - samson-nextjs  (2026-06-22)

## Corpus Check
- 656 files · ~544,626 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1924 nodes · 4164 edges · 121 communities (102 shown, 19 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7cf8ecfe`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 121|Community 121]]
- [[_COMMUNITY_Community 122|Community 122]]
- [[_COMMUNITY_Community 123|Community 123]]
- [[_COMMUNITY_Community 125|Community 125]]

## God Nodes (most connected - your core abstractions)
1. `createClient` - 80 edges
2. `DomainError` - 72 edges
3. `AppointmentDto` - 65 edges
4. `getAuthenticatedUser()` - 49 edges
5. `authorizeRole()` - 48 edges
6. `Button()` - 43 edges
7. `useToast()` - 34 edges
8. `ServiceResponseDto` - 32 edges
9. `getClinicConfigAction()` - 28 edges
10. `formatShortDate()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `submitBookingAction()` --calls--> `addDependentCommand()`  [INFERRED]
  src/modules/appointments/actions/booking/submit-booking.action.ts → src/modules/patients/repositories/dependents/patient-dependents.commands.ts
- `AppointmentHistoryProps` --references--> `AppointmentDto`  [EXTRACTED]
  src/modules/appointments/components/dashboard/appointment-history.tsx → src/modules/appointments/dtos/shared/appointment.dto.ts
- `AppointmentSummaryCardProps` --references--> `AppointmentDto`  [EXTRACTED]
  src/modules/appointments/components/dashboard/appointment-summary-card.tsx → src/modules/appointments/dtos/shared/appointment.dto.ts
- `AppointmentTeaserCardProps` --references--> `AppointmentDto`  [EXTRACTED]
  src/modules/appointments/components/dashboard/appointment-teaser-card.tsx → src/modules/appointments/dtos/shared/appointment.dto.ts
- `PendingApprovalsProps` --references--> `AppointmentDto`  [EXTRACTED]
  src/modules/appointments/components/dashboard/pending-approvals.tsx → src/modules/appointments/dtos/shared/appointment.dto.ts

## Import Cycles
- None detected.

## Communities (121 total, 19 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.33
Nodes (5): AvailabilityMapDto, availabilityMapSchema, emptyStringToUndefined, getAvailableDaysResponseSchema, availableSlotSchema

### Community 1 - "Community 1"
Cohesion: 0.33
Nodes (7): BookingProgressTabs(), BookingProgressTabsProps, ReviewStep(), useUserBooking(), getPatientName(), getPatientRelationship(), BookingView()

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (39): FinalizeInvoiceDto, finalizeInvoiceSchema, GenerateInvoiceDto, GenerateInvoiceSchema, generateInvoiceUseCase(), GetInvoicesDto, GetInvoicesSchema, getInvoicesUseCase() (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (30): loginAction(), loginCommand(), LoginInput, loginSchema, LoginForm(), LoginFormProps, loginUseCase(), logoutAction() (+22 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (14): createStaffAction(), terminateStaffAction(), updateStaffAction(), authorizeRole(), ROLE_HIERARCHY, getClinicAppointmentsAction(), { mockGetClinicAppointments }, UnauthorizedError (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (14): createInquiryCommand(), dropInquiryCommand(), cleanOptionalString, DropInquiryDto, dropInquirySchema, dropInquiryUseCase(), submitInquiryAction(), cleanOptionalString (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (21): mockFrom, mockInsert, mockSelect, mockSingle, mockSupabase, getAuditLogsQuery(), mockEq, mockFrom (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (23): cleanOptionalString, emptyStringToUndefined, submitBookingSchema, CreateDependentDto, createDependentSchema, DependentRelationship, dependentRelationshipEnum, createDependentUseCase() (+15 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (15): getAvailableDaysAction(), { mockGetAvailableDays }, { mockGetAvailableDaysUseCase, mockGetServiceDuration }, GetAvailableDaysDto, getAvailableDaysSchema, getAvailableDaysUseCase(), getDoctorSchedulesQuery(), getExistingAppointmentsForMonthQuery() (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.04
Nodes (44): dependencies, @base-ui/react, class-variance-authority, clsx, framer-motion, @hookform/resolvers, lucide-react, next (+36 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (24): AboutSection(), doctorsData, galleryItems, GallerySection(), PortfolioCardProps, portfolioItems, repeatedPortfolioItems, HeroSectionProps (+16 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (8): capitalize(), isDefined(), getErrorMessage(), isError(), omit(), sleep(), slugify(), generateId()

### Community 12 - "Community 12"
Cohesion: 0.16
Nodes (16): AppointmentHistory(), AppointmentHistoryProps, AppointmentTeaserCard(), AppointmentTeaserCardProps, PendingApprovals(), PendingApprovalsProps, UpcomingAppointments(), UpcomingAppointmentsProps (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (11): DateTimeStep(), DateTimeStepProps, GetAllUsersDto, getAllUsersSchema, UserProfileResponseDto, userProfileResponseSchema, getAllUsersUseCase(), getAllUsersQuery() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (17): getServicesByIdsQuery(), { mockExecute }, submitTreatmentAction(), servicePerformedSchema, SubmitTreatmentDto, submitTreatmentSchema, mockFrom, mockIn (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (51): AdminPortalLayout(), AdminDashboardPage(), DEFAULT_CONFIG, metadata, metadata, PatientAppointmentsPage(), AuthenticatedUserHeader(), AuthenticatedUserHeaderProps (+43 more)

### Community 16 - "Community 16"
Cohesion: 0.07
Nodes (30): resendAuthOtpCommand(), verifyOtpCommand(), checkUserExistsQuery(), ResendOtpDeps, resendOtpUseCase(), resendOtpAction(), verifyOtpAction(), VerifyOtpInput (+22 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (15): cancelAppointmentAction(), { mockExecuteAtomicCancel }, { mockUpdateStatus }, cancelAppointmentAtomicCommand(), cancelAppointmentUseCase(), getAppointmentByIdQuery(), incrementUserCredibilityMetricCommand(), insertLedgerEntryCommand() (+7 more)

### Community 18 - "Community 18"
Cohesion: 0.32
Nodes (6): updateServiceCommand(), mocks, updateServiceAction(), UpdateServiceDto, updateServiceSchema, updateServiceUseCase()

### Community 19 - "Community 19"
Cohesion: 0.06
Nodes (33): 1. Staff Module Tests, 2. Appointments Module Tests, 3. UI View Tests, 4. Services Module Tests, [ ] `src/modules/appointments/components/booking/date-time-step.spec.tsx` (New), [ ] `src/modules/appointments/dtos/availability/appointment-response.dto.spec.ts` (New), [ ] `src/modules/appointments/dtos/availability/doctor-schedule-response.dto.spec.ts` (New), [ ] `src/modules/appointments/hooks/booking/use-booking-data.spec.ts` (Update) (+25 more)

### Community 20 - "Community 20"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (5): DomainError, NotFoundError, ValidationError, mapAppointmentRecord(), AppointmentStatusValue

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (9): updateDoctorScheduleAction(), DayOfWeekEnum, DayOfWeekMap, DoctorScheduleDto, doctorScheduleSchema, timeStringSchema, StaffScheduleCommands, upsertScheduleCommand() (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (9): ProfileDetailsForm(), ProfileDetailsFormProps, ProfilePreferencesForm(), ProfilePreferencesFormProps, InitialUser, useProfileSettingsView(), metadata, ProfileSettingsView() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.07
Nodes (33): AuditRecord, calculateFinalPrice(), DraftInvoice, EmailLog, INITIAL_AUDITS, INITIAL_DRAFTS, INITIAL_EMAILS, INITIAL_PENDING (+25 more)

### Community 25 - "Community 25"
Cohesion: 0.17
Nodes (9): CreateStaffDto, createStaffUseCase(), createStaffCommand(), StaffProfileCommands, terminateStaffCommand(), updateStaffCommand(), StaffProfileDto, UpdateStaffDto (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.12
Nodes (16): 🚨 Architecture Audit Fixes (Completed), ✅ DONE (Completed Tasks), 💡 Next Steps Guide:, ✅ Phase 1: Shared Core (Global Kernel) - COMPLETED, ✅ Phase 2: Patients Domain (Backend) - COMPLETED, ✅ Phase 3: Staff Domain (Backend) - COMPLETED, ✅ Phase 4: Appointments Domain (Backend) - COMPLETED, Phase 5: Services & Clinic Config Domain (+8 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (16): 1. `clinic-config` Module, 2. `audit-logs` Module, 3. `services` Module, 4. `staff` Module, 5. `patients` Module, 6. `appointments` Module, 7. `billing` Module, Functional & Zod Pipeline Refactoring Checklist (+8 more)

### Community 28 - "Community 28"
Cohesion: 0.11
Nodes (18): 1. DTO Layer (`src/modules/appointments/dtos/booking/`), 1. Why Email IS Required on the Public Inquiry Form, 2. Repository Layer (`src/modules/appointments/repositories/booking/`), 2. Why Email should be OPTIONAL for the Secretary's Manual Booking, 3. Database Rules, 3. Use Case Layer (`src/modules/appointments/use-cases/booking/`), 4. Server Action Layer (`src/modules/appointments/actions/booking/`), Backend Implementation Tasks (Modulith Architecture) (+10 more)

### Community 29 - "Community 29"
Cohesion: 0.20
Nodes (7): assignDoctorServicesSchema, createStaffSchema, StaffRoleEnum, mapStaffProfile(), MaybeRecord, staffProfileSchema, updateStaffSchema

### Community 30 - "Community 30"
Cohesion: 0.19
Nodes (5): DeactivateUserDto, deactivateUserSchema, deactivateUserUseCase(), deactivateUserCommand(), UserManagementCommands

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (10): EmailTemplates, resend, ResendService, AppointmentBookedEventDto, appointmentBookedEventSchema, AppointmentConvertedEventDto, appointmentConvertedEventSchema, onAppointmentBookedSubscriber (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (11): geistMono, geistSans, josefinSans, jost, metadata, playfair, Theme, ThemeContext (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.09
Nodes (24): mockEq, mockFrom, mockSelect, mockSingle, mockSupabase, mockUpdate, updateClinicConfigCommand(), clinicConfigAppSchema (+16 more)

### Community 34 - "Community 34"
Cohesion: 0.18
Nodes (18): ExistingDependentSelector(), ExistingDependentSelectorProps, MOCK_DEPENDENTS, PatientDetailsStep(), PatientDetailsStepProps, AppointmentSummaryCard(), AppointmentSummaryCardProps, DependentProfileDto (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.18
Nodes (10): getAvailableTimeSlotsAction(), { mockGetAvailableTimeSlots }, { mockGetAvailableTimeSlotsUseCase, mockGetServiceDuration }, AvailableSlotDto, emptyStringToUndefined, GetAvailableTimeSlotsDto, getAvailableTimeSlotsResponseSchema, getAvailableTimeSlotsSchema (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.24
Nodes (7): getExistingAppointmentsQuery(), AppointmentBookingCommands, createAppointmentCommand(), executeBookingTransactionCommand(), submitBookingAction(), SubmitBookingDto, submitBookingUseCase()

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (16): getAuthenticatedUser(), { mockConvertInquiry, mockGetServiceDuration }, { mockCreateManualBooking, mockGetServiceDuration }, dropInquiryAction(), { mockDropInquiry }, { mockSubmitBooking }, { mockSubmitBooking, mockGetServiceDuration }, createClient (+8 more)

### Community 38 - "Community 38"
Cohesion: 0.08
Nodes (30): AuditLogItem, DoctorCrudItem, INITIAL_DOCTORS, INITIAL_SERVICES, MOCK_AUDITS, ServiceCrudItem, useAdminDashboard(), UseAdminDashboardProps (+22 more)

### Community 39 - "Community 39"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (3): getStaffProfileUseCase(), getProfileByIdQuery(), StaffProfileQueries

### Community 41 - "Community 41"
Cohesion: 0.25
Nodes (8): GetAvailableTimeSlotsResponseDto, createManualBookingAction(), createManualBookingCommand(), cleanOptionalString, CreateManualBookingDto, createManualBookingSchema, emailOrEmpty, createManualBookingUseCase()

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (10): 🛠️ Phase 0: System Scaffolding & Shared Kernel UI, 🔐 Phase 1: Authentication & Account Access Flow, 🎨 Phase 2: Public Landing Experience & Marketing, 🗓️ Phase 3: Patient Booking Wizard (Booking Domain), 👤 Phase 4: Patient User Portal, 👩‍💼 Phase 5: Secretary Portal, 🩺 Phase 6: Doctor Portal, 👑 Phase 7: Clinic Admin & Configuration Portal (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.31
Nodes (3): AssignDoctorServicesDto, assignDoctorServicesUseCase(), DoctorServicesCommands

### Community 44 - "Community 44"
Cohesion: 0.20
Nodes (9): 1. Patient Login (`login.action.ts`), 2. Verify OTP / Resend OTP (`verify-otp.action.ts`), 3. Forgot Password Request (`request-password-reset.action.ts`), 4. Reset Password Execution (`reset-password.action.ts`), 5. Event Subscriber & Email Sender Documentation Mismatch, 6. Folder Naming Convention, 🛠️ Action Plan for Remediation, Codebase & Architecture Audit: Auth & Event Modules (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.15
Nodes (12): useUserDashboardSummary(), DashboardQuickActions(), DashboardQuickActionsProps, DashboardRecentNotifications(), DashboardRecentNotificationsProps, NotificationItem, DashboardUpcomingWidget(), DashboardUpcomingWidgetProps (+4 more)

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (8): Issue Summary, Phase 1: Fix Service Step Rendering, Phase 2.5: Optimize Latency & Remove Slot Holding (Business Plan Alignment), Phase 2: Align Step 2 with Business Plan (Doctor Selection), Phase 3: Architectural Audit Fixes (V2 Compliance), Phase 4: End-to-End Verification, Task: Booking Flow Alignment & Service Fixes, To-Do List

### Community 47 - "Community 47"
Cohesion: 0.33
Nodes (6): checkoutAction(), finalizeInvoiceAction(), finalizeInvoiceUseCase(), finalizeInvoiceCommand(), createAuditLogCommand(), checkoutOrchestrator()

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (9): 1. 🔴 Fix Sequential Waterfall in `getAvailableDays` (HIGH — ~100-300ms saved), 2. 🔴 Eliminate Duplicate `getServiceDuration` Calls (HIGH — ~50-100ms saved), 3. 🟡 Return Slots Map to Eliminate Date-Selection Round-Trip (MEDIUM — ~200-500ms saved per click), 4. 🟡 Add Server-Side Caching for Semi-Static Data (MEDIUM — ~200-500ms saved after first load), 5. 🟡 Fix Redundant Re-fetches on Doctor Change in Hook (MEDIUM — eliminates wasted requests), 7. 🟢 Optimize Date Object Allocations in Slot Generation (LOW — ~5-15ms saved), 8. 🟢 Verify Supabase Client Pooling (LOW — ~10ms saved), 🏎️ Booking Availability — Performance Improvements (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.12
Nodes (20): metadata, useToast(), ActivePatient, AvailableServiceItem, CLINIC_SERVICES, INITIAL_QUEUE, PatientHistoryRecord, useDoctorDashboard() (+12 more)

### Community 50 - "Community 50"
Cohesion: 0.13
Nodes (13): DashboardNotification, INITIAL_MOCK_NOTIFICATIONS, NotificationsView(), metadata, INITIAL_MOCK_NOTIFICATIONS, useNotifications(), NotificationData, NotificationItemCard() (+5 more)

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (7): 1. Authentication & Users Domain, 2. Dependents Domain, 3. Appointments & Booking Domain (Most Complex), 4. Clinic Config & Services Domain, 5. Billing & Clinical Treatment Domain, 6. Audit Logs Domain, 🔄 Phase 8: Mock Swap & Schema Alignment Checklist

### Community 52 - "Community 52"
Cohesion: 0.18
Nodes (10): getServiceByIdAction(), mocks, getServiceByIdUseCase(), getServiceByIdQuery(), mockEq, mockFrom, mockMaybeSingle, mockOrder (+2 more)

### Community 53 - "Community 53"
Cohesion: 0.57
Nodes (3): updateSession(), proxy(), ROLE_PERMISSIONS

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (6): 1. `landing-view.tsx` God Component Violation, 2. `profile-settings-view.tsx` State Management Violation, 3. Missing Forgot Password Flow in UI, Audit Findings, Frontend Architecture Audit & Remediation, Remediation Checklist

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (6): 1. Fix OTP Length Mismatch (Support 8-Digit Codes), 2. Remove Magic Link / OTP Login Options, 3. Verify & Guarantee Sign-Up Atomicity, 📋 Instructions to Change OTP Length in Supabase Dashboard, 🛠️ Planned Tasks, 📝 Task List: Improving and Fixing Patient Sign-Up & Authentication Flow

### Community 57 - "Community 57"
Cohesion: 0.18
Nodes (14): BookingFooterControls(), BookingFooterControlsProps, ServiceCardProps, PendingBooking, cn(), FamilyGroupRow(), FamilyGroupRowProps, IndividualBookingRow() (+6 more)

### Community 58 - "Community 58"
Cohesion: 0.19
Nodes (8): mockAddToast, mockGet, Toast, ToastContext, ToastContextType, useOTPVerifyView(), UseOTPVerifyViewReturn, OTPVerifyView()

### Community 59 - "Community 59"
Cohesion: 0.10
Nodes (23): CancelAppointmentModal(), CancelAppointmentModalProps, useAppointmentDetail(), UseAppointmentDetailProps, AppointmentDetailPage(), metadata, PageProps, MOCK_APPOINTMENTS (+15 more)

### Community 60 - "Community 60"
Cohesion: 0.25
Nodes (7): Option 1: Automated Background Worker (Recommended), Option 2: Admin/Secretary Dashboard Manual Retry, Option 3: Supabase Database Webhooks + Edge Functions, Outbox Email Retry Polish Recommendations, Tasks:, Tasks:, Tasks:

### Community 61 - "Community 61"
Cohesion: 0.40
Nodes (4): 🟢 1. Backend Architecture (High Compliance), 🔴 2. Frontend Architecture (Action Required), Architectural Audit Report: Samson Dental System Design V2, 📋 Next Steps & Recommendations

### Community 62 - "Community 62"
Cohesion: 0.40
Nodes (4): 1. God Component Violations (>150 Lines Rule), 2. Mock Data & Missing Backend Connections, 3. State Management & Hooks Extraction, 🚨 Appointments Module Architecture Audit & Fixes

### Community 63 - "Community 63"
Cohesion: 0.40
Nodes (4): name, organization_id, organization_slug, ref

### Community 64 - "Community 64"
Cohesion: 0.15
Nodes (12): 1. Database Schema & Migrations, 2. Seed Data Alignment, 3. Database RPC & Transaction Functions, 4.1. Guest Inquiry Flow (Landing Page Form), 4.2. Inquiry Conversion Flow (Secretary Dashboard Form), 4.3. Existing Appointment & DTO Schema Alignment, 4.4. Testing & Validation Specs, 4. Codebase, DTOs & Test Files (+4 more)

### Community 65 - "Community 65"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 66 - "Community 66"
Cohesion: 0.16
Nodes (11): RescheduleBlockedModal(), RescheduleBlockedModalProps, useClickOutside(), BookingApprovalModal(), BookingApprovalModalProps, BookingRejectionModal(), BookingRejectionModalProps, ActiveInvoiceData (+3 more)

### Community 71 - "Community 71"
Cohesion: 0.15
Nodes (11): mockAddToast, mockPush, appointmentDbSchema, appointmentDoctorDbSchema, appointmentDoctorSchema, appointmentDtoSchema, appointmentPatientDbSchema, appointmentPatientSchema (+3 more)

### Community 86 - "Community 86"
Cohesion: 0.10
Nodes (19): Appointment Summary Section, CTA Button, Database RPC / Outbox Payload, Dependent Booking — Additional Fields:, Design Principle, Email Content Requirements, Email Template (`appointment-booked-email.tsx`), Footer (+11 more)

### Community 88 - "Community 88"
Cohesion: 0.15
Nodes (13): appointmentDbSchema, AppointmentResponseDto, appointmentResponseSchema, GeneratedSlot, GenerateSlotsParams, WorkingScheduleMonthItem, GetAvailableDaysResponseDto, AppointmentInput (+5 more)

### Community 90 - "Community 90"
Cohesion: 0.21
Nodes (7): ClinicAppointmentsQueries, getAppointmentsByClinicQuery(), emptyStringToUndefined, GetClinicAppointmentsDto, getClinicAppointmentsSchema, getClinicAppointmentsUseCase(), mapAppointmentRecords()

### Community 94 - "Community 94"
Cohesion: 0.27
Nodes (7): getServiceDurationQuery(), convertInquiryToAppointmentCommand(), convertInquiryAction(), cleanOptionalString, ConvertInquiryDto, convertInquirySchema, convertInquiryUseCase()

### Community 96 - "Community 96"
Cohesion: 0.13
Nodes (14): Appointments Module, Appointments Module, Billing Module, Comprehensive Architecture Audit Checklist, Invalid File Naming Conventions, Invalid Layer Placement / Mock File Placement, Patients Module, Patients Module (+6 more)

### Community 98 - "Community 98"
Cohesion: 0.28
Nodes (6): createServiceAction(), mocks, CreateServiceDto, createServiceSchema, createServiceUseCase(), createServiceCommand()

### Community 99 - "Community 99"
Cohesion: 0.09
Nodes (16): doctorScheduleDbSchema, DoctorScheduleResponseDto, doctorScheduleResponseSchema, GetAppointmentByIdDto, getAppointmentByIdSchema, CancelAppointmentDto, cancelAppointmentSchema, RequestRescheduleDto (+8 more)

### Community 100 - "Community 100"
Cohesion: 0.18
Nodes (13): BookingSuccessView(), BookingSuccessViewProps, createBookingPayload(), PayloadMapperParams, useBookingState(), BookingSlot, BookingStep, UseUserBookingReturn (+5 more)

### Community 102 - "Community 102"
Cohesion: 0.26
Nodes (8): AddDependentModal(), AddDependentModalProps, ReviewStepProps, NewDependentInput, ReviewContactDetails(), ReviewContactDetailsProps, ReviewPatientDetails(), ReviewPatientDetailsProps

### Community 103 - "Community 103"
Cohesion: 0.18
Nodes (11): ServiceStep(), ServiceStepProps, CARD_SERVICES, LIST_SERVICES, ServicesSection(), ServicesSectionProps, serviceDbSchema, ServiceResponseDto (+3 more)

### Community 104 - "Community 104"
Cohesion: 0.26
Nodes (8): BookingPage(), metadata, getUserDependentsAction(), getServicesAction(), mocks, getServicesUseCase(), getServicesQuery(), getPatientProfileAction()

### Community 105 - "Community 105"
Cohesion: 0.31
Nodes (3): getPatientAppointmentsUseCase(), getAppointmentsByUserQuery(), PatientAppointmentsQueries

### Community 106 - "Community 106"
Cohesion: 0.36
Nodes (4): deleteServiceAction(), mocks, deleteServiceUseCase(), deleteServiceCommand()

### Community 107 - "Community 107"
Cohesion: 0.22
Nodes (6): assignDoctorServicesCommand(), mockDelete, mockEq, mockFrom, mockInsert, mockSupabase

### Community 108 - "Community 108"
Cohesion: 0.20
Nodes (9): Overview, Phase 1: Sidebar & Navigation Updates, Phase 2: Patient Dashboard Refactor, Phase 3: My Appointments Page & Tabs, Phase 4: Notifications Hub Scaffold, Phase 5: Account Settings Consolidation, Phase 6: Verification, Task: Patient Portal Navigation & Layout Refactor (+1 more)

### Community 109 - "Community 109"
Cohesion: 0.25
Nodes (7): mockEq, mockFrom, mockInsert, mockSelect, mockSingle, mockSupabase, mockUpdate

### Community 110 - "Community 110"
Cohesion: 0.22
Nodes (8): 1. Add Instant Loading State (`loading.tsx`), 2. Parallelize Data Fetching, 3. Optimize the Appointment Detail View Loading, 4. Optimize Server Action Connection Overhead, ⏳ In Progress, Overview, 📋 Proposed Tasks (No Caching), Task: Appointment Details Performance Improvements

### Community 111 - "Community 111"
Cohesion: 0.22
Nodes (8): 1. Predefined & Custom Cancellation Reasons, 2. Stale UI State and Re-cancellation Prevention (Details/Dashboard Views), 3. Status History Ledger Integration (Audit Trail), 4. Conflicting UI Banner logic for Appointments, 5. Rescheduling Flow Adjustments, 6. Audit & Edge Case Check for Booking Funnel, 7. Atomic Cancellation (Prevent Multiple Cancellations), Appointment Module Bugfix & Enhancement Checklist

### Community 112 - "Community 112"
Cohesion: 0.07
Nodes (28): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+20 more)

### Community 118 - "Community 118"
Cohesion: 0.67
Nodes (3): ServiceCard(), formatPrice(), getEmoji()

### Community 120 - "Community 120"
Cohesion: 0.40
Nodes (4): 1. Update Appointment Status, 2. Request Reschedule, 3. Submit Treatment, Non-Atomic Database Transaction Bugs

### Community 121 - "Community 121"
Cohesion: 0.40
Nodes (4): Appointment Statuses & Ledger Implementation Tasks, Phase 1: Database Schema Updates (Completed), Phase 2: Architectural Refactoring (Completed), Phase 3: "Hold and Swap" Reschedule Pattern (Completed)

### Community 122 - "Community 122"
Cohesion: 0.50
Nodes (3): 📋 Done, ⏳ In Progress, Task: Patient Portal Backend Database Integration & Clean Architecture

## Knowledge Gaps
- **567 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+562 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient` connect `Community 37` to `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 8`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 22`, `Community 23`, `Community 33`, `Community 35`, `Community 36`, `Community 41`, `Community 47`, `Community 52`, `Community 94`, `Community 98`, `Community 104`, `Community 106`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 57` to `Community 1`, `Community 66`, `Community 3`, `Community 100`, `Community 102`, `Community 38`, `Community 10`, `Community 12`, `Community 45`, `Community 15`, `Community 49`, `Community 50`, `Community 23`, `Community 24`, `Community 58`, `Community 59`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `DomainError` connect `Community 21` to `Community 3`, `Community 4`, `Community 35`, `Community 37`, `Community 36`, `Community 8`, `Community 41`, `Community 6`, `Community 107`, `Community 14`, `Community 47`, `Community 16`, `Community 17`, `Community 22`, `Community 25`, `Community 94`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _567 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05290490100616683 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06398809523809523 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.1443850267379679 - nodes in this community are weakly interconnected._