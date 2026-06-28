# Task: Secretary Portal - Doctor Schedule Management Page

Implementing Doctor Schedule Management page at `/secretary/schedules` adhering strictly to 3-layer scheduling architecture and system coding guidelines.

---

## 🗄️ 1. Database & Server Actions (Backend)

- [x] **Database Setup & Schema Validation**:
  - [x] Update `clinic_config.operating_hours` schema to include optional day-level `break_start_time` and `break_end_time` (24h format HH:MM).
  - [x] Create table `time_blocks` (Layer 3 Exceptions):
    - `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
    - `doctor_id`: UUID REFERENCES users(id) ON DELETE CASCADE NULL (null = Clinic-wide block)
    - `date`: DATE NOT NULL
    - `start_time`: TIME NOT NULL (or default to '00:00' for All Day)
    - `end_time`: TIME NOT NULL (or default to '23:59' for All Day)
    - `reason`: TEXT NOT NULL (minimum 3 characters)
    - `created_at`: TIMESTAMPTZ DEFAULT now()
    - `updated_at`: TIMESTAMPTZ DEFAULT now()
    - `created_by`: UUID REFERENCES users(id) ON DELETE SET NULL
  - [x] Add indexes on `time_blocks(doctor_id, date)` and `doctor_schedules(doctor_id, day_of_week)`.

- [x] **Next.js Server Actions (`src/modules/clinic-config/actions/` & `src/modules/doctors/actions/`)**:
  - [x] `update-global-hours.action.ts`:
    - Validates parameters using Zod.
    - Saves fallback baseline clinic hours and default breaks.
    - Standardized return format: `{ success: boolean, message?: string }`.
  - [x] `update-doctor-weekly-schedule.action.ts`:
    - Modifies standard weekly routine in `doctor_schedules`.
    - Handles custom shift configuration toggle (`is_custom`).
    - Implements bulk clone action: clones one weekday's hours to selected weekdays.
    - Implements revert action: deletes doctor schedule overrides to fallback to baseline.
  - [x] `create-time-block.action.ts`:
    - Validates date is present/future, start_time < end_time, and reason is not empty.
    - Writes exclusion record.
  - [x] `revoke-time-block.action.ts`:
    - Deletes target exclusion record by ID.

---

## 🎨 2. Component & Hook Architecture (Frontend)

- [x] **RSC Data Hydration (No useEffect On-Mount Fetching)**:
  - Route: `src/app/(portals)/secretary/schedules/page.tsx`
  - [x] Queries on Server: Active doctors, global clinic config, doctor schedules table, and active/upcoming `time_blocks`.
  - [x] Maps snake_case database fields to camelCase TypeScript interfaces.
  - [x] Passes serialized data as standard props to the client view orchestrator.

- [x] **Dumb Presentational Components (`src/modules/doctors/components/schedules/`)**:
  - *Rules: kebab-case.tsx, named PascalCase exports, under 150 lines per file.*
  - [x] `schedule-tabs.tsx`: Handles UI state for active tab selection.
  - [x] `global-hours-tab.tsx`: Displays Monday–Sunday table, toggles, time pickers, "Copy to Weekdays" action, and confirmation-protected save button.
  - [x] `doctor-weekly-shifts-tab.tsx`: Searchable doctor dropdown + roster cards.
    - Day cards toggle between `🟢 Inheriting Baseline` and `⭐ Custom Override` states.
    - Displays custom time/break inputs when unlocked via `Edit Custom`.
    - Dropdown menu for `Clone schedule to other days`.
  - [x] `time-exclusions-tab.tsx`: Split-screen grid layout.
    - Left side: Dumb form for adding schedule blocks (conditional doctor selection list, All Day checkbox, reason textarea).
    - Right side: Searchable list/table of active and upcoming exclusions with delete/revoke action triggers.

- [x] **State & Form Validation Hooks (`src/modules/doctors/hooks/schedules/`)**:
  - [x] `use-global-hours-form.ts`: Hook for Tab 1 validation matching `GlobalClinicHour` props. (Reused updateClinicConfigAction directly).
  - [x] `use-doctor-shifts-form.ts`: Hook for Tab 2 overrides, custom settings, and cloning logic.
  - [x] `use-time-block-form.ts`: Hook for Tab 3 validation. Enforces conditional inputs (doctor selector only active if scope is "Specific Doctor").

---

## 🖥️ 3. Booking Engine & Availability Integrations

- [x] **Availability Layer Overhaul**:
  - [x] **Check Exclusions (Layer 3)**: If a date/time matches an active block in `time_blocks` (clinic-wide or doctor-specific), return unavailable.
  - [x] **Check Custom Shifts (Layer 2)**: Look up `doctor_schedules` for the doctor on that `day_of_week`. If it exists and `is_custom` is true, use it.
  - [x] **Check Global Hours (Layer 1)**: Fall back to `clinic_config.operating_hours` baseline.

---

## 🧪 4. Testing & Verification

- [x] **Unit Tests**:
  - [x] Write co-located tests for form validation hooks (e.g. `use-time-block-form.spec.ts`).
  - [x] Test availability resolution rules with mock data (updated DTO and query tests).
- [x] **Manual Verification**:
  - [x] Verify changing Tab 1 global hours changes availability for doctors inheriting baseline.
  - [x] Verify Tab 2 custom hours override the global baseline.
  - [x] Verify Tab 3 exclusions successfully block slots in scheduling workflows.

---

## 🔧 5. Bug Fixes & Hotfixes

- [x] **Database Casing Mismatch**: Preprocessed `operatingDayDbSchema` to support both camelCase (`isOpen`, `openTime`, etc.) and snake_case (`is_open`, `open_time`, etc.) properties to prevent UI and scheduler fallback parse failures.
- [x] **RLS Table Selection Block**: Updated layout server actions, schedules pages, and availability queries to fetch public `clinic_config` information through `createAdminClient()`, bypassing anon RLS limitations (PGRST116).
- [x] **Clinician Shifts Display Fallback**: Replaced hardcoded default shift fallbacks in the Doctor Management detail view (`doctor-read-pane.tsx` / `secretary/doctors/page.tsx`) with resolved 7-day schedules that inherit the actual global clinic operating hours baseline.
- [x] **Time Exclusion Timezone Shift**: Appended `Z` timezone specifier when parsing `time_blocks` (Layer 3 Exceptions) start and end times in `get-existing-appointments.queries.ts` and `get-existing-appointments-for-month.queries.ts`, matching the UTC timezone used in booking slot generation to prevent off-by-timezone slot leakage (e.g. 4 PM slots remaining open).
