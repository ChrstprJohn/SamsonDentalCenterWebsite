# Functional & Zod Pipeline Refactoring Checklist

This checklist tracks the migration from the legacy OOP/manual mapper architecture to the new Functional/Zod `.transform()` architecture across all modules.

## Handoff Snapshot

### Last Completed
- Completed **Phase 1: Shared Core & Simple Modules** for `clinic-config`, `audit-logs`, and `services`.
- Replaced manual response mappers with Zod `.transform()` schemas in:
  - `clinic-config/dtos/settings/get-clinic-config.dto.ts`
  - `audit-logs/dtos/logs/audit-log-response.dto.ts`
  - `services/dtos/management/service-response.dto.ts`
- Refactored Phase 1 repositories from class-based OOP to functional command/query closures.
- Refactored Phase 1 use-cases from classes to functional DI closures.
- Updated Phase 1 server actions to instantiate functional repositories/use-cases.
- Updated related specs and fixed stale `services` fixtures that were missing `serviceType`.

### Verification Completed
- `.\node_modules\.bin\tsc.CMD --noEmit` passed.
- `.\node_modules\.bin\vitest.CMD run` passed.
- Full test result at handoff: `138` test files passed, `366` tests passed.

### Next Up
- Continue with **Phase 2: `staff` Module**.
- Initial scan showed old class/manual mapper patterns remain in:
  - `staff/dtos/profile/staff-profile.dto.ts` (`mapStaffProfile`)
  - `staff/repositories/profile/staff-profile.commands.ts`
  - `staff/repositories/profile/staff-profile.queries.ts`
  - `staff/repositories/schedule/staff-schedule.commands.ts`
  - `staff/repositories/management/user-management.commands.ts`
  - `staff/repositories/management/user-management.queries.ts`
  - `staff/repositories/management/doctor-services.commands.ts`
  - all `staff/use-cases/**`
  - `staff/actions/admin/**`, `staff/actions/doctor/**`, and `staff/actions/management/**`
- After `staff`, continue with `patients`, then `appointments`, then `billing`.
- Leave existing `.CORE_DOCUMENTATION` worktree changes alone unless explicitly requested; they pre-existed this refactor commit.

## Phase 1: Shared Core & Simple Modules
These modules are smaller or foundational, making them good starting points to establish the pattern.

### 1. `clinic-config` Module
- [x] **DTOs**: Rewrite `get-clinic-config.dto.ts` to use `.transform()` instead of `mapClinicConfigRecord`. Update `.spec.ts`.
- [x] **Repositories**: Refactor `clinic-config.queries.ts` and `clinic-config.commands.ts` to functional closures. Ensure they `.parse()` results using the new Zod schema.
- [x] **Use Cases**: Refactor `get-clinic-config.use-case.ts` and `update-clinic-config.use-case.ts` to functional closures.
- [x] **Server Actions**: Update all server actions in `clinic-config/actions/` to use functional DI.

### 2. `audit-logs` Module
- [x] **DTOs**: Rewrite `audit-log-response.dto.ts` to use `.transform()` instead of `mapAuditLogRecord`. Update `.spec.ts`.
- [x] **Repositories**: Refactor `audit-log.queries.ts` and `audit-log.commands.ts` to functional closures.
- [x] **Use Cases**: Refactor `get-audit-logs.use-case.ts` and `create-audit-log.use-case.ts` to functional closures.
- [x] **Server Actions**: Update all server actions in `audit-logs/actions/` to use functional DI.

### 3. `services` Module
- [x] **DTOs**: Rewrite `service-response.dto.ts` to use `.transform()` instead of `mapServiceRecord`. Update `.spec.ts`.
- [x] **Repositories**: Refactor `service.queries.ts` and `service.commands.ts` to functional closures.
- [x] **Use Cases**: Refactor `create-service`, `get-services`, `get-service-by-id`, `update-service`, and `delete-service` use-cases to functional closures.
- [x] **Server Actions**: Update all server actions in `services/actions/` to use functional DI.

---

## Phase 2: Core Domain Entities
These modules contain the primary entities and have slightly more complex relationships.

### 4. `staff` Module
- [ ] **DTOs**: Rewrite `staff-profile.dto.ts` and related DTOs to use `.transform()`. Update `.spec.ts`.
- [ ] **Repositories**: Refactor `staff-profile`, `staff-schedule`, `user-management`, and `doctor-services` queries and commands to functional closures.
- [ ] **Use Cases**: Refactor all use-cases in `profile`, `schedule`, and `management` subfolders to functional closures.
- [ ] **Server Actions**: Update all server actions in `staff/actions/` to use functional DI.

### 5. `patients` Module
- [ ] **DTOs**: Rewrite `patient-profile.dto.ts` and `dependent-profile.dto.ts` to use `.transform()`. Update `.spec.ts`.
- [ ] **Repositories**: Refactor `patient-profile` and `patient-dependents` queries and commands to functional closures.
- [ ] **Use Cases**: Refactor all use-cases in `profile` and `dependents` subfolders to functional closures.
- [ ] **Server Actions**: Update all server actions in `patients/actions/` to use functional DI.

---

## Phase 3: High-Complexity Transactional Modules
These modules depend heavily on the other modules and manage complex state.

### 6. `appointments` Module
- [ ] **DTOs**: Rewrite all response DTOs in `booking`, `status`, `clinic`, `patient`, and `availability` to use `.transform()`. Update `.spec.ts`.
- [ ] **Repositories**: Refactor all command/query repositories in `appointments/repositories/` to functional closures.
- [ ] **Use Cases**: Refactor all use-cases in `appointments/use-cases/` to functional closures.
- [ ] **Server Actions**: Update all server actions in `appointments/actions/` to use functional DI.

### 7. `billing` Module
- [ ] **DTOs**: Rewrite `invoice-response.dto.ts` to use `.transform()`. Update `.spec.ts`.
- [ ] **Repositories**: Refactor `invoice.queries.ts` and `invoice.commands.ts` to functional closures.
- [ ] **Use Cases**: Refactor `generate-invoice`, `update-invoice`, `finalize-invoice`, and `get-invoices` use-cases to functional closures.
- [ ] **Server Actions**: Update all server actions in `billing/actions/` to use functional DI.

---

## Phase 4: Final Cleanup & Shared Logic
- [ ] **Global Utils Review**: Search `src/shared/utils/` for unused mapping helpers (`stringValue`, `numberValue`, `booleanValue`, `nullableStringValue`). Delete them if no longer referenced.
- [ ] **Cross-Module Orchestrators**: Verify that any orchestrators in `src/orchestrators/` successfully use the new functional DI patterns.
- [ ] **E2E / Integration Verification**: Run all test suites to confirm total system stability.
