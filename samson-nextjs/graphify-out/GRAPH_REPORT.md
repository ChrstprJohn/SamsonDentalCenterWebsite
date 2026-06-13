# Graph Report - samson-nextjs  (2026-06-13)

## Corpus Check
- 522 files · ~144,159 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1442 nodes · 3115 edges · 98 communities (80 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `752ac2ac`
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
- [[_COMMUNITY_Community 98|Community 98]]

## God Nodes (most connected - your core abstractions)
1. `createClient` - 70 edges
2. `DomainError` - 63 edges
3. `authorizeRole()` - 48 edges
4. `getAuthenticatedUser()` - 34 edges
5. `AppointmentDto` - 30 edges
6. `ServiceResponseDto` - 30 edges
7. `useToast()` - 25 edges
8. `Button()` - 25 edges
9. `getClinicConfigAction()` - 24 edges
10. `2. Appointments Module Tests` - 23 edges

## Surprising Connections (you probably didn't know these)
- `submitBookingAction()` --calls--> `addDependentCommand()`  [INFERRED]
  src/modules/appointments/actions/booking/submit-booking.action.ts → src/modules/patients/repositories/dependents/patient-dependents.commands.ts
- `ServiceStepProps` --references--> `ServiceResponseDto`  [EXTRACTED]
  src/modules/appointments/components/booking/service-step.tsx → src/modules/services/dtos/management/service-response.dto.ts
- `UseUserBookingReturn` --references--> `ServiceResponseDto`  [EXTRACTED]
  src/modules/appointments/hooks/booking/use-user-booking.ts → src/modules/services/dtos/management/service-response.dto.ts
- `AuthenticatedUserHeaderProps` --references--> `AuthHeaderUser`  [EXTRACTED]
  src/modules/patients/components/auth/authenticated-user-header.tsx → src/modules/patients/hooks/auth/header/use-auth-header.hook.ts
- `AuthenticatedUserHeader()` --calls--> `getInitials()`  [INFERRED]
  src/modules/patients/components/auth/authenticated-user-header.tsx → src/modules/patients/hooks/auth/header/use-auth-header.hook.spec.ts

## Import Cycles
- None detected.

## Communities (98 total, 18 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (36): appointmentDbSchema, AppointmentResponseDto, appointmentResponseSchema, GeneratedSlot, GenerateSlotsParams, WorkingScheduleMonthItem, doctorScheduleDbSchema, DoctorScheduleResponseDto (+28 more)

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (8): ServiceCard(), ServiceCardProps, formatPrice(), getEmoji(), ServicesSection(), ServicesSectionProps, serviceDbSchema, serviceResponseSchema

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (40): FinalizeInvoiceDto, finalizeInvoiceSchema, FinalizeInvoiceUseCase, GenerateInvoiceDto, GenerateInvoiceSchema, GenerateInvoiceUseCase, GetInvoicesDto, GetInvoicesSchema (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (14): loginCommand(), LoginInput, loginSchema, LoginForm(), LoginFormProps, useLoginForm(), mockAddToast, mockPush (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (22): createStaffAction(), terminateStaffAction(), updateStaffAction(), authorizeRole(), ROLE_HIERARCHY, logoutAction(), { mockSubmitBooking }, { mockSubmitBooking, mockGetServiceDuration } (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (23): createServiceAction(), mocks, CreateServiceDto, createServiceSchema, createServiceUseCase(), deleteServiceAction(), mocks, deleteServiceUseCase() (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (21): mockFrom, mockInsert, mockSelect, mockSingle, mockSupabase, getAuditLogsQuery(), mockEq, mockFrom (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (13): CreateDependentDto, createDependentSchema, DependentRelationship, dependentRelationshipEnum, CreateDependentUseCase, dependentProfileSchema, mapDependentProfile(), MaybeRecord (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (16): getAvailableDaysAction(), { mockGetAvailableDays }, { mockGetAvailableDaysUseCase, mockGetServiceDuration }, getAvailableDaysSchema, getAvailableDaysUseCase(), getAvailableTimeSlotsAction(), { mockGetAvailableTimeSlots }, { mockGetAvailableTimeSlotsUseCase, mockGetServiceDuration } (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (35): dependencies, @hookform/resolvers, next, react, react-dom, react-email, @react-email/components, react-hook-form (+27 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (21): RescheduleBlockedModal(), RescheduleBlockedModalProps, AboutSection(), ContactSection(), ContactSectionProps, GallerySection(), HeroSection(), HeroSectionProps (+13 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (8): capitalize(), isDefined(), getErrorMessage(), isError(), omit(), sleep(), slugify(), generateId()

### Community 12 - "Community 12"
Cohesion: 0.05
Nodes (38): ClinicAppointmentsQueries, emptyStringToUndefined, GetClinicAppointmentsDto, getClinicAppointmentsSchema, GetClinicAppointmentsUseCase, AppointmentHistory(), AppointmentHistoryProps, CancelAppointmentModal() (+30 more)

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (14): DateTimeStep(), DateTimeStepProps, useBookingData(), GetActiveDoctorsQueries, getActiveDoctorsQuery(), GetAllUsersDto, getAllUsersSchema, UserProfileResponseDto (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (14): getServicesByIdsQuery(), servicePerformedSchema, SubmitTreatmentDto, submitTreatmentSchema, mockFrom, mockIn, mockSelect, mockSupabase (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.32
Nodes (8): AuthHeaderUser, UseAuthHeaderReturn, DAY_NAMES, DEFAULT_HOURS, Footer(), NAV_ITEMS, Navbar(), NavbarProps

### Community 16 - "Community 16"
Cohesion: 0.06
Nodes (32): resendAuthOtpCommand(), verifyOtpCommand(), checkUserExistsQuery(), ResendOtpDeps, resendOtpUseCase(), resendOtpAction(), verifyOtpAction(), VerifyOtpInput (+24 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (15): getAuthenticatedUser(), AppointmentStatusCommands, AppointmentStatusValue, getAppointmentByIdQuery(), incrementUserCredibilityMetricCommand(), updateStatusCommand(), cancelAppointmentAction(), { mockUpdateStatus } (+7 more)

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (10): getServiceByIdAction(), mocks, getServiceByIdUseCase(), getServiceByIdQuery(), mockEq, mockFrom, mockMaybeSingle, mockOrder (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.06
Nodes (33): 1. Staff Module Tests, 2. Appointments Module Tests, 3. UI View Tests, 4. Services Module Tests, [ ] `src/modules/appointments/components/booking/date-time-step.spec.tsx` (New), [ ] `src/modules/appointments/dtos/availability/appointment-response.dto.spec.ts` (New), [ ] `src/modules/appointments/dtos/availability/doctor-schedule-response.dto.spec.ts` (New), [ ] `src/modules/appointments/hooks/booking/use-booking-data.spec.ts` (Update) (+25 more)

### Community 20 - "Community 20"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (9): loginAction(), loginUseCase(), createDependentAction(), DomainError, NotFoundError, UnauthorizedError, ValidationError, assignDoctorServicesAction() (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (9): ProfileDetailsForm(), ProfileDetailsFormProps, ProfilePreferencesForm(), ProfilePreferencesFormProps, InitialUser, useProfileSettingsView(), metadata, ProfileSettingsView() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (13): metadata, AuditRecord, DraftInvoice, EmailLog, INITIAL_AUDITS, INITIAL_DRAFTS, INITIAL_EMAILS, INITIAL_PENDING (+5 more)

### Community 25 - "Community 25"
Cohesion: 0.17
Nodes (4): StaffProfileCommands, TerminateStaffUseCase, UpdateStaffDto, UpdateStaffUseCase

### Community 26 - "Community 26"
Cohesion: 0.12
Nodes (16): 🚨 Architecture Audit Fixes (Completed), ✅ DONE (Completed Tasks), 💡 Next Steps Guide:, ✅ Phase 1: Shared Core (Global Kernel) - COMPLETED, ✅ Phase 2: Patients Domain (Backend) - COMPLETED, ✅ Phase 3: Staff Domain (Backend) - COMPLETED, ✅ Phase 4: Appointments Domain (Backend) - COMPLETED, Phase 5: Services & Clinic Config Domain (+8 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (16): 1. `clinic-config` Module, 2. `audit-logs` Module, 3. `services` Module, 4. `staff` Module, 5. `patients` Module, 6. `appointments` Module, 7. `billing` Module, Functional & Zod Pipeline Refactoring Checklist (+8 more)

### Community 28 - "Community 28"
Cohesion: 0.20
Nodes (10): BookingFooterControls(), BookingFooterControlsProps, BookingProgressTabs(), BookingProgressTabsProps, BookingSuccessView(), PatientDetailsStep(), ReviewStep(), ServiceStep() (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.26
Nodes (6): createStaffSchema, StaffRoleEnum, mapStaffProfile(), MaybeRecord, staffProfileSchema, updateStaffSchema

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (5): DeactivateUserDto, deactivateUserSchema, DeactivateUserUseCase, deactivateUserCommand(), UserManagementCommands

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (6): mockEq, mockFrom, mockSelect, mockSingle, mockSupabase, mockUpdate

### Community 32 - "Community 32"
Cohesion: 0.18
Nodes (8): geistMono, geistSans, metadata, Theme, ThemeContext, ThemeContextType, ThemeProvider(), ToastProvider()

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (18): updateClinicConfigCommand(), clinicConfigAppSchema, clinicConfigDbSchema, clinicConfigResponseSchema, operatingDayDbSchema, operatingDaySchema, operatingHoursDbSchema, operatingHoursSchema (+10 more)

### Community 34 - "Community 34"
Cohesion: 0.30
Nodes (9): AddDependentModal(), AddDependentModalProps, ExistingDependentSelector(), ExistingDependentSelectorProps, MOCK_DEPENDENTS, PatientDetailsStepProps, NewDependentInput, DependentProfileDto (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.32
Nodes (5): checkoutAction(), finalizeInvoiceAction(), finalizeInvoiceCommand(), createAuditLogCommand(), checkoutOrchestrator()

### Community 36 - "Community 36"
Cohesion: 0.20
Nodes (10): AuthenticatedUserHeader(), AuthenticatedUserHeaderProps, NAV_LINKS, NotificationIndicator(), NotificationIndicatorProps, getInitials(), useAuthHeader(), useClickOutside() (+2 more)

### Community 37 - "Community 37"
Cohesion: 0.21
Nodes (10): BookingPage(), metadata, getUserDependentsAction(), getServicesAction(), mocks, getServicesUseCase(), getServicesQuery(), DEFAULT_CONFIG (+2 more)

### Community 38 - "Community 38"
Cohesion: 0.31
Nodes (7): Toast, ToastContext, ToastContextType, useToast(), useLandingView(), UseLandingViewProps, LandingView()

### Community 39 - "Community 39"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (3): GetStaffProfileUseCase, getProfileByIdQuery(), StaffProfileQueries

### Community 41 - "Community 41"
Cohesion: 0.42
Nodes (7): BookingSuccessViewProps, ReviewStepProps, createBookingPayload(), PayloadMapperParams, BookingSlot, ServiceResponseDto, calculateEndTimeFromIso()

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (10): 🛠️ Phase 0: System Scaffolding & Shared Kernel UI, 🔐 Phase 1: Authentication & Account Access Flow, 🎨 Phase 2: Public Landing Experience & Marketing, 🗓️ Phase 3: Patient Booking Wizard (Booking Domain), 👤 Phase 4: Patient User Portal, 👩‍💼 Phase 5: Secretary Portal, 🩺 Phase 6: Doctor Portal, 👑 Phase 7: Clinic Admin & Configuration Portal (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.15
Nodes (9): AssignDoctorServicesDto, AssignDoctorServicesUseCase, assignDoctorServicesCommand(), DoctorServicesCommands, mockDelete, mockEq, mockFrom, mockInsert (+1 more)

### Community 44 - "Community 44"
Cohesion: 0.20
Nodes (9): 1. Patient Login (`login.action.ts`), 2. Verify OTP / Resend OTP (`verify-otp.action.ts`), 3. Forgot Password Request (`request-password-reset.action.ts`), 4. Reset Password Execution (`reset-password.action.ts`), 5. Event Subscriber & Email Sender Documentation Mismatch, 6. Folder Naming Convention, 🛠️ Action Plan for Remediation, Codebase & Architecture Audit: Auth & Event Modules (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.36
Nodes (5): useBookingState(), BookingStep, useUserBooking(), UseUserBookingReturn, BookingView()

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (8): Issue Summary, Phase 1: Fix Service Step Rendering, Phase 2.5: Optimize Latency & Remove Slot Holding (Business Plan Alignment), Phase 2: Align Step 2 with Business Plan (Doctor Selection), Phase 3: Architectural Audit Fixes (V2 Compliance), Phase 4: End-to-End Verification, Task: Booking Flow Alignment & Service Fixes, To-Do List

### Community 47 - "Community 47"
Cohesion: 0.06
Nodes (29): SignUpInput, signUpSchema, SignUpForm(), SignUpFormProps, outboxCommands(), OutboxEvent, GetPatientProfileUseCase, createPatientCommand() (+21 more)

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (9): 1. 🔴 Fix Sequential Waterfall in `getAvailableDays` (HIGH — ~100-300ms saved), 2. 🔴 Eliminate Duplicate `getServiceDuration` Calls (HIGH — ~50-100ms saved), 3. 🟡 Return Slots Map to Eliminate Date-Selection Round-Trip (MEDIUM — ~200-500ms saved per click), 4. 🟡 Add Server-Side Caching for Semi-Static Data (MEDIUM — ~200-500ms saved after first load), 5. 🟡 Fix Redundant Re-fetches on Doctor Change in Hook (MEDIUM — eliminates wasted requests), 7. 🟢 Optimize Date Object Allocations in Slot Generation (LOW — ~5-15ms saved), 8. 🟢 Verify Supabase Client Pooling (LOW — ~10ms saved), 🏎️ Booking Availability — Performance Improvements (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (7): metadata, ActivePatient, AvailableServiceItem, CLINIC_SERVICES, DoctorDashboardView(), INITIAL_QUEUE, PatientHistoryRecord

### Community 50 - "Community 50"
Cohesion: 0.13
Nodes (17): AdminPortalLayout(), AdminDashboardPage(), DEFAULT_CONFIG, metadata, BookingLayout(), DoctorPortalLayout(), MarketingLayout(), getPatientAppointmentsAction() (+9 more)

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (7): 1. Authentication & Users Domain, 2. Dependents Domain, 3. Appointments & Booking Domain (Most Complex), 4. Clinic Config & Services Domain, 5. Billing & Clinical Treatment Domain, 6. Audit Logs Domain, 🔄 Phase 8: Mock Swap & Schema Alignment Checklist

### Community 52 - "Community 52"
Cohesion: 0.46
Nodes (3): updateDoctorScheduleAction(), DoctorScheduleDto, upsertScheduleCommand()

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
Cohesion: 0.32
Nodes (6): CreateStaffDto, CreateStaffUseCase, createStaffCommand(), terminateStaffCommand(), updateStaffCommand(), StaffProfileDto

### Community 58 - "Community 58"
Cohesion: 0.46
Nodes (3): useOTPVerifyView(), UseOTPVerifyViewReturn, OTPVerifyView()

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
Cohesion: 0.18
Nodes (7): assignDoctorServicesSchema, TerminateStaffDto, terminateStaffSchema, DayOfWeekEnum, DayOfWeekMap, doctorScheduleSchema, timeStringSchema

### Community 65 - "Community 65"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (5): mockEq, mockFrom, mockMaybeSingle, mockSelect, mockSupabase

## Knowledge Gaps
- **391 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+386 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient` connect `Community 4` to `Community 33`, `Community 98`, `Community 35`, `Community 37`, `Community 5`, `Community 8`, `Community 13`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 50`, `Community 52`, `Community 21`, `Community 23`, `Community 59`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `DomainError` connect `Community 21` to `Community 0`, `Community 35`, `Community 4`, `Community 6`, `Community 8`, `Community 43`, `Community 14`, `Community 47`, `Community 16`, `Community 17`, `Community 52`, `Community 57`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 10` to `Community 1`, `Community 34`, `Community 3`, `Community 12`, `Community 47`, `Community 15`, `Community 49`, `Community 23`, `Community 24`, `Community 58`, `Community 28`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _391 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.053763440860215055 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.052531645569620256 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12807881773399016 - nodes in this community are weakly interconnected._