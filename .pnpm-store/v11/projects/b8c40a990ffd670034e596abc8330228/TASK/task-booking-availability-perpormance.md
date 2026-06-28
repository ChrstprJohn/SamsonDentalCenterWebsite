# 🏎️ Booking Availability — Performance Improvements

> **Goal:** Reduce appointment availability load time from ~1-3s to <500ms  
> **Status:** Not Started  
> **Affected Module:** `src/modules/appointments/`

---

## Checklist

### 1. 🔴 Fix Sequential Waterfall in `getAvailableDays` (HIGH — ~100-300ms saved)

**File:** `src/modules/appointments/use-cases/availability/get-available-days.use-case.ts`

**Problem:** `getExistingAppointmentsForMonth` runs AFTER `getServiceDuration` + `getWorkingSchedulesForMonth` finish, even though it doesn't depend on their results. This creates a sequential waterfall — the appointments query waits idle while schedules load.

**Steps:**
- [x] Move `getExistingAppointmentsForMonth` into the existing `Promise.all` at line 35-38
- [x] Change the `Promise.all` from `[duration, schedules]` to `[duration, schedules, appointments]`
- [x] Remove the separate `if (canUseInMemory)` block that fetches appointments (lines 53-55)
- [x] Handle the case where `getExistingAppointmentsForMonth` is undefined — use `?? Promise.resolve([])` fallback
- [x] Adjust the `canUseInMemory` check since appointments are now pre-fetched regardless
- [x] Update the unit test `get-available-days.use-case.spec.ts` to verify all 3 queries fire in parallel

---

### 2. 🔴 Eliminate Duplicate `getServiceDuration` Calls (HIGH — ~50-100ms saved)

**Files:**
- `src/modules/appointments/actions/availability/get-step-two-data.action.ts`
- `src/modules/appointments/use-cases/availability/get-available-days.use-case.ts`
- `src/modules/appointments/use-cases/availability/get-available-time-slots.use-case.ts`

**Problem:** Two separate `getServiceDurationQuery(supabase)` instances are created at lines 30 and 37 of the action. Both hit Supabase for the exact same `serviceId`. Inside `getAvailableDays`, `getServiceDuration` is called again independently.

**Steps:**
- [x] In `get-step-two-data.action.ts`: Fetch service duration ONCE at the top: `const duration = await getServiceDurationQuery(supabase)(validData.serviceId)`
- [x] Update `getAvailableDaysUseCase` interface to accept a resolved `duration: number` instead of `getServiceDuration` function
- [x] Update `getAvailableTimeSlotsUseCase` interface to accept a resolved `duration: number` instead of `getServiceDuration` function
- [x] Remove `getServiceDuration` from both use-case dependency objects
- [x] Update use-case internals to use the passed `duration` directly instead of awaiting a function
- [x] Update unit tests for both use cases to pass `duration` as a number
- [x] Remove the now-unused `getServiceDurationQuery` import from the action if no longer needed there

---

### 3. 🟡 Return Slots Map to Eliminate Date-Selection Round-Trip (MEDIUM — ~200-500ms saved per click)

**Files:**
- `src/modules/appointments/use-cases/availability/get-available-days.use-case.ts`
- `src/modules/appointments/dtos/availability/` (DTOs)
- `src/modules/appointments/actions/availability/get-step-two-data.action.ts`
- `src/modules/appointments/hooks/booking/use-booking-data.ts`

**Problem:** `getAvailableDays` computes time slots for every day of the month but throws them away — only keeping `slots.length > 0`. When user clicks a date, `getAvailableTimeSlotsAction` makes 3 MORE Supabase calls to recompute the same slots.

**Steps:**
- [x] Create a new DTO type: `AvailabilityMapDto = Record<string, AvailableSlotDto[]>` mapping date → slots
- [x] Update `GetAvailableDaysResponseDto` to include `availabilityMap` alongside `availableDates`
- [x] In `getAvailableDaysUseCase`: Instead of just `availableDates.push(date)`, also store the computed slots in a map
- [x] Return both `availableDates: string[]` (for calendar highlighting) and `availabilityMap` (for instant slot display)
- [x] In `get-step-two-data.action.ts`: Pass the `availabilityMap` through the response
- [x] In `use-booking-data.ts`: Store the `availabilityMap` in state
- [x] In `use-booking-data.ts`: When `selectedDate` changes, look up slots from the cached map FIRST before calling the server action
- [x] Only call `getAvailableTimeSlotsAction` as a fallback if the date isn't in the map (e.g., user navigated to a different month)
- [x] Update unit tests for the use case and hook

---

### 4. 🟡 Add Server-Side Caching for Semi-Static Data (MEDIUM — ~200-500ms saved after first load)

**Files:**
- `src/modules/appointments/repositories/availability/get-service-duration.queries.ts`
- `src/modules/appointments/repositories/availability/get-working-schedules-for-month.queries.ts`
- `src/modules/staff/repositories/` (active doctors query)

**Problem:** Zero caching anywhere in the pipeline. Service duration, doctor schedules (recurring patterns), and active doctors list rarely change but are fetched fresh on every single request.

**Steps:**
- [x] Determine Next.js version to choose caching strategy (`unstable_cache` for v14, `use cache` for v15+)
- [x] Wrap `getServiceDurationQuery` result with cache — revalidate every 1 hour (duration rarely changes) (Disabled for now)
- [x] Wrap `getWorkingSchedulesForMonthQuery` result with cache — revalidate every 5 minutes (schedules change occasionally) (Disabled for now)
- [x] Wrap `getActiveDoctorsQuery` result with cache — revalidate every 5 minutes (Disabled for now)
- [x] Add cache tags so we can manually invalidate when admin updates schedules/services (Disabled for now)
- [ ] Test that cache invalidation works correctly when data is updated via admin panel

---

### 5. 🟡 Fix Redundant Re-fetches on Doctor Change in Hook (MEDIUM — eliminates wasted requests)

**File:** `src/modules/appointments/hooks/booking/use-booking-data.ts`

**Problem:** When `selectedDoctorId` changes, the first `useEffect` (line 20) re-fetches the ENTIRE step-two data including the doctors list, which hasn't changed. Also, both `useEffect` blocks fire simultaneously on doctor change, causing race conditions and wasted requests.

**Steps:**
- [x] Split doctors fetch into its own `useEffect` that only depends on `selectedServiceId` (NOT `selectedDoctorId`)
- [x] Keep availability fetch in a separate `useEffect` that depends on `selectedServiceId`, `selectedDoctorId`, and `currentStep`
- [x] Add `AbortController` to cancel stale requests when dependencies change rapidly
- [x] Consider adding a debounce (~200ms) on doctor selection changes to avoid rapid-fire requests
- [x] Update the hook's unit tests to verify doctors aren't re-fetched on doctor change

---


---

### 7. 🟢 Optimize Date Object Allocations in Slot Generation (LOW — ~5-15ms saved)

**File:** `src/modules/appointments/utils/availability.utils.ts`

**Problem:** The while loop creates a new `Date` object on every iteration (line 52), plus multiple string checks (`.includes(':')`, `.length === 5`) and string concatenations for time parsing on every schedule entry.

**Steps:**
- [x] Pre-compute `dayStart`, `dayEnd`, `breakStart`, `breakEnd` as millisecond timestamps once
- [x] Replace the while loop to use numeric arithmetic (`for (let t = startMs; t + durationMs <= endMs; t += durationMs)`)
- [x] Only create `Date` objects at the end when building the result array (for `.toISOString()`)
- [x] Pre-parse appointment times to milliseconds before the loop instead of inside `.some()` callback
- [x] Extract the time-string normalization logic into a helper function to reduce code duplication

---

### 8. 🟢 Verify Supabase Client Pooling (LOW — ~10ms saved)

**File:** `src/shared/database/server.ts`

**Problem:** `createClient()` is called on every action invocation. If it creates a fresh connection each time, there's unnecessary overhead.

**Steps:**
- [x] Review `createClient()` implementation to confirm it uses connection pooling or singleton pattern
- [x] If not pooled, refactor to reuse the client within a request lifecycle
- [x] Verify no connection leaks occur under concurrent requests
