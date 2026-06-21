# Graph Report - samson-nextjs  (2026-06-21)

## Corpus Check
- 614 files · ~505,164 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1804 nodes · 3881 edges · 120 communities (103 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0f3fa6c0`
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
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 121|Community 121]]
- [[_COMMUNITY_Community 122|Community 122]]
- [[_COMMUNITY_Community 123|Community 123]]
- [[_COMMUNITY_Community 125|Community 125]]

## God Nodes (most connected - your core abstractions)
1. `createClient` - 73 edges
2. `DomainError` - 68 edges
3. `AppointmentDto` - 65 edges
4. `authorizeRole()` - 48 edges
5. `Button()` - 43 edges
6. `getAuthenticatedUser()` - 40 edges
7. `useToast()` - 34 edges
8. `ServiceResponseDto` - 32 edges
9. `getClinicConfigAction()` - 28 edges
10. `formatShortDate()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `submitBookingAction()` --calls--> `addDependentCommand()`  [INFERRED]
  src/modules/appointments/actions/booking/submit-booking.action.ts → src/modules/patients/repositories/dependents/patient-dependents.commands.ts
- `AppointmentHistoryProps` --references--> `AppointmentDto`  [EXTRACTED]
  src/modules/appointments/components/dashboard/appointment-history.tsx → src/modules/appointments/dtos/shared/appointment.dto.ts
- `AppointmentTeaserCardProps` --references--> `AppointmentDto`  [EXTRACTED]
  src/modules/appointments/components/dashboard/appointment-teaser-card.tsx → src/modules/appointments/dtos/shared/appointment.dto.ts
- `CancelAppointmentModalProps` --references--> `AppointmentDto`  [EXTRACTED]
  src/modules/appointments/components/dashboard/cancel-appointment-modal.tsx → src/modules/appointments/dtos/shared/appointment.dto.ts
- `PendingApprovalsProps` --references--> `AppointmentDto`  [EXTRACTED]
  src/modules/appointments/components/dashboard/pending-approvals.tsx → src/modules/appointments/dtos/shared/appointment.dto.ts

## Import Cycles
- None detected.

## Communities (120 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (9): AvailabilityMapDto, availabilityMapSchema, emptyStringToUndefined, GetAvailableDaysDto, GetAvailableDaysResponseDto, getAvailableDaysResponseSchema, getAvailableDaysSchema, getAvailableDaysUseCase() (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.38
Nodes (6): BookingProgressTabs(), BookingProgressTabsProps, useUserBooking(), getPatientName(), getPatientRelationship(), BookingView()

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (40): FinalizeInvoiceDto, finalizeInvoiceSchema, finalizeInvoiceUseCase(), GenerateInvoiceDto, GenerateInvoiceSchema, generateInvoiceUseCase(), GetInvoicesDto, GetInvoicesSchema (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (30): loginAction(), loginCommand(), LoginInput, loginSchema, LoginForm(), LoginFormProps, loginUseCase(), logoutAction() (+22 more)

### Community 4 - "Community 4"
Cohesion: 0.21
Nodes (10): createStaffAction(), terminateStaffAction(), authorizeRole(), ROLE_HIERARCHY, getClinicAppointmentsAction(), { mockGetClinicAppointments }, updateDoctorScheduleAction(), generateInvoiceAction() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (22): AdminPortalLayout(), AdminDashboardPage(), DEFAULT_CONFIG, metadata, metadata, PatientAppointmentsPage(), BookingLayout(), DoctorPortalLayout() (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (22): mockFrom, mockInsert, mockSelect, mockSingle, mockSupabase, getAuditLogsQuery(), mockEq, mockFrom (+14 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (23): cleanOptionalString, emptyStringToUndefined, submitBookingSchema, CreateDependentDto, createDependentSchema, DependentRelationship, dependentRelationshipEnum, createDependentUseCase() (+15 more)

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (9): getAvailableDaysAction(), { mockGetAvailableDays }, { mockGetAvailableDaysUseCase, mockGetServiceDuration }, getAvailableTimeSlotsAction(), { mockGetAvailableTimeSlots }, { mockGetAvailableTimeSlotsUseCase, mockGetServiceDuration }, getExistingAppointmentsQuery(), getWorkingSchedulesForMonthQuery() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.04
Nodes (44): dependencies, @base-ui/react, class-variance-authority, clsx, framer-motion, @hookform/resolvers, lucide-react, next (+36 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (15): AboutSection(), galleryItems, GallerySection(), HeroSectionProps, HeroSectionV1(), HeroSectionProps, HeroSectionV2(), JourneySection() (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (8): capitalize(), isDefined(), getErrorMessage(), isError(), omit(), sleep(), slugify(), generateId()

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (18): AppointmentHistory(), AppointmentHistoryProps, AppointmentTeaserCard(), AppointmentTeaserCardProps, PendingApprovals(), PendingApprovalsProps, UpcomingAppointments(), UpcomingAppointmentsProps (+10 more)

### Community 13 - "Community 13"
Cohesion: 0.16
Nodes (9): DateTimeStepProps, GetAllUsersDto, getAllUsersSchema, UserProfileResponseDto, userProfileResponseSchema, getAllUsersUseCase(), getAllUsersQuery(), UserManagementQueries (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (17): getServicesByIdsQuery(), { mockExecute }, submitTreatmentAction(), servicePerformedSchema, SubmitTreatmentDto, submitTreatmentSchema, mockFrom, mockIn (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (19): AuthenticatedUserHeader(), AuthenticatedUserHeaderProps, NAV_LINKS, NotificationIndicator(), NotificationIndicatorProps, AuthHeaderUser, getInitials(), useAuthHeader() (+11 more)

### Community 16 - "Community 16"
Cohesion: 0.06
Nodes (36): resendAuthOtpCommand(), verifyOtpCommand(), checkUserExistsQuery(), ResendOtpDeps, resendOtpUseCase(), resendOtpAction(), verifyOtpAction(), VerifyOtpInput (+28 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (16): cancelAppointmentAction(), { mockExecuteAtomicCancel }, { mockUpdateStatus }, cancelAppointmentAtomicCommand(), cancelAppointmentUseCase(), getAppointmentByIdQuery(), incrementUserCredibilityMetricCommand(), insertLedgerEntryCommand() (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.09
Nodes (23): createServiceAction(), mocks, CreateServiceDto, createServiceSchema, createServiceUseCase(), deleteServiceAction(), mocks, deleteServiceUseCase() (+15 more)

### Community 19 - "Community 19"
Cohesion: 0.06
Nodes (33): 1. Staff Module Tests, 2. Appointments Module Tests, 3. UI View Tests, 4. Services Module Tests, [ ] `src/modules/appointments/components/booking/date-time-step.spec.tsx` (New), [ ] `src/modules/appointments/dtos/availability/appointment-response.dto.spec.ts` (New), [ ] `src/modules/appointments/dtos/availability/doctor-schedule-response.dto.spec.ts` (New), [ ] `src/modules/appointments/hooks/booking/use-booking-data.spec.ts` (Update) (+25 more)

### Community 20 - "Community 20"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (8): updateStaffAction(), DomainError, NotFoundError, UnauthorizedError, ValidationError, assignDoctorServicesAction(), mapAppointmentRecord(), AppointmentStatusValue

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (8): DayOfWeekEnum, DayOfWeekMap, DoctorScheduleDto, doctorScheduleSchema, timeStringSchema, StaffScheduleCommands, upsertScheduleCommand(), updateDoctorScheduleUseCase()

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (9): ProfileDetailsForm(), ProfileDetailsFormProps, ProfilePreferencesForm(), ProfilePreferencesFormProps, InitialUser, useProfileSettingsView(), metadata, ProfileSettingsView() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.11
Nodes (19): AuditRecord, calculateFinalPrice(), DraftInvoice, EmailLog, INITIAL_AUDITS, INITIAL_DRAFTS, INITIAL_EMAILS, INITIAL_PENDING (+11 more)

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
Cohesion: 0.20
Nodes (12): AppointmentSummaryCard(), AppointmentSummaryCardProps, MOCK_APPOINTMENTS, AppointmentDto, AppointmentScheduleCard(), AppointmentScheduleCardProps, RescheduleDetails(), RescheduleDetailsProps (+4 more)

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (8): createStaffSchema, StaffRoleEnum, mapStaffProfile(), MaybeRecord, staffProfileSchema, TerminateStaffDto, terminateStaffSchema, updateStaffSchema

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (5): DeactivateUserDto, deactivateUserSchema, deactivateUserUseCase(), deactivateUserCommand(), UserManagementCommands

### Community 31 - "Community 31"
Cohesion: 0.32
Nodes (6): updateClinicConfigCommand(), mocks, updateClinicConfigAction(), UpdateClinicConfigDto, updateClinicConfigSchema, updateClinicConfigUseCase()

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (10): geistMono, geistSans, josefinSans, jost, metadata, playfair, Theme, ThemeContext (+2 more)

### Community 33 - "Community 33"
Cohesion: 0.16
Nodes (12): clinicConfigAppSchema, clinicConfigDbSchema, clinicConfigResponseSchema, operatingDayDbSchema, operatingDaySchema, operatingHoursDbSchema, operatingHoursSchema, socialLinkSchema (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.24
Nodes (13): AddDependentModal(), AddDependentModalProps, ExistingDependentSelector(), ExistingDependentSelectorProps, MOCK_DEPENDENTS, PatientDetailsStep(), PatientDetailsStepProps, NewDependentInput (+5 more)

### Community 35 - "Community 35"
Cohesion: 0.32
Nodes (5): checkoutAction(), finalizeInvoiceAction(), finalizeInvoiceCommand(), createAuditLogCommand(), checkoutOrchestrator()

### Community 36 - "Community 36"
Cohesion: 0.31
Nodes (5): getStepTwoDataAction(), GetActiveDoctorsQueries, getActiveDoctorsQuery(), getDoctorsAction(), getDoctorsUseCase()

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (16): getAuthenticatedUser(), { mockGetAvailableDaysUseCase, mockGetDoctorsUseCase, mockGetServiceDuration }, BookingPage(), metadata, { mockSubmitBooking }, { mockSubmitBooking, mockGetServiceDuration }, createClient, createDependentAction() (+8 more)

### Community 38 - "Community 38"
Cohesion: 0.11
Nodes (22): AuditLogItem, DoctorCrudItem, INITIAL_DOCTORS, INITIAL_SERVICES, MOCK_AUDITS, ServiceCrudItem, useAdminDashboard(), UseAdminDashboardProps (+14 more)

### Community 39 - "Community 39"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (4): getStaffProfileUseCase(), getProfileByIdQuery(), StaffProfileQueries, terminateStaffUseCase()

### Community 41 - "Community 41"
Cohesion: 0.29
Nodes (8): ReviewStep(), ReviewAppointmentDetails(), ReviewContactDetails(), ReviewContactDetailsProps, ReviewPatientDetails(), StepPatientSelf(), StepPatientSelfProps, formatShortDate()

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (10): 🛠️ Phase 0: System Scaffolding & Shared Kernel UI, 🔐 Phase 1: Authentication & Account Access Flow, 🎨 Phase 2: Public Landing Experience & Marketing, 🗓️ Phase 3: Patient Booking Wizard (Booking Domain), 👤 Phase 4: Patient User Portal, 👩‍💼 Phase 5: Secretary Portal, 🩺 Phase 6: Doctor Portal, 👑 Phase 7: Clinic Admin & Configuration Portal (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.13
Nodes (10): AssignDoctorServicesDto, assignDoctorServicesSchema, assignDoctorServicesUseCase(), assignDoctorServicesCommand(), DoctorServicesCommands, mockDelete, mockEq, mockFrom (+2 more)

### Community 44 - "Community 44"
Cohesion: 0.20
Nodes (9): 1. Patient Login (`login.action.ts`), 2. Verify OTP / Resend OTP (`verify-otp.action.ts`), 3. Forgot Password Request (`request-password-reset.action.ts`), 4. Reset Password Execution (`reset-password.action.ts`), 5. Event Subscriber & Email Sender Documentation Mismatch, 6. Folder Naming Convention, 🛠️ Action Plan for Remediation, Codebase & Architecture Audit: Auth & Event Modules (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.12
Nodes (15): DashboardNotification, INITIAL_MOCK_NOTIFICATIONS, useUserDashboardSummary(), INITIAL_MOCK_NOTIFICATIONS, DashboardQuickActions(), DashboardQuickActionsProps, DashboardRecentNotifications(), DashboardRecentNotificationsProps (+7 more)

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (8): Issue Summary, Phase 1: Fix Service Step Rendering, Phase 2.5: Optimize Latency & Remove Slot Holding (Business Plan Alignment), Phase 2: Align Step 2 with Business Plan (Doctor Selection), Phase 3: Architectural Audit Fixes (V2 Compliance), Phase 4: End-to-End Verification, Task: Booking Flow Alignment & Service Fixes, To-Do List

### Community 47 - "Community 47"
Cohesion: 0.27
Nodes (6): appointmentDbSchema, AppointmentResponseDto, appointmentResponseSchema, GenerateSlotsParams, WorkingScheduleMonthItem, getExistingAppointmentsForMonthQuery()

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (9): 1. 🔴 Fix Sequential Waterfall in `getAvailableDays` (HIGH — ~100-300ms saved), 2. 🔴 Eliminate Duplicate `getServiceDuration` Calls (HIGH — ~50-100ms saved), 3. 🟡 Return Slots Map to Eliminate Date-Selection Round-Trip (MEDIUM — ~200-500ms saved per click), 4. 🟡 Add Server-Side Caching for Semi-Static Data (MEDIUM — ~200-500ms saved after first load), 5. 🟡 Fix Redundant Re-fetches on Doctor Change in Hook (MEDIUM — eliminates wasted requests), 7. 🟢 Optimize Date Object Allocations in Slot Generation (LOW — ~5-15ms saved), 8. 🟢 Verify Supabase Client Pooling (LOW — ~10ms saved), 🏎️ Booking Availability — Performance Improvements (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (16): ActivePatient, AvailableServiceItem, CLINIC_SERVICES, INITIAL_QUEUE, PatientHistoryRecord, ActiveSessionDiagnostics(), ActiveSessionDiagnosticsProps, DentalChartTimeline() (+8 more)

### Community 50 - "Community 50"
Cohesion: 0.17
Nodes (10): NotificationsView(), metadata, useNotifications(), NotificationData, NotificationItemCard(), NotificationItemCardProps, NotificationsEmptyState(), NotificationsEmptyStateProps (+2 more)

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
Cohesion: 0.20
Nodes (13): BookingFooterControls(), BookingFooterControlsProps, PendingBooking, cn(), FamilyGroupRow(), FamilyGroupRowProps, IndividualBookingRow(), IndividualBookingRowProps (+5 more)

### Community 58 - "Community 58"
Cohesion: 0.46
Nodes (3): useOTPVerifyView(), UseOTPVerifyViewReturn, OTPVerifyView()

### Community 59 - "Community 59"
Cohesion: 0.11
Nodes (16): CancelAppointmentModal(), CancelAppointmentModalProps, RescheduleBlockedModal(), RescheduleBlockedModalProps, useAppointmentDetail(), UseAppointmentDetailProps, AppointmentClinicalCard(), AppointmentClinicalCardProps (+8 more)

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
Cohesion: 0.31
Nodes (3): getPatientAppointmentsUseCase(), getAppointmentsByUserQuery(), PatientAppointmentsQueries

### Community 65 - "Community 65"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 66 - "Community 66"
Cohesion: 0.09
Nodes (23): useClickOutside(), useSecretaryDashboard(), metadata, BookingApprovalModal(), BookingApprovalModalProps, BookingRejectionModal(), BookingRejectionModalProps, ActiveInvoiceData (+15 more)

### Community 71 - "Community 71"
Cohesion: 0.20
Nodes (9): appointmentDbSchema, appointmentDoctorDbSchema, appointmentDoctorSchema, appointmentDtoSchema, appointmentPatientDbSchema, appointmentPatientSchema, appointmentServiceDbSchema, appointmentServiceSchema (+1 more)

### Community 86 - "Community 86"
Cohesion: 0.10
Nodes (19): Appointment Summary Section, CTA Button, Database RPC / Outbox Payload, Dependent Booking — Additional Fields:, Design Principle, Email Content Requirements, Email Template (`appointment-booked-email.tsx`), Footer (+11 more)

### Community 88 - "Community 88"
Cohesion: 0.28
Nodes (7): GeneratedSlot, AppointmentInput, generateAvailableSlotsForDay(), GeneratedSlot, GenerateSlotsParams, parseTimeToMs(), ScheduleInput

### Community 90 - "Community 90"
Cohesion: 0.21
Nodes (7): ClinicAppointmentsQueries, getAppointmentsByClinicQuery(), emptyStringToUndefined, GetClinicAppointmentsDto, getClinicAppointmentsSchema, getClinicAppointmentsUseCase(), mapAppointmentRecords()

### Community 94 - "Community 94"
Cohesion: 0.22
Nodes (8): getDoctorSchedulesQuery(), getServiceDurationQuery(), AppointmentBookingCommands, createAppointmentCommand(), executeBookingTransactionCommand(), submitBookingAction(), SubmitBookingDto, submitBookingUseCase()

### Community 96 - "Community 96"
Cohesion: 0.13
Nodes (14): Appointments Module, Appointments Module, Billing Module, Comprehensive Architecture Audit Checklist, Invalid File Naming Conventions, Invalid Layer Placement / Mock File Placement, Patients Module, Patients Module (+6 more)

### Community 98 - "Community 98"
Cohesion: 0.29
Nodes (6): mockEq, mockFrom, mockSelect, mockSingle, mockSupabase, mockUpdate

### Community 99 - "Community 99"
Cohesion: 0.10
Nodes (15): doctorScheduleDbSchema, DoctorScheduleResponseDto, doctorScheduleResponseSchema, GetAppointmentByIdDto, getAppointmentByIdSchema, CancelAppointmentDto, cancelAppointmentSchema, RequestRescheduleDto (+7 more)

### Community 100 - "Community 100"
Cohesion: 0.17
Nodes (14): BookingSuccessView(), BookingSuccessViewProps, DateTimeStep(), ReviewStepProps, createBookingPayload(), PayloadMapperParams, useBookingState(), BookingSlot (+6 more)

### Community 102 - "Community 102"
Cohesion: 0.33
Nodes (5): mockEq, mockFrom, mockMaybeSingle, mockSelect, mockSupabase

### Community 103 - "Community 103"
Cohesion: 0.13
Nodes (16): ServiceStep(), ServiceStepProps, UseUserBookingReturn, ServiceCard(), ServiceCardProps, formatPrice(), getEmoji(), CARD_SERVICES (+8 more)

### Community 104 - "Community 104"
Cohesion: 0.31
Nodes (6): getServicesAction(), mocks, getServicesUseCase(), getServicesQuery(), DEFAULT_CONFIG, HomePage()

### Community 105 - "Community 105"
Cohesion: 0.50
Nodes (3): SIDEBAR_LINKS, SidebarLink, UserSidebar()

### Community 106 - "Community 106"
Cohesion: 0.27
Nodes (7): AvailableSlotDto, emptyStringToUndefined, GetAvailableTimeSlotsDto, GetAvailableTimeSlotsResponseDto, getAvailableTimeSlotsResponseSchema, getAvailableTimeSlotsSchema, getAvailableTimeSlotsUseCase()

### Community 108 - "Community 108"
Cohesion: 0.20
Nodes (9): Overview, Phase 1: Sidebar & Navigation Updates, Phase 2: Patient Dashboard Refactor, Phase 3: My Appointments Page & Tabs, Phase 4: Notifications Hub Scaffold, Phase 5: Account Settings Consolidation, Phase 6: Verification, Task: Patient Portal Navigation & Layout Refactor (+1 more)

### Community 110 - "Community 110"
Cohesion: 0.22
Nodes (8): 1. Add Instant Loading State (`loading.tsx`), 2. Parallelize Data Fetching, 3. Optimize the Appointment Detail View Loading, 4. Optimize Server Action Connection Overhead, ⏳ In Progress, Overview, 📋 Proposed Tasks (No Caching), Task: Appointment Details Performance Improvements

### Community 111 - "Community 111"
Cohesion: 0.22
Nodes (8): 1. Predefined & Custom Cancellation Reasons, 2. Stale UI State and Re-cancellation Prevention (Details/Dashboard Views), 3. Status History Ledger Integration (Audit Trail), 4. Conflicting UI Banner logic for Appointments, 5. Rescheduling Flow Adjustments, 6. Audit & Edge Case Check for Booking Funnel, 7. Atomic Cancellation (Prevent Multiple Cancellations), Appointment Module Bugfix & Enhancement Checklist

### Community 112 - "Community 112"
Cohesion: 0.07
Nodes (25): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+17 more)

### Community 114 - "Community 114"
Cohesion: 0.28
Nodes (7): ContactSection(), ContactSectionProps, ClinicConfigResponseDto, ClinicConfigForm(), ClinicConfigFormProps, FooterProps, AdminDashboardViewProps

### Community 115 - "Community 115"
Cohesion: 0.48
Nodes (3): getAppointmentByIdAction(), { mockGetUseCase }, getAppointmentByIdUseCase()

### Community 118 - "Community 118"
Cohesion: 0.25
Nodes (6): mockAddToast, mockGet, Toast, ToastContext, ToastContextType, ToastProvider()

### Community 120 - "Community 120"
Cohesion: 0.40
Nodes (4): 1. Update Appointment Status, 2. Request Reschedule, 3. Submit Treatment, Non-Atomic Database Transaction Bugs

### Community 121 - "Community 121"
Cohesion: 0.40
Nodes (4): Appointment Statuses & Ledger Implementation Tasks, Phase 1: Database Schema Updates (Completed), Phase 2: Architectural Refactoring (Completed), Phase 3: "Hold and Swap" Reschedule Pattern (Completed)

### Community 122 - "Community 122"
Cohesion: 0.50
Nodes (3): 📋 Done, ⏳ In Progress, Task: Patient Portal Backend Database Integration & Clean Architecture

### Community 125 - "Community 125"
Cohesion: 0.40
Nodes (4): metadata, useToast(), useDoctorDashboard(), DoctorDashboardView()

## Knowledge Gaps
- **525 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+520 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient` connect `Community 37` to `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 8`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 21`, `Community 23`, `Community 31`, `Community 35`, `Community 36`, `Community 52`, `Community 94`, `Community 104`, `Community 115`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `DomainError` connect `Community 21` to `Community 3`, `Community 4`, `Community 36`, `Community 35`, `Community 37`, `Community 8`, `Community 6`, `Community 43`, `Community 14`, `Community 47`, `Community 16`, `Community 17`, `Community 115`, `Community 22`, `Community 25`, `Community 94`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 57` to `Community 1`, `Community 34`, `Community 3`, `Community 100`, `Community 66`, `Community 38`, `Community 103`, `Community 10`, `Community 12`, `Community 45`, `Community 15`, `Community 49`, `Community 114`, `Community 50`, `Community 23`, `Community 24`, `Community 58`, `Community 59`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _525 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05348101265822785 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06398809523809523 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.1010752688172043 - nodes in this community are weakly interconnected._